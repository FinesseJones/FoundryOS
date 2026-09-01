import dotenv from 'dotenv';
dotenv.config();

import { LearningAgent } from '../src/core/agents/learning-agent.ts';
import { ContextBuilder } from '../src/core/context/context-builder.ts';
import { MemoryRetriever } from '../src/core/context/memory-retrieval.ts';
import { createDefaultBusinessDNA } from '../src/core/knowledge/index.ts';
import { LLMProviderGateway } from '../src/core/providers/llm-provider-factory.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔬 Verifying LearningAgent: Real LLM Gateway Execution & Fail-Closed Error Tests");
  console.log("================================================================================");

  // Set up Context and Business DNA
  const dna = createDefaultBusinessDNA('biz_learning_verify', {
    companyIdentity: {
      companyName: { value: 'Apex HVAC & Air Solutions' },
      industry: { value: 'commercial_contractor_hvac' },
      mission: { value: 'Delivering zero-downtime industrial refrigeration and high-efficiency commercial HVAC.' },
      uniqueValueProposition: { value: 'Sub-15 minute emergency dispatch and guaranteed 20% lower seasonal energy overhead.' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToUse: { value: ['efficiency', 'uptime', 'commercial', 'certified', 'rapid-response'] },
      wordsToAvoid: { value: ['cheap', 'unreliable', 'hack', 'discount', 'quick-fix'] },
    }
  });

  const memoryRetriever = new MemoryRetriever();
  memoryRetriever.addRecord({
    id: 'mem_001',
    organizationId: 'biz_learning_verify',
    businessId: 'biz_learning_verify',
    memoryType: 'episodic',
    tags: ['campaign_outcome', 'email_marketing', 'emergency_dispatch'],
    content: {
      summary: 'Q3 Emergency Chiller Email Campaign achieved 38% conversion when leading with guaranteed sub-15m dispatch and zero-downtime refrigeration SLA.',
      metrics: { conversionRate: 0.38, closedDeals: 14 }
    },
    authority: 'CAMPAIGN_DECISION',
    importance: 0.95,
    createdAt: new Date().toISOString(),
  });
  memoryRetriever.addRecord({
    id: 'mem_002',
    organizationId: 'biz_learning_verify',
    businessId: 'biz_learning_verify',
    memoryType: 'semantic',
    tags: ['customer_feedback', 'sales_call'],
    content: {
      summary: 'Commercial food processing facility managers responded strongly to "guaranteed 20% lower seasonal energy overhead" but ignored generic "energy efficiency" claims.',
      sentiment: 'HIGHLY_POSITIVE'
    },
    authority: 'AGENT_INFERENCE',
    importance: 0.85,
    createdAt: new Date().toISOString(),
  });

  const contextBuilder = new ContextBuilder({ memoryRetriever });
  contextBuilder.registerBusinessDNA(dna);

  // ─── Test 1: Real Successful Execution through NVIDIA NIM Gateway ─────────
  console.log("\n--- [Test 1] Real LLM Call: Pattern extraction & voice adaptation ---");
  
  const agent = new LearningAgent(contextBuilder);

  const result = await agent.executeTask({
    taskId: 'task_learn_verify_001',
    businessId: 'biz_learning_verify',
    role: 'learning',
    taskType: 'brand_analysis',
    prompt: 'Analyze high-converting contractor customer outreach campaigns from Q3, extract recurring psychological triggers that drove 15-minute emergency repair closes, and recommend vocabulary adjustments.',
  });

  console.log("\n✅ Actual Model Output Data from LearningAgent:");
  console.log(JSON.stringify(result.outputData, null, 2));
  console.log("\nSummary Output:");
  console.log(result.outputSummary);

  if (!result.outputData.winningPatterns || result.outputData.confidenceScore === undefined) {
    throw new Error("Missing required validated schema properties in actual output!");
  }

  // ─── Test 2: Error Surface Test (Forced Invalid LLM Response) ────────────────
  console.log("\n--- [Test 2] Fail-Closed Proof: Forcing invalid LLM response ---");

  const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
  
  try {
    LLMProviderGateway.executeWithFallback = async () => ({
      text: "Non-JSON unparseable output from model",
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60, estimatedCostUsd: 0.0001, latencyMs: 20 },
    });

    let threw = false;
    try {
      await agent.executeTask({
        taskId: 'task_learn_verify_002',
        businessId: 'biz_learning_verify',
        role: 'learning',
        taskType: 'brand_analysis',
        prompt: 'Run failing learning audit',
      });
    } catch (err) {
      threw = true;
      console.log("✅ Expected failure caught cleanly (NO mock data returned):");
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    }

    if (!threw) {
      throw new Error("FAILED: LearningAgent did not throw an error on malformed LLM response!");
    }
  } finally {
    LLMProviderGateway.executeWithFallback = originalExecute;
  }

  console.log("\n================================================================================");
  console.log("🎉 LearningAgent Verification PASSED: Real LLM JSON output parsed + Fail-Closed verified");
  console.log("================================================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
