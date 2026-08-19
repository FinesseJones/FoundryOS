import { WebsiteConnectionService, WebsiteConnectionRecord } from './website-connection-service';
import { ExtractionPipeline } from './extraction-pipeline';
import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { CustomerNotificationService } from '../saas/customer-notifications';
import { BusinessDNA } from '../knowledge';

export interface WebsiteIngestionResult {
  connection: WebsiteConnectionRecord;
  updatedDNA: BusinessDNA;
}

export class WebsiteIngestionWorkflow {
  private pipeline = new ExtractionPipeline();

  constructor(
    private connectionService: WebsiteConnectionService,
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private notificationService: CustomerNotificationService
  ) {}

  async executeIngestion(params: {
    organizationId: string;
    connectionId: string;
    actor: string;
  }): Promise<WebsiteIngestionResult> {
    const connection = this.connectionService.getConnection({
      organizationId: params.organizationId,
      connectionId: params.connectionId,
    });

    if (!connection) {
      throw new Error(`Website connection '${params.connectionId}' not found for tenant.`);
    }

    try {
      // 1. Transition State -> CRAWLING
      this.connectionService.updateState(params.organizationId, params.connectionId, {
        state: 'CRAWLING',
      });

      // 2. Run Extraction Pipeline (WebCrawler -> Cleaner -> Chunker -> GraphBuilder)
      this.connectionService.updateState(params.organizationId, params.connectionId, {
        state: 'ANALYZING',
      });

      const pipelineResult = await this.pipeline.runPipeline(connection.url);

      // 3. Update Existing Business DNA
      const existingDNA = await this.dnaRepo.getDNA({
        organizationId: params.organizationId,
        businessId: connection.businessId,
      });

      const extracted = pipelineResult.businessDNA;
      const updatedDNA: BusinessDNA = existingDNA
        ? {
            ...existingDNA,
            companyIdentity: {
              ...existingDNA.companyIdentity,
              ...extracted.companyIdentity,
              companyName: existingDNA.companyIdentity.companyName,
            },
            brandVoice: {
              ...existingDNA.brandVoice,
              ...extracted.brandVoice,
            },
            customerProfile: {
              ...existingDNA.customerProfile,
              ...extracted.customerProfile,
            },
            competitivePositioning: {
              ...existingDNA.competitivePositioning,
              ...extracted.competitivePositioning,
            },
            websiteAnalysis: (existingDNA.websiteAnalysis && extracted.websiteAnalysis)
              ? {
                  ...existingDNA.websiteAnalysis,
                  ...extracted.websiteAnalysis,
                  primaryUrl: extracted.websiteAnalysis.primaryUrl || existingDNA.websiteAnalysis.primaryUrl,
                  mainCTAs: extracted.websiteAnalysis.mainCTAs || existingDNA.websiteAnalysis.mainCTAs,
                  keyPages: extracted.websiteAnalysis.keyPages || existingDNA.websiteAnalysis.keyPages,
                  valuePropsExtracted: extracted.websiteAnalysis.valuePropsExtracted || existingDNA.websiteAnalysis.valuePropsExtracted,
                }
              : (extracted.websiteAnalysis || existingDNA.websiteAnalysis),
          }
        : pipelineResult.businessDNA;

      await this.dnaRepo.saveDNA(updatedDNA, params.organizationId, params.actor);

      // 4. Update Connection Record State -> COMPLETED
      const finalConnection = this.connectionService.updateState(params.organizationId, params.connectionId, {
        state: 'COMPLETED',
        pagesDiscovered: pipelineResult.crawlResult.pages.length,
        lastCrawlTime: new Date().toISOString(),
      });

      // 5. Log Security Audit Event
      await this.auditRepo.logEvent({
        organizationId: params.organizationId,
        businessId: connection.businessId,
        action: 'update',
        changedBy: params.actor,
        details: {
          eventType: 'WEBSITE_INGESTION_COMPLETED',
          url: connection.url,
          pagesCrawled: pipelineResult.crawlResult.pages.length,
        },
      });

      // 6. Notify Customer via CustomerNotificationService
      this.notificationService.sendCustomerAlert({
        organizationId: params.organizationId,
        businessId: connection.businessId,
        type: 'dna_updated',
        title: 'Website Signals Extracted',
        message: `Extracted signals from ${pipelineResult.crawlResult.pages.length} pages on ${connection.url}. Business DNA updated!`,
      });

      return {
        connection: finalConnection,
        updatedDNA,
      };
    } catch (err: any) {
      this.connectionService.updateState(params.organizationId, params.connectionId, {
        state: 'FAILED',
        errorMessage: err?.message ?? 'Ingestion failed due to unexpected error',
      });
      throw err;
    }
  }
}
