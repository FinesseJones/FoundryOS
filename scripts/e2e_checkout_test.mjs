import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:8787";

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function runCheckoutTest() {
  console.log("================================================================================");
  console.log("💳  FOUNDRYOS STRIPE SUBSCRIPTION END-TO-END CHECKOUT TEST");
  console.log("================================================================================\n");

  // 1. Check if server is running
  try {
    const health = await fetch(`${SERVER_URL}/api/health`).then((r) => r.json());
    if (!health.ok) {
      throw new Error(`Server health check failed: ${JSON.stringify(health)}`);
    }
    console.log(`[1/4] Connected to API server at ${SERVER_URL}`);
    console.log(`      - Database: ${health.database} (${health.databaseUrl || "connected"})`);
    console.log(`      - Stripe Secret Key: ${health.stripe ? "Configured (Test Mode)" : "NOT CONFIGURED"}`);
    if (!health.stripe) {
      console.error("\n❌ Error: STRIPE_SECRET_KEY is not configured on the server. Please check your .env file.\n");
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ Error: Could not connect to API server at ${SERVER_URL}.`);
    console.error("   Please start the server first in another terminal with: npm run server (or cd api && node server.js)\n");
    process.exit(1);
  }

  // 2. Register fresh tenant user
  const email = `test.founder.${Date.now()}@foundryos.tech`;
  const password = "TestPassword2026!";
  console.log(`\n[2/4] Registering new test tenant account: ${email}...`);

  const regResp = await fetch(`${SERVER_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name: "Test Founder",
    }),
  });

  if (!regResp.ok) {
    const errData = await regResp.json().catch(() => ({}));
    throw new Error(`Registration failed: ${JSON.stringify(errData)}`);
  }

  const setCookie = regResp.headers.get("set-cookie") || "";
  const cookieHeader = setCookie.split(";")[0];
  const regData = await regResp.json();
  const userId = regData.user.id;

  // Create organization
  const orgResp = await fetch(`${SERVER_URL}/api/tenant/organization`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      name: `Foundry Test Corp (${Date.now()})`,
      industry: "technology_saas",
      planTier: "starter",
    }),
  });

  const orgData = await orgResp.json();
  const orgId = orgData.id;
  console.log(`      - Created Tenant Organization: ${orgData.name} (ID: ${orgId})`);

  // 3. Create real Stripe Checkout Session
  console.log("\n[3/4] Creating Real Stripe Checkout Session for Growth Plan ($997/mo)...");
  const checkoutResp = await fetch(`${SERVER_URL}/api/billing/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      organizationId: orgId,
      planTier: "growth",
    }),
  });

  if (!checkoutResp.ok) {
    const errData = await checkoutResp.json().catch(() => ({}));
    throw new Error(`Checkout session creation failed: ${JSON.stringify(errData)}`);
  }

  const checkoutData = await checkoutResp.json();
  console.log(`      - Stripe Customer ID: ${checkoutData.stripeCustomerId}`);
  console.log(`      - Stripe Session ID:  ${checkoutData.sessionId}`);
  console.log(`      - Stripe Price ID:    ${checkoutData.priceId}`);

  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔗 OPEN THIS URL IN YOUR BROWSER TO PAY (TEST MODE):");
  console.log(`\n👉  ${checkoutData.url}\n`);
  console.log("Test Payment Details:");
  console.log(" • Card Number: 4242 4242 4242 4242");
  console.log(" • Expiry:      Any future date (e.g. 12/34)");
  console.log(" • CVC:         123");
  console.log(" • ZIP:         90210");
  console.log("--------------------------------------------------------------------------------\n");

  console.log("⚡ NOTE: If testing webhooks locally, ensure 'stripe listen' is running:");
  console.log("   stripe listen --forward-to localhost:8787/api/webhooks/stripe\n");

  await askQuestion("Press [ENTER] after you have completed the test payment on Stripe... ");

  // 4. Verify DB Row
  console.log("\n[4/4] Reading back authoritative Subscription row from SQLite Database...");

  let finalSub = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const subResp = await fetch(`${SERVER_URL}/api/billing/subscription/${orgId}`, {
      headers: { Cookie: cookieHeader },
    });
    finalSub = await subResp.json();

    if (finalSub.subscriptionStatus === "active") {
      break;
    }
    if (attempt < 5) {
      console.log(`      Waiting for webhook to update DB (attempt ${attempt}/5)...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\n================================================================================");
  console.log("📊 DATABASE SUBSCRIPTION ROW (CURRENT STATE):");
  console.log("================================================================================");
  console.log(JSON.stringify(finalSub, null, 2));
  console.log("================================================================================\n");

  if (finalSub.subscriptionStatus === "active" && finalSub.stripeSubscriptionId) {
    console.log(`✅ SUCCESS! Real subscription ${finalSub.stripeSubscriptionId} is ACTIVE in SQLite.`);
    console.log(`   Customer: ${finalSub.stripeCustomerId}`);
    console.log(`   Plan Tier: ${finalSub.planTier.toUpperCase()} ($997/mo)`);
  } else {
    console.log(`ℹ️ Current status is '${finalSub.subscriptionStatus}'.`);
    console.log("   If you paid, check that 'stripe listen' forwarded the webhook event to /api/webhooks/stripe.");
  }
}

runCheckoutTest().catch((err) => {
  console.error("\n❌ Test Error:", err.message);
  process.exit(1);
});
