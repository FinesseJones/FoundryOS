import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AgentIdentityRegistry } from '../../src/core/agents/agent-identity';

test('Prompt 1: Agent Registry & Bootstrap of 8 System Agents', () => {
  const registry = new AgentIdentityRegistry();
  const agents = registry.listAgentIdentities();

  assert.equal(agents.length, 8, 'Must bootstrap 8 system agents');
  const roles = agents.map((a) => a.role);
  assert.ok(roles.includes('brand'));
  assert.ok(roles.includes('content'));
  assert.ok(roles.includes('publishing'));
  assert.ok(roles.includes('website'));
  assert.ok(roles.includes('security'));
  assert.ok(roles.includes('analytics'));
  assert.ok(roles.includes('learning'));
  assert.ok(roles.includes('lead'));
});

test('Prompt 1: Agent Metadata Schema Validation', () => {
  const registry = new AgentIdentityRegistry();
  const contentAgent = registry.getAgentIdentity('content');

  assert.ok(contentAgent.agentId.includes('content'));
  assert.equal(contentAgent.role, 'content');
  assert.equal(contentAgent.version, '1.0.0');
  assert.equal(contentAgent.state, 'ACTIVE');
  assert.equal(contentAgent.ownerOrganizationId, 'system');
  assert.equal(contentAgent.reputationScore, 100);
  assert.equal(contentAgent.tasksCompleted, 0);
  assert.equal(contentAgent.tasksFailed, 0);
  assert.ok(contentAgent.createdAt);
  assert.ok(contentAgent.updatedAt);

  // Verify capability model schema
  const caps = contentAgent.capabilities;
  assert.ok(caps.allowedReadDomains.includes('dna'));
  assert.ok(caps.allowedWriteDomains.includes('content'));
  assert.ok(caps.maxTokenBudgetPerTask > 0);
  assert.ok(caps.maxDelegationDepth > 0);
  assert.ok(caps.rateLimitPerMinute > 0);
});

test('Prompt 1: Agent Lifecycle State Transitions & Access Control', () => {
  const registry = new AgentIdentityRegistry();
  const agent = registry.getAgentIdentity('security');

  assert.equal(agent.state, 'ACTIVE');

  // Active agent capability check passes
  const checkActive = registry.validateAgentCapability('security', 'write', 'audit');
  assert.equal(checkActive.allowed, true);

  // Transition to PAUSED
  registry.updateAgentState('security', 'PAUSED', 'Admin paused for maintenance');
  assert.equal(registry.getAgentIdentity('security').state, 'PAUSED');

  const checkPaused = registry.validateAgentCapability('security', 'write', 'audit');
  assert.equal(checkPaused.allowed, false);
  assert.ok(checkPaused.reason?.includes('PAUSED'));

  // Transition to SUSPENDED
  registry.updateAgentState('security', 'SUSPENDED', 'Security violation detected');
  assert.equal(registry.getAgentIdentity('security').state, 'SUSPENDED');

  const checkSuspended = registry.validateAgentCapability('security', 'write', 'audit');
  assert.equal(checkSuspended.allowed, false);
  assert.ok(checkSuspended.reason?.includes('SUSPENDED'));

  // Transition to DEPRECATED
  registry.updateAgentState('security', 'DEPRECATED', 'Version deprecated');
  assert.equal(registry.getAgentIdentity('security').state, 'DEPRECATED');

  // Reactivate
  registry.updateAgentState('security', 'ACTIVE', 'Re-activated after audit');
  assert.equal(registry.getAgentIdentity('security').state, 'ACTIVE');
  assert.equal(registry.validateAgentCapability('security', 'write', 'audit').allowed, true);
});

test('Prompt 1: Agent Capability Model Read/Write Domain Validation', () => {
  const registry = new AgentIdentityRegistry();

  // ContentAgent allowed to write 'content', but denied write to 'security'
  const allowedContentWrite = registry.validateAgentCapability('content', 'write', 'content');
  assert.equal(allowedContentWrite.allowed, true);

  const deniedContentSecurityWrite = registry.validateAgentCapability('content', 'write', 'security');
  assert.equal(deniedContentSecurityWrite.allowed, false);
  assert.ok(deniedContentSecurityWrite.reason?.includes('denied write access'));

  // SecurityAgent allowed write to 'security', denied write to 'content'
  const allowedSecurityWrite = registry.validateAgentCapability('security', 'write', 'security');
  assert.equal(allowedSecurityWrite.allowed, true);

  const deniedSecurityContentWrite = registry.validateAgentCapability('security', 'write', 'content');
  assert.equal(deniedSecurityContentWrite.allowed, false);
});

test('Prompt 1: Custom Agent Identity Registration & Task Outcome Reputation Tracking', () => {
  const registry = new AgentIdentityRegistry();

  const customAgent = registry.registerAgentIdentity({
    agentId: 'custom_compliance_v1',
    role: 'security',
    name: 'Custom Compliance Bot',
    description: 'Custom tenant compliance bot',
    ownerOrganizationId: 'org_acme_corp',
    capabilities: {
      allowedReadDomains: ['audit', 'compliance'],
      allowedWriteDomains: ['compliance'],
    },
  });

  assert.equal(customAgent.agentId, 'custom_compliance_v1');
  assert.equal(customAgent.ownerOrganizationId, 'org_acme_corp');

  // Verify reputation tracking
  registry.recordTaskOutcome('custom_compliance_v1', true);
  assert.equal(registry.getAgentIdentity('custom_compliance_v1').tasksCompleted, 1);

  registry.recordTaskOutcome('custom_compliance_v1', false);
  assert.equal(registry.getAgentIdentity('custom_compliance_v1').tasksFailed, 1);
  assert.equal(registry.getAgentIdentity('custom_compliance_v1').reputationScore, 95);
});
