import Stripe from "stripe";

async function setupStripeProducts() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.trim()) {
    console.error("[Stripe Setup] Error: STRIPE_SECRET_KEY is not configured in environment or .env.");
    console.error("[Stripe Setup] Fail closed: Please supply a valid test key (sk_test_...) to create products.");
    process.exit(1);
  }

  if (!secretKey.startsWith("sk_test_")) {
    console.warn("[Stripe Setup] WARNING: Running with a non-test key. TEST mode expected (sk_test_...).");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });

  console.log("================================================================================");
  console.log("💳  FOUNDRYOS STRIPE SUBSCRIPTION PRODUCTS SETUP");
  console.log("================================================================================\n");

  const plans = [
    {
      tier: "starter",
      name: "FoundryOS Starter Tier",
      description: "100,000 Monthly Context Tokens, 1 Business DNA Profile, Brand & Content Agents",
      unitAmount: 49700, // $497.00
    },
    {
      tier: "growth",
      name: "FoundryOS Growth Tier",
      description: "1,000,000 Monthly Context Tokens, 5 Business DNA Profiles, All 7 Agents, Automated Workflows",
      unitAmount: 99700, // $997.00
    },
    {
      tier: "enterprise",
      name: "FoundryOS Enterprise Tier",
      description: "10,000,000 Monthly Context Tokens, Unlimited Profiles, Dedicated Security & Custom Webhooks",
      unitAmount: 249700, // $2,497.00
    },
  ];

  const priceMapping = {};

  for (const plan of plans) {
    console.log(`[Stripe] Creating/verifying Product for ${plan.name}...`);
    // Search or create product
    let product;
    const existingProducts = await stripe.products.search({
      query: `metadata['foundry_tier']:'${plan.tier}'`,
    });

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  - Found existing Product: ${product.id} (${product.name})`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          foundry_tier: plan.tier,
          platform: "FoundryOS",
        },
      });
      console.log(`  - Created new Product: ${product.id} (${product.name})`);
    }

    // Search or create monthly price
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      recurring: { interval: "month" },
    });

    let price = existingPrices.data.find(
      (p) => p.unit_amount === plan.unitAmount && p.currency === "usd"
    );

    if (price) {
      console.log(`  - Found existing Price: ${price.id} ($${(price.unit_amount / 100).toFixed(2)}/mo)`);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.unitAmount,
        currency: "usd",
        recurring: {
          interval: "month",
        },
        metadata: {
          foundry_tier: plan.tier,
        },
      });
      console.log(`  - Created new Price: ${price.id} ($${(price.unit_amount / 100).toFixed(2)}/mo)`);
    }

    priceMapping[plan.tier] = {
      productId: product.id,
      priceId: price.id,
      amountUsd: plan.unitAmount / 100,
    };
  }

  console.log("\n================================================================================");
  console.log("✅ STRIPE PRODUCTS & PRICES CONFIGURED SUCCESSFULLY:");
  console.log(JSON.stringify(priceMapping, null, 2));
  console.log("================================================================================");

  return priceMapping;
}

setupStripeProducts().catch((err) => {
  console.error("[Stripe Setup] Error creating products:", err.message);
  process.exit(1);
});
