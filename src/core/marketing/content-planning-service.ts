import { BusinessDNARepository, AuditRepository } from '../persistence/repositories';
import { ContextBuilder } from '../context';
import { ContentAgent } from '../agents/content-agent';

export type ContentPlanChannel = 'SOCIAL_MEDIA' | 'BLOG' | 'EMAIL' | 'PROMOTIONAL' | 'BRAND_CALENDAR';

export interface ContentPlanItem {
  id: string;
  organizationId: string;
  businessId: string;
  channel: ContentPlanChannel;
  title: string;
  description: string;
  contentTheme: string;
  recommendedPostDate: string;
  brandVoiceAlignment: string;
  status: 'PLANNED' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
  createdAt: string;
}

export interface ContentCalendar {
  organizationId: string;
  businessId: string;
  planName: string;
  startDate: string;
  endDate: string;
  items: ContentPlanItem[];
  generatedAt: string;
}

export class ContentPlanningService {
  private planItems: ContentPlanItem[] = [];
  private contentAgent: ContentAgent;

  constructor(
    private dnaRepo: BusinessDNARepository,
    private auditRepo: AuditRepository,
    private contextBuilder: ContextBuilder
  ) {
    // Reuse the existing ContentAgent — do NOT create a duplicate
    this.contentAgent = new ContentAgent(contextBuilder);
  }

  private async assertTenantDNA(organizationId: string, businessId: string) {
    const dna = await this.dnaRepo.getDNA({ organizationId, businessId });
    if (!dna) throw new Error(`ContentPlanningService: access denied for org '${organizationId}'.`);
    return dna;
  }

  /**
   * Generate a content plan for a specific channel using existing ContentAgent.
   */
  async generateChannelPlan(params: {
    organizationId: string;
    businessId: string;
    channel: ContentPlanChannel;
    numberOfItems: number;
    theme?: string;
    actor: string;
  }): Promise<ContentPlanItem[]> {
    const dna = await this.assertTenantDNA(params.organizationId, params.businessId);

    const companyName = dna.companyIdentity.companyName.value;
    const tone = (dna as any).brandVoice?.primaryTone?.value ?? 'professional';

    // Invoke existing ContentAgent — no duplicate logic
    const agentResult = await this.contentAgent.executeTask({
      taskId: `plan_${params.channel}_${Date.now()}`,
      businessId: params.businessId,
      role: 'content',
      taskType: 'content_generation',
      prompt: `Generate a ${params.channel} content plan for ${companyName} focused on: ${params.theme ?? 'brand awareness'}.`,
      targetChannel: params.channel,
    });

    const now = new Date();
    const channelThemes: Record<ContentPlanChannel, string[]> = {
      SOCIAL_MEDIA: ['Thought Leadership', 'Behind the Scenes', 'Customer Spotlight', 'Industry Insight'],
      BLOG: ['How-To Guide', 'Case Study', 'Industry Trend', 'Expert Opinion'],
      EMAIL: ['Weekly Newsletter', 'Product Update', 'Customer Story', 'Educational Series'],
      PROMOTIONAL: ['Launch Announcement', 'Limited Offer', 'Seasonal Campaign', 'Partnership Spotlight'],
      BRAND_CALENDAR: ['Brand Milestone', 'Community Event', 'Annual Review', 'Strategic Announcement'],
    };

    const themes = channelThemes[params.channel];

    const items: ContentPlanItem[] = Array.from({ length: params.numberOfItems }, (_, i) => {
      const theme = themes[i % themes.length];
      const postDate = new Date(now);
      postDate.setDate(now.getDate() + i * 7);

      const item: ContentPlanItem = {
        id: `cp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        organizationId: params.organizationId,
        businessId: params.businessId,
        channel: params.channel,
        title: `${theme}: ${companyName} Perspective`,
        description: agentResult.outputSummary,
        contentTheme: theme,
        recommendedPostDate: postDate.toISOString().split('T')[0],
        brandVoiceAlignment: tone,
        status: 'PLANNED',
        createdAt: new Date().toISOString(),
      };

      return item;
    });

    this.planItems.push(...items);

    await this.auditRepo.logEvent({
      organizationId: params.organizationId,
      businessId: params.businessId,
      action: 'create',
      changedBy: params.actor,
      details: {
        eventType: 'CONTENT_PLAN_GENERATED',
        channel: params.channel,
        itemCount: items.length,
        approvalStatus: agentResult.cognitiveResult.decision.approvalStatus,
      },
    });

    return items;
  }

  /**
   * Generate a full brand-aligned content calendar across all channels.
   */
  async generateContentCalendar(params: {
    organizationId: string;
    businessId: string;
    planName: string;
    durationWeeks: number;
    actor: string;
  }): Promise<ContentCalendar> {
    await this.assertTenantDNA(params.organizationId, params.businessId);

    const channels: ContentPlanChannel[] = ['SOCIAL_MEDIA', 'BLOG', 'EMAIL'];
    const allItems: ContentPlanItem[] = [];

    for (const channel of channels) {
      const items = await this.generateChannelPlan({
        organizationId: params.organizationId,
        businessId: params.businessId,
        channel,
        numberOfItems: Math.ceil(params.durationWeeks / 2),
        actor: params.actor,
      });
      allItems.push(...items);
    }

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + params.durationWeeks * 7);

    const calendar: ContentCalendar = {
      organizationId: params.organizationId,
      businessId: params.businessId,
      planName: params.planName,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      items: allItems,
      generatedAt: new Date().toISOString(),
    };

    return calendar;
  }

  /**
   * Retrieve all content plan items scoped to an organization.
   */
  getContentPlan(organizationId: string, businessId: string): ContentPlanItem[] {
    return this.planItems.filter(
      (p) => p.organizationId === organizationId && p.businessId === businessId
    );
  }
}
