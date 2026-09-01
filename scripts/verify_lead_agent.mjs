import dotenv from 'dotenv';
dotenv.config();

import { LeadAgent } from '../src/core/agents/lead-agent.ts';
import { ContextBuilder } from '../src/core/context/context-builder.ts';
import { createDefaultBusinessDNA } from '../src/core/knowledge/index.ts';
import { LLMProviderGateway } from '../src/core/providers/llm-provider-factory.ts';

async function main() {
  console.log("================================================================================");
  console.log("🔬 Verifying LeadAgent: Real LLM Gateway Execution & Fail-Closed Error Tests");
  console.log("================================================================================");

  // Set up Context and Business DNA
  const dna = createDefaultBusinessDNA('biz_lead_verify', {
    companyIdentity: {
      companyName: { value: 'Apex Commercial HVAC & Refrigeration' },
      industry: { value: 'commercial_contractor' },
      mission: { value: 'Delivering zero-downtime industrial cooling and sub-15 minute emergency dispatch.' },
      uniqueValueProposition: { value: 'Guaranteed 20% seasonal energy savings and 24/7 telemetric monitoring for food processors and warehouses.' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToUse: { value: ['uptime', 'commercial', 'certified', 'rapid-response', 'industrial'] },
      wordsToAvoid: { value: ['cheap', 'unreliable', 'discount'] },
    }
  });

  const contextBuilder = new ContextBuilder();
  contextBuilder.registerBusinessDNA(dna);

  // ─── Test 1: Real Successful Execution through NVIDIA NIM Gateway ─────────
  console.log("\n--- [Test 1] Real LLM Call: Autonomous Enterprise Lead Discovery ---");
  
  const agent = new LeadAgent(contextBuilder);

  const result = await agent.executeTask({
    taskId: 'task_lead_verify_001',
    businessId: 'biz_lead_verify',
    role: 'lead',
    taskType: 'brand_analysis',
    prompt: 'Identify 2 high-value commercial cold-storage and food processing logistics facilities suffering from legacy chiller breakdowns and high seasonal energy costs.',
    payload: {
      industry: 'commercial_refrigeration_logistics',
      batchSize: 2,
    }
  });

  console.log("\n✅ Actual Model Output Data from LeadAgent:");
  console.log(JSON.stringify(result.outputData, null, 2));
  console.log("\nSummary Output:");
  console.log(result.outputSummary);

  const leads = result.outputData.discoveredLeads;
  if (!Array.isArray(leads) || leads.length === 0) {
    throw new Error("Missing required discoveredLeads array in output!");
  }

  if (!leads[0].pillarFinancialPain || !leads[0].pillarProcessGap || !leads[0].pillarStakeholderAlignment) {
    throw new Error("Missing required 3-Pillar structure in discovered leads!");
  }

  if (leads[0].isAiEstimated !== true) {
    throw new Error("Grounded requirement failed: isAiEstimated must be true!");
  }

  if (leads[0].verificationStatus !== 'AI_ESTIMATED_VERIFY_BEFORE_OUTREACH') {
    throw new Error(`Grounded requirement failed: unexpected verificationStatus: ${leads[0].verificationStatus}`);
  }

  if (!leads[0].dataSource || !leads[0].dataSource.includes('Verify Before Outreach')) {
    throw new Error(`Grounded requirement failed: missing or invalid dataSource label: ${leads[0].dataSource}`);
  }

  console.log("\n🛡️ Grounding Validations Passed:");
  console.log(`   - isAiEstimated: ${leads[0].isAiEstimated}`);
  console.log(`   - verificationStatus: ${leads[0].verificationStatus}`);
  console.log(`   - dataSource: ${leads[0].dataSource}`);
  console.log(`   - primaryContact: ${leads[0].primaryContact}`);
  console.log(`   - targetRole: ${leads[0].targetRole || 'Synthesized'}`);

  // ─── Test 2: Error Surface Test (Forced Invalid LLM Response) ────────────────
  console.log("\n--- [Test 2] Fail-Closed Proof: Forcing invalid LLM response ---");

  const originalExecute = LLMProviderGateway.executeWithFallback.bind(LLMProviderGateway);
  
  try {
    LLMProviderGateway.executeWithFallback = async () => ({
      text: "Malformed lead response without valid JSON payload",
      providerUsed: 'nvidia',
      modelUsed: 'meta/llama-3.2-90b-vision-instruct',
      usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60, estimatedCostUsd: 0.0001, latencyMs: 20 },
    });

    let threw = false;
    try {
      await agent.executeTask({
        taskId: 'task_lead_verify_002',
        businessId: 'biz_lead_verify',
        role: 'lead',
        taskType: 'brand_analysis',
        prompt: 'Run failing lead discovery',
      });
    } catch (err) {
      threw = true;
      console.log("✅ Expected failure caught cleanly (NO mock data returned):");
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    }

    if (!threw) {
      throw new Error("FAILED: LeadAgent did not throw an error on malformed LLM response!");
    }
  } finally {
    LLMProviderGateway.executeWithFallback = originalExecute;
  }

  console.log("\n================================================================================");
  console.log("🎉 LeadAgent Verification PASSED: Real LLM JSON output parsed + Fail-Closed verified");
  console.log("================================================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
