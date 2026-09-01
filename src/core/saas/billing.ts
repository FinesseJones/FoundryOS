export type PlanTier = 'starter' | 'growth' | 'enterprise';

export interface PlanConfig {
  tier: PlanTier;
  monthlyCostUsd: number;
  monthlyTokenLimit: number;
  maxDnaProfiles: number;
  allowedAgents: string[];
}

export interface SubscriptionStatus {
  organizationId: string;
  planTier: PlanTier;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'past_due' | 'canceled';
  tokensUsed: number;
  tokenLimit: number;
  currentPeriodEnd: string;
}

export class SaaSBillingManager {
  private subscriptions: Map<string, SubscriptionStatus> = new Map();

  static readonly PLANS: Record<PlanTier, PlanConfig> = {
    starter: {
      tier: 'starter',
      monthlyCostUsd: 497,
      monthlyTokenLimit: 100000,
      maxDnaProfiles: 1,
      allowedAgents: ['brand', 'content'],
    },
    growth: {
      tier: 'growth',
      monthlyCostUsd: 997,
      monthlyTokenLimit: 1000000,
      maxDnaProfiles: 5,
      allowedAgents: ['brand', 'content', 'publishing', 'website', 'security', 'analytics', 'learning'],
    },
    enterprise: {
      tier: 'enterprise',
      monthlyCostUsd: 2497,
      monthlyTokenLimit: 10000000,
      maxDnaProfiles: 999,
      allowedAgents: ['brand', 'content', 'publishing', 'website', 'security', 'analytics', 'learning'],
    },
  };

  initializeSubscription(organizationId: string, tier: PlanTier = 'growth'): SubscriptionStatus {
    const plan = SaaSBillingManager.PLANS[tier];
    const sub: SubscriptionStatus = {
      organizationId,
      planTier: tier,
      stripeCustomerId: `cus_${organizationId}_${Date.now()}`,
      stripeSubscriptionId: `sub_${organizationId}_${Date.now()}`,
      status: 'active',
      tokensUsed: 0,
      tokenLimit: plan.monthlyTokenLimit,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    };

    this.subscriptions.set(organizationId, sub);
    return sub;
  }

  getSubscription(organizationId: string): SubscriptionStatus {
    return this.subscriptions.get(organizationId) || this.initializeSubscription(organizationId);
  }

  recordTokenUsage(organizationId: string, tokens: number): { allowed: boolean; remainingTokens: number } {
    const sub = this.getSubscription(organizationId);
    if (sub.tokensUsed + tokens > sub.tokenLimit && sub.planTier !== 'enterprise') {
      return { allowed: false, remainingTokens: Math.max(0, sub.tokenLimit - sub.tokensUsed) };
    }

    sub.tokensUsed += tokens;
    return { allowed: true, remainingTokens: sub.tokenLimit - sub.tokensUsed };
  }

  handleStripeWebhook(event: { type: string; customerId: string; subscriptionId: string; newTier?: PlanTier }): boolean {
    const sub = Array.from(this.subscriptions.values()).find((s) => s.stripeCustomerId === event.customerId);
    if (!sub) return false;

    if (event.type === 'customer.subscription.updated' && event.newTier) {
      sub.planTier = event.newTier;
      sub.tokenLimit = SaaSBillingManager.PLANS[event.newTier].monthlyTokenLimit;
    } else if (event.type === 'customer.subscription.deleted') {
      sub.status = 'canceled';
    }

    return true;
  }
}
