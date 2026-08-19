import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { CustomerAutomationService } from './customer-automation-service';

export type SchedulerState = 'WAITING' | 'TRIGGERED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';

export interface ScheduledJob {
  jobId: string;
  organizationId: string;
  businessId: string;
  automationId: string;
  cronExpression: string;
  state: SchedulerState;
  nextRunAt: string;
  lastRunAt?: string;
  runCount: number;
  lastError?: string;
  createdAt: string;
}

export class AutomationScheduler {
  private jobs: ScheduledJob[] = [];

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private automationService: CustomerAutomationService,
    private notificationService?: CustomerNotificationService
  ) {}

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`AutomationScheduler: access denied for org '${organizationId}'.`);
    return dna;
  }

  /**
   * Register a scheduled automation trigger.
   */
  async scheduleAutomation(params: {
    organizationId: string;
    businessId: string;
    automationId: string;
    cronExpression?: string;
    actor: string;
  }): Promise<ScheduledJob> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const cronExpression = params.cronExpression ?? '0 9 * * *'; // Default 09:00 daily
    const jobId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Set next run at 1 second in future for deterministic testing/scheduling
    const nextRunAt = new Date(Date.now() + 1000).toISOString();

    const job: ScheduledJob = {
      jobId,
      organizationId: params.organizationId,
      businessId: params.businessId,
      automationId: params.automationId,
      cronExpression,
      state: 'WAITING',
      nextRunAt,
      runCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.push(job);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'AUTOMATION_SCHEDULED',
        jobId,
        automationId: params.automationId,
        cronExpression,
      },
    });

    return job;
  }

  /**
   * Scan active jobs and trigger due automations via CustomerAutomationService.
   */
  async triggerDueAutomations(actor: string = 'system_scheduler'): Promise<ScheduledJob[]> {
    const now = new Date().toISOString();
    const dueJobs = this.jobs.filter((j) => j.state === 'WAITING' && j.nextRunAt <= now);

    const processed: ScheduledJob[] = [];

    for (const job of dueJobs) {
      try {
        job.state = 'TRIGGERED';

        await this.auditRepo.logEvent({
          organizationId: job.organizationId,
          businessId: job.businessId,
          action: 'update',
          changedBy: actor,
          details: {
            eventType: 'AUTOMATION_TRIGGERED_BY_SCHEDULER',
            jobId: job.jobId,
            automationId: job.automationId,
          },
        });

        job.state = 'EXECUTING';

        // Dispatches execution request through CustomerAutomationService -> AutonomousExecutionService
        await this.automationService.executeAutomation({
          organizationId: job.organizationId,
          businessId: job.businessId,
          automationId: job.automationId,
          actor,
        });

        job.state = 'COMPLETED';
        job.runCount += 1;
        job.lastRunAt = new Date().toISOString();
        // Schedule next run (24 hours later)
        job.nextRunAt = new Date(Date.now() + 86400000).toISOString();
        job.state = 'WAITING';

        processed.push(job);
      } catch (err: any) {
        job.state = 'FAILED';
        job.lastError = err.message ?? 'Scheduled execution failed';

        await this.auditRepo.logEvent({
          organizationId: job.organizationId,
          businessId: job.businessId,
          action: 'update',
          changedBy: actor,
          details: {
            eventType: 'AUTOMATION_SCHEDULER_FAILED',
            jobId: job.jobId,
            error: job.lastError,
          },
        });
      }
    }

    return processed;
  }

  /**
   * List scheduled jobs for an organization & business ID.
   */
  getScheduledJobs(organizationId: string, businessId: string): ScheduledJob[] {
    return this.jobs.filter(
      (j) => j.organizationId === organizationId && j.businessId === businessId
    );
  }

  /**
   * Cancel a scheduled job.
   */
  async cancelScheduledJob(params: {
    organizationId: string;
    businessId: string;
    jobId: string;
    actor: string;
  }): Promise<void> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const index = this.jobs.findIndex(
      (j) => j.jobId === params.jobId && j.organizationId === params.organizationId
    );

    if (index !== -1) {
      this.jobs.splice(index, 1);
    }
  }
}
