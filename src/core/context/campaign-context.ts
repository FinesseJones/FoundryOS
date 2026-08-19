import { CampaignContextData } from './context.types';

export class CampaignContextRetriever {
  private campaigns: CampaignContextData[] = [];

  constructor(initialCampaigns: CampaignContextData[] = []) {
    this.campaigns = [...initialCampaigns];
  }

  addCampaign(campaign: CampaignContextData): void {
    this.campaigns.push(campaign);
  }

  retrieveActiveCampaign(campaignId?: string): CampaignContextData | null {
    if (campaignId) {
      return this.campaigns.find((c) => c.campaignId === campaignId) ?? null;
    }
    return this.campaigns.find((c) => c.status === 'active') ?? null;
  }

  static formatForPrompt(campaign: CampaignContextData | null): string {
    if (!campaign) return '';
    const lines = ['### Active Campaign Context'];
    lines.push(`- **Campaign**: ${campaign.campaignName} (ID: ${campaign.campaignId})`);
    lines.push(`- **Goal**: ${campaign.goal}`);
    lines.push(`- **Channels**: ${campaign.targetChannels.join(', ')}`);
    if (campaign.keySlogans.length) lines.push(`- **Slogans**: ${campaign.keySlogans.join(' | ')}`);
    if (campaign.contentPillars.length) lines.push(`- **Pillars**: ${campaign.contentPillars.join(', ')}`);
    return lines.join('\n');
  }
}
