import { AnalyticsAgent } from '../src/core/agents/analytics-agent.ts';
import { ContextBuilder } from '../src/core/context/context-builder.ts';
import { createDefaultBusinessDNA } from '../src/core/knowledge/index.ts';
import { LLMProviderGateway } from '../src/core/providers/llm-provider-factory.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔬 Verifying AnalyticsAgent: Real LLM Gateway Execution & Fail-Closed Error Tests");
  console.log("================================================================================");

  // Set up Context and Business DNA
  const dna = createDefaultBusinessDNA('biz_analytics_verify', {
    companyIdentity: {
      companyName: { value: 'Apex HVAC & Air Solutions' },
      industry: { value: 'commercial_contractor_hvac' },
      mission: { value: 'Delivering zero-downtime industrial refrigeration and high-efficiency commercial HVAC.' },
      uniqueValueProposition: { value: 'Sub-15 minute emergency dispatch and guaranteed 20% lower seasonal energy overhead.' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToUse: { value: ['efficiency', 'uptime', 'commercial', 'certified', 'rapid-response'] },
    }
  });

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  // ─── Test 1: Real Successful Execution through LLM Gateway ─────────────────
  console.log("\n--- [Test 1] Real LLM Call: Valid prompt with Business DNA injection ---");
  
  // Create an AnalyticsAgent instance
  const agent = new AnalyticsAgent(contextBuilder);

  const result = await agent.executeTask({
    taskId: 'task_analytics_001',
    businessId: 'biz_analytics_verify',
    role: 'analytics',
    taskType: 'analytics_audit',
    prompt: 'Analyze seasonal Q3 marketing campaign performance and calculate estimated content ROI for commercial chillers.',
  });

  console.log("\n✅ Actual Model Output Data from AnalyticsAgent:");
  console.log(JSON.stringify(result.outputData, null, 2));
  console.log("\nSummary Output:");
  console.log(result.outputSummary);

  if (result.outputData.contentRoi === undefined || result.outputData.conversionRate === undefined) {
    throw new Error("Missing required validated schema properties in actual output!");
  }

  // ─── Test 2: Error Surface Test (Forced Invalid LLM Response) ────────────────
  console.log("\n--- [Test 2] Fail-Closed Proof: Forcing invalid LLM response ---");

  // We temporarily mock the provider in the test to return malformed output to prove the agent fails closed
  const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
  
  try {
    LLMProviderGateway.executeWithFallback = async () => ({
      text: "Sorry, I am an AI and cannot format this as JSON right now.",
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.1-70b-instruct',
      usage: { promptTokens: 50, completionTokens: 15, totalTokens: 65, estimatedCostUsd: 0.0001, latencyMs: 20 },
    });

    let threw = false;
    try {
      await agent.executeTask({
        taskId: 'task_analytics_002',
        businessId: 'biz_analytics_verify',
        role: 'analytics',
        taskType: 'analytics_audit',
        prompt: 'Run failing audit',
      });
    } catch (err) {
      threw = true;
      console.log("✅ Expected failure caught cleanly (NO mock data returned):");
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    }

    if (!threw) {
      throw new Error("FAILED: AnalyticsAgent did not throw an error on malformed LLM response!");
    }
  } finally {
    LLMProviderGateway.executeWithFallback = originalExecute;
  }

  console.log("\n================================================================================");
  console.log("🎉 AnalyticsAgent Verification PASSED: Real LLM JSON output parsed + Fail-Closed verified");
  console.log("================================================================================");
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
