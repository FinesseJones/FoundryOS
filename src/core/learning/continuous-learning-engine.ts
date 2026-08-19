import { LiveEventBus, SystemEvent } from '../events/live-event-bus';
import { CustomerKnowledgeGraph, createKnowledgeField } from '../knowledge';

export interface ExecutiveTask {
  taskId: string;
  executiveRole: 'CEO Agent' | 'Marketing Director' | 'Sales Director' | 'Customer Success' | 'Operations Manager';
  executiveAvatar: string;
  badgeColor: string;
  headline: string;
  summary: string;
  reasoningChain: string[];
  proposedDecision: string;
  confidenceScore: number; // e.g. 0.91
  evidenceSources: { name: string; id: string; category: string }[];
  status: 'NEEDS_APPROVAL' | 'NEEDS_REVIEW' | 'INSIGHT_READY' | 'EXECUTED';
  actionLabel: string;
  accentGradient: string;
  createdAt: string;
}

export class ContinuousLearningEngine {
  private eventBus = LiveEventBus.getInstance();
  private activeTasks: ExecutiveTask[] = [];

  constructor() {
    this.seedAuditableTasks();
    this.registerEventHandlers();
  }

  public getActiveTasks(): ExecutiveTask[] {
    return this.activeTasks;
  }

  public approveTask(taskId: string): void {
    const task = this.activeTasks.find((t) => t.taskId === taskId);
    if (task) {
      task.status = 'EXECUTED';
    }
  }

  public updateKnowledgeGraphFromEvent(graph: CustomerKnowledgeGraph, event: SystemEvent): CustomerKnowledgeGraph {
    if (event.type === 'SEARCH_TREND_SPIKE' && event.evidenceText) {
      graph.marketingDNA.campaignPillars.value.push(event.evidenceText);
    } else if (event.type === 'CUSTOMER_REVIEW_POSTED' && event.evidenceText) {
      graph.aiMemory.scrapedEvidenceQuotes.value.push(event.evidenceText);
    }
    return graph;
  }

  private registerEventHandlers(): void {
    this.eventBus.subscribe('SEARCH_TREND_SPIKE', (event) => {
      this.activeTasks.unshift({
        taskId: `MKT-${Math.floor(1000 + Math.random() * 9000)}`,
        executiveRole: 'Marketing Director',
        executiveAvatar: '📢',
        badgeColor: 'border-violet-500/30 text-violet-300 bg-violet-500/10',
        headline: 'Automated Local Ad Offer Spiked',
        summary: event.evidenceText || 'Search trend spike detected.',
        reasoningChain: [
          `Google searches for "${(event.payload as any).keyword}" increased +${(event.payload as any).volumeIncreasePct}%`,
          'Website traffic down 12% over 7-day period',
          'Primary competitor launched seasonal AC discount',
        ],
        proposedDecision: `Target Facebook ad set in zip codes ${((event.payload as any).targetZipCodes || []).join(', ')}.`,
        confidenceScore: event.confidenceScore,
        evidenceSources: [
          { name: 'Google Search Console', id: event.id, category: 'API Telemetry' },
          { name: 'Website Analytics', id: 'ANA-402', category: 'Traffic Logs' },
          { name: 'Facebook Pixel', id: 'PXL-109', category: 'Ad Conversion' },
          { name: 'Knowledge Graph Node 6', id: 'KG-MKT-06', category: 'Marketing DNA' },
        ],
        status: 'NEEDS_APPROVAL',
        actionLabel: 'Approve Campaign ▶',
        accentGradient: 'from-violet-600 to-indigo-600',
        createdAt: new Date().toISOString(),
      });
    });
  }

  private seedAuditableTasks(): void {
    this.activeTasks = [
      {
        taskId: 'MKT-2471',
        executiveRole: 'Marketing Director',
        executiveAvatar: '📢',
        badgeColor: 'border-violet-500/30 text-violet-300 bg-violet-500/10',
        headline: 'Targeted Local AC Repair Campaign Ready',
        summary: '3 neighborhoods searched for emergency AC repair +28% this week. Created Facebook & Google ad campaign.',
        reasoningChain: [
          'Google searches for "emergency AC repair" increased +28% in local zip codes',
          'Website traffic dropped 12% over previous 7 days',
          'Primary competitor (Trane) launched summer AC maintenance discount',
        ],
        proposedDecision: 'Recommend running a targeted Facebook offer in zip codes 77058, 77059, 77586.',
        confidenceScore: 0.91,
        evidenceSources: [
          { name: 'Google Search Console', id: 'GSC-881', category: 'Search Telemetry' },
          { name: 'Website Analytics', id: 'ANA-402', category: 'Traffic Analytics' },
          { name: 'Facebook Pixel', id: 'PXL-109', category: 'Ad Conversion' },
          { name: 'Business Knowledge Graph', id: 'KG-MKT-06', category: 'Node 6: Marketing DNA' },
        ],
        status: 'NEEDS_APPROVAL',
        actionLabel: 'Approve Campaign ▶',
        accentGradient: 'from-violet-600 to-indigo-600',
        createdAt: new Date().toISOString(),
      },
      {
        taskId: 'SALES-8820',
        executiveRole: 'Sales Director',
        executiveAvatar: '💼',
        badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
        headline: 'Cold Estimate Re-Engagement Campaign',
        summary: '2 estimate requests ($4,800 total value) uncontacted for >72h. Wrote personalized, value-grounded follow-ups.',
        reasoningChain: [
          'Estimate #HVAC-901 and #HVAC-904 uncontacted for 72+ hours',
          'Historical conversion drops by 45% after 48h latency',
          'High-intent interest expressed for energy-efficient heat pump installation',
        ],
        proposedDecision: 'Dispatch personalized value-grounded follow-up emails offering 0% APR financing.',
        confidenceScore: 0.96,
        evidenceSources: [
          { name: 'HubSpot / Salesforce CRM', id: 'CRM-LEAD-901', category: 'Pipeline DB' },
          { name: 'Email Gateway Logs', id: 'EML-LOG-441', category: 'Outbound Mail' },
          { name: 'Business Knowledge Graph', id: 'KG-SALES-07', category: 'Node 7: Sales DNA' },
        ],
        status: 'NEEDS_REVIEW',
        actionLabel: 'Review & Send ✉️',
        accentGradient: 'from-cyan-600 to-blue-600',
        createdAt: new Date().toISOString(),
      },
      {
        taskId: 'OPS-1049',
        executiveRole: 'Operations Manager',
        executiveAvatar: '⚙️',
        badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
        headline: 'Dispatcher Peak SLA Optimization',
        summary: 'Response time increased by 18% during peak hours. Recommended hiring 1 dispatcher or enabling auto-routing recipe.',
        reasoningChain: [
          'Average dispatch latency spiked from 14m to 28m between 1pm-4pm',
          'Call queue drop rate reached 4.2% during heatwave hours',
          'Automated routing recipe can save 3.5 hours/day in dispatcher manual input',
        ],
        proposedDecision: 'Activate automated emergency dispatch recipe or provision 1 additional dispatcher workspace seat.',
        confidenceScore: 0.89,
        evidenceSources: [
          { name: 'Call Telemetry Gateway', id: 'TEL-GATE-09', category: 'System Telemetry' },
          { name: 'Dispatch Queue Logs', id: 'DSP-LOG-112', category: 'Operations Logs' },
          { name: 'Business Knowledge Graph', id: 'KG-OPS-08', category: 'Node 8: Operations DNA' },
        ],
        status: 'INSIGHT_READY',
        actionLabel: 'View Plan 📋',
        accentGradient: 'from-emerald-600 to-teal-600',
        createdAt: new Date().toISOString(),
      },
      {
        taskId: 'CS-3012',
        executiveRole: 'Customer Success',
        executiveAvatar: '💬',
        badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
        headline: 'Google & Yelp Review Response Batch',
        summary: '7 new customer reviews received overnight. AI Executive drafted brand-aligned, professional responses for all 7.',
        reasoningChain: [
          '7 reviews received overnight (avg rating 4.9 ★)',
          '2 reviews mention technician punctuality and flat-rate pricing transparency',
          'Fast public responses increase local SEO search rank by +15%',
        ],
        proposedDecision: 'Publish AI-generated brand-aligned responses across Google Business & Yelp profiles.',
        confidenceScore: 0.98,
        evidenceSources: [
          { name: 'Google Business Profile API', id: 'GBP-REV-771', category: 'Review Stream' },
          { name: 'Yelp API Webhook', id: 'YLP-REV-302', category: 'Review Stream' },
          { name: 'Business Knowledge Graph', id: 'KG-BRAND-02', category: 'Node 2: Brand DNA' },
        ],
        status: 'NEEDS_APPROVAL',
        actionLabel: 'Approve Replies 💬',
        accentGradient: 'from-amber-600 to-orange-600',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
