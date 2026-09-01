export type PlanTier = 'starter' | 'growth' | 'enterprise';

export interface StripeTierConfig {
  tier: PlanTier;
  priceId: string;
  amountUsd: number;
  name: string;
  monthlyTokens: number;
}

export const STRIPE_PRICE_MAP: Record<PlanTier, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_1UAnCLLUpAOiyhmZYbRKEHk0',
  growth: process.env.STRIPE_PRICE_GROWTH || 'price_1UAnCLLUpAOiyhmZ8AruC2Ew',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_1UAnCMLUpAOiyhmZNeAsbeOR',
};

export const STRIPE_TIER_CONFIG: Record<PlanTier, StripeTierConfig> = {
  starter: {
    tier: 'starter',
    priceId: STRIPE_PRICE_MAP.starter,
    amountUsd: 497,
    name: 'FoundryOS Starter Tier',
    monthlyTokens: 100000,
  },
  growth: {
    tier: 'growth',
    priceId: STRIPE_PRICE_MAP.growth,
    amountUsd: 997,
    name: 'FoundryOS Growth Tier',
    monthlyTokens: 1000000,
  },
  enterprise: {
    tier: 'enterprise',
    priceId: STRIPE_PRICE_MAP.enterprise,
    amountUsd: 2497,
    name: 'FoundryOS Enterprise Tier',
    monthlyTokens: 10000000,
  },
};

export function getPriceIdForTier(tier: string): string | null {
  const normalized = tier.toLowerCase() as PlanTier;
  return STRIPE_PRICE_MAP[normalized] || null;
}
