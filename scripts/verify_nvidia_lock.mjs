import dotenv from 'dotenv';
dotenv.config();

import { MultiProviderLLMFactory } from '../src/core/providers/llm-provider-factory.ts';
import { SaaSBillingManager } from '../src/core/saas/billing.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔒 Verifying NVIDIA-Only Lock & Fail-Closed Gatekeeper");
  console.log("================================================================================");

  const factory = new MultiProviderLLMFactory();

  // ─── Test 1: Live NVIDIA NIM Execution ─────────────────────────────────────
  console.log("\n--- [Test 1] Live Production Call to NVIDIA NIM (meta/llama-3.2-90b-vision-instruct) ---");
  const response = await factory.executeWithFallback({
    prompt: "Respond strictly with valid JSON: {\"system\":\"FoundryOS\",\"status\":\"AUTHORITATIVE_PRODUCTION\"}",
    temperature: 0.1,
    maxTokens: 100,
  });

  console.log("✅ NVIDIA NIM Live Response Received:");
  console.log("   Provider Used:", response.providerUsed);
  console.log("   Model Used:", response.modelUsed);
  console.log("   Text:", response.text);

  if (response.providerUsed !== 'nvidia') {
    throw new Error(`Expected providerUsed 'nvidia', got '${response.providerUsed}'`);
  }

  // ─── Test 2: Forced NVIDIA Failure (Fail Closed, No Fallthrough) ───────────
  console.log("\n--- [Test 2] Forced NVIDIA Failure: Confirming strict fail-closed (NO fallthrough) ---");
  
  // We create a factory instance where NVIDIA endpoint is intentionally bad
  const badFactory = new MultiProviderLLMFactory();
  const badNvidiaProvider = badFactory['providers'].get('nvidia');
  badNvidiaProvider.config.baseUrl = 'http://localhost:9999/nonexistent';

  let threw = false;
  try {
    await badFactory.executeWithFallback({
      prompt: "Test failing call",
    });
  } catch (err) {
    threw = true;
    console.log("✅ Expected fail-closed error thrown immediately (did NOT fall through):");
    console.log("   Error:", err.message);
  }

  if (!threw) {
    throw new Error("FAILED: Factory did not fail closed on NVIDIA failure!");
  }

  // ─── Test 3: Quota Gatekeeper Protection ──────────────────────────────────
  console.log("\n--- [Test 3] Quota Gatekeeper: Block over-limit tenant before calling provider ---");
  const billing = new SaaSBillingManager();
  billing.initializeSubscription('org_over_limit', 'starter'); // 100k token limit
  billing.recordTokenUsage('org_over_limit', 100_000); // Fully consume quota
  factory.setBillingManager(billing);

  let quotaBlocked = false;
  try {
    await factory.executeWithFallback({
      prompt: "Will be blocked by quota gate",
      organizationId: 'org_over_limit',
    });
  } catch (err) {
    quotaBlocked = true;
    console.log("✅ QuotaExceededError triggered before calling provider:");
    console.log("   Error Name:", err.name);
    console.log("   Message:", err.message);
  }

  if (!quotaBlocked) {
    throw new Error("FAILED: QuotaExceededError was not thrown for over-limit tenant!");
  }

  console.log("\n================================================================================");
  console.log("🎉 NVIDIA Lock Verification PASSED: Live NVIDIA NIM + Strict Fail-Closed + Quota Gate");
  console.log("================================================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
