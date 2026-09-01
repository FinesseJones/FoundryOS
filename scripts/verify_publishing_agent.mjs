import { PublishingAgent } from '../src/core/agents/publishing-agent.ts';
import { ContextBuilder } from '../src/core/context/context-builder.ts';
import { createDefaultBusinessDNA } from '../src/core/knowledge/index.ts';
import { LLMProviderGateway } from '../src/core/providers/llm-provider-factory.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔬 Verifying PublishingAgent: Real LLM Gateway Execution & Fail-Closed Error Tests");
  console.log("================================================================================");

  // Set up Context and Business DNA
  const dna = createDefaultBusinessDNA('biz_publishing_verify', {
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
  console.log("\n--- [Test 1] Real LLM Call: Channel distribution & formatting validation ---");
  
  const agent = new PublishingAgent(contextBuilder);

  const result = await agent.executeTask({
    taskId: 'task_pub_verify_001',
    businessId: 'biz_publishing_verify',
    role: 'publishing',
    taskType: 'content_generation',
    targetChannel: 'linkedin',
    prompt: 'Stage an executive LinkedIn announcement detailing our new Sub-15 minute emergency industrial chiller repair service for commercial food logistics facilities.',
  });

  console.log("\n✅ Actual Model Output Data from PublishingAgent:");
  console.log(JSON.stringify(result.outputData, null, 2));
  console.log("\nSummary Output:");
  console.log(result.outputSummary);

  if (!result.outputData.channelOptimizedContent || !result.outputData.complianceStatus) {
    throw new Error("Missing required validated schema properties in actual output!");
  }

  // ─── Test 2: Error Surface Test (Forced Invalid LLM Response) ────────────────
  console.log("\n--- [Test 2] Fail-Closed Proof: Forcing invalid LLM response ---");

  const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
  
  try {
    LLMProviderGateway.executeWithFallback = async () => ({
      text: "Malformed non-JSON response from provider",
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.1-70b-instruct',
      usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60, estimatedCostUsd: 0.0001, latencyMs: 20 },
    });

    let threw = false;
    try {
      await agent.executeTask({
        taskId: 'task_pub_verify_002',
        businessId: 'biz_publishing_verify',
        role: 'publishing',
        taskType: 'content_generation',
        targetChannel: 'twitter',
        prompt: 'Post failing draft',
      });
    } catch (err) {
      threw = true;
      console.log("✅ Expected failure caught cleanly (NO mock data returned):");
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    }

    if (!threw) {
      throw new Error("FAILED: PublishingAgent did not throw an error on malformed LLM response!");
    }
  } finally {
    LLMProviderGateway.executeWithFallback = originalExecute;
  }

  console.log("\n================================================================================");
  console.log("🎉 PublishingAgent Verification PASSED: Real LLM JSON output parsed + Fail-Closed verified");
  console.log("================================================================================");
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
