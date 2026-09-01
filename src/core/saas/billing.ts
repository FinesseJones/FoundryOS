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
  status: 'inactive' | 'active' | 'past_due' | 'canceled' | 'trailing';
  tokensUsed: number;
  tokenLimit: number;
  currentPeriodEnd?: string;
}

export class SaaSBillingManager {
  private inMemorySubs: Map<string, SubscriptionStatus> = new Map();

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

  /**
   * Initialize a default subscription structure for an organization.
   */
  initializeSubscription(organizationId: string, tier: PlanTier = 'growth'): SubscriptionStatus {
    const plan = SaaSBillingManager.PLANS[tier];
    const sub: SubscriptionStatus = {
      organizationId,
      planTier: tier,
      stripeCustomerId: '',
      stripeSubscriptionId: '',
      status: 'active',
      tokensUsed: 0,
      tokenLimit: plan.monthlyTokenLimit,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    };

    this.inMemorySubs.set(organizationId, sub);
    return sub;
  }

  /**
   * Get subscription status synchronously (with in-memory usage tracking).
   */
  getSubscription(organizationId: string): SubscriptionStatus {
    return this.inMemorySubs.get(organizationId) || this.initializeSubscription(organizationId);
  }

  /**
   * Record token usage against tenant's monthly token limit.
   */
  recordTokenUsage(organizationId: string, tokens: number): { allowed: boolean; remainingTokens: number } {
    const sub = this.getSubscription(organizationId);
    if (sub.tokensUsed + tokens > sub.tokenLimit && sub.planTier !== 'enterprise') {
      return { allowed: false, remainingTokens: Math.max(0, sub.tokenLimit - sub.tokensUsed) };
    }

    sub.tokensUsed += tokens;
    return { allowed: true, remainingTokens: sub.tokenLimit - sub.tokensUsed };
  }

  /**
   * Update internal state from webhook payload.
   */
  handleStripeWebhook(event: { type: string; customerId: string; subscriptionId: string; newTier?: PlanTier }): boolean {
    const sub = Array.from(this.inMemorySubs.values()).find((s) => s.stripeCustomerId === event.customerId);
    if (!sub) return false;

    if (event.type === 'customer.subscription.updated' && event.newTier) {
      sub.planTier = event.newTier;
      sub.tokenLimit = SaaSBillingManager.PLANS[event.newTier].monthlyTokenLimit;
    } else if (event.type === 'customer.subscription.deleted') {
      sub.status = 'canceled';
    }

    return true;
  }

  /**
   * Create a real Stripe Checkout Session for subscription upgrade / enrollment.
   * Gated on server-side STRIPE_SECRET_KEY.
   */
  async createSubscriptionCheckout(params: {
    organizationId: string;
    planTier: PlanTier;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; url: string; planTier: PlanTier }> {
    const res = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create Stripe checkout session (HTTP ${res.status}).`);
    }

    return res.json();
  }

  /**
   * Fetch authoritative subscription status from server DB.
   */
  async fetchRemoteSubscription(organizationId: string): Promise<SubscriptionStatus> {
    const res = await fetch(`/api/billing/subscription/${encodeURIComponent(organizationId)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      const plan = SaaSBillingManager.PLANS.growth;
      return {
        organizationId,
        planTier: 'growth',
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        status: 'inactive',
        tokensUsed: 0,
        tokenLimit: plan.monthlyTokenLimit,
      };
    }

    const data = await res.json();
    const tier = (data.planTier || 'growth') as PlanTier;
    const plan = SaaSBillingManager.PLANS[tier] || SaaSBillingManager.PLANS.growth;

    const sub: SubscriptionStatus = {
      organizationId: data.organizationId,
      planTier: tier,
      stripeCustomerId: data.stripeCustomerId || '',
      stripeSubscriptionId: data.stripeSubscriptionId || '',
      status: data.subscriptionStatus || 'inactive',
      tokensUsed: 0,
      tokenLimit: plan.monthlyTokenLimit,
      currentPeriodEnd: data.currentPeriodEnd || undefined,
    };

    this.inMemorySubs.set(organizationId, sub);
    return sub;
  }
}
