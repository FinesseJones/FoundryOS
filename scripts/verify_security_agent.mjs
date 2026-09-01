import dotenv from 'dotenv';
dotenv.config();

import { SecurityAgent } from '../src/core/agents/security-agent.ts';
import { ContextBuilder } from '../src/core/context/context-builder.ts';
import { createDefaultBusinessDNA } from '../src/core/knowledge/index.ts';
import { LLMProviderGateway } from '../src/core/providers/llm-provider-factory.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔬 Verifying SecurityAgent: Real LLM Gateway Execution & Fail-Closed Error Tests");
  console.log("================================================================================");

  // Set up Context and Business DNA
  const dna = createDefaultBusinessDNA('biz_security_verify', {
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

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  // ─── Test 1: Real Successful Execution through NVIDIA NIM Gateway ─────────
  console.log("\n--- [Test 1] Real LLM Call: Brand security & impersonation risk audit ---");
  
  const agent = new SecurityAgent(contextBuilder);

  const result = await agent.executeTask({
    taskId: 'task_sec_verify_001',
    businessId: 'biz_security_verify',
    role: 'security',
    taskType: 'brand_analysis',
    prompt: 'Audit recent public contractor directories and competitor brand mentions for counterfeit service listings, unauthorized domain registrations, and brand safety risks.',
  });

  console.log("\n✅ Actual Model Output Data from SecurityAgent:");
  console.log(JSON.stringify(result.outputData, null, 2));
  console.log("\nSummary Output:");
  console.log(result.outputSummary);

  if (result.outputData.reputationRiskScore === undefined || !result.outputData.threatLevel) {
    throw new Error("Missing required validated schema properties in actual output!");
  }

  // ─── Test 2: Error Surface Test (Forced Invalid LLM Response) ────────────────
  console.log("\n--- [Test 2] Fail-Closed Proof: Forcing invalid LLM response ---");

  const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
  
  try {
    LLMProviderGateway.executeWithFallback = async () => ({
      text: "Malformed security response without JSON brackets",
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60, estimatedCostUsd: 0.0001, latencyMs: 20 },
    });

    let threw = false;
    try {
      await agent.executeTask({
        taskId: 'task_sec_verify_002',
        businessId: 'biz_security_verify',
        role: 'security',
        taskType: 'brand_analysis',
        prompt: 'Run failing security scan',
      });
    } catch (err) {
      threw = true;
      console.log("✅ Expected failure caught cleanly (NO mock data returned):");
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    }

    if (!threw) {
      throw new Error("FAILED: SecurityAgent did not throw an error on malformed LLM response!");
    }
  } finally {
    LLMProviderGateway.executeWithFallback = originalExecute;
  }

  console.log("\n================================================================================");
  console.log("🎉 SecurityAgent Verification PASSED: Real LLM JSON output parsed + Fail-Closed verified");
  console.log("================================================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
