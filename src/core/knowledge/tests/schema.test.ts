import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  assertValidConfidence,
  confidenceTier,
  createTimestamps,
  touchTimestamps,
  createAuditEvent,
  createKnowledgeField,
  createKnowledgeFieldSchema,
  createDefaultBusinessDNA,
  validateBusinessDNA,
  BUSINESS_DNA_SCHEMA,
  ValidationIssue,
} from '../index';
import { z } from 'zod';

test('Confidence primitive tests', () => {
  assert.equal(confidenceTier(0.9), 'high');
  assert.equal(confidenceTier(0.7), 'medium');
  assert.equal(confidenceTier(0.3), 'low');

  assert.throws(() => assertValidConfidence(1.5), /between 0 and 1/);
  assert.throws(() => assertValidConfidence(-0.1), /between 0 and 1/);
});

test('Timestamps primitive tests', () => {
  const ts = createTimestamps();
  assert.ok(ts.createdAt);
  assert.ok(ts.updatedAt);
  assert.equal(ts.createdAt, ts.updatedAt);

  const updated = touchTimestamps(ts);
  assert.ok(updated.updatedAt >= ts.createdAt);
});

test('Audit primitive tests', () => {
  const audit = createAuditEvent({
    businessId: 'biz_001',
    action: 'create',
    changedBy: 'user/test@example.com',
    details: { note: 'Initial creation' },
  });

  assert.equal(audit.businessId, 'biz_001');
  assert.equal(audit.action, 'create');
  assert.equal(audit.changedBy, 'user/test@example.com');
  assert.ok(audit.id.startsWith('audit_'));
});

test('KnowledgeField primitive & schema tests', () => {
  const field = createKnowledgeField('Acme Corporation', {
    confidence: 0.95,
    source: 'website',
    modelUsed: 'claude-3-5-sonnet',
  });

  assert.equal(field.value, 'Acme Corporation');
  assert.equal(field.confidence, 0.95);
  assert.equal(field.source, 'website');
  assert.equal(field.modelUsed, 'claude-3-5-sonnet');
  assert.equal(field.approvalStatus, 'pending');

  const fieldSchema = createKnowledgeFieldSchema(z.string());
  const parseResult = fieldSchema.safeParse(field);
  assert.ok(parseResult.success);
});

test('BusinessDNA default generation & validation', () => {
  const dna = createDefaultBusinessDNA('biz_test_100', {
    companyIdentity: {
      companyName: { value: 'Brand First Tech' },
    },
  });

  assert.equal(dna.businessId, 'biz_test_100');
  assert.equal(dna.companyIdentity.companyName.value, 'Brand First Tech');
  assert.equal(dna.companyIdentity.stage.value, 'early_traction');

  // Validate with Zod schema directly
  const zodResult = BUSINESS_DNA_SCHEMA.safeParse(dna);
  assert.ok(zodResult.success, `Zod validation failed: ${JSON.stringify(zodResult.error?.issues)}`);

  // Validate with custom cross-field validator
  const validationResult = validateBusinessDNA(dna);
  assert.equal(validationResult.valid, true);
  assert.ok(validationResult.data);
});

test('BusinessDNA validator catches cross-field errors', () => {
  const dna = createDefaultBusinessDNA('biz_test_bad');

  // Set primary tone to a word listed in wordsToAvoid
  dna.brandVoice.primaryTone.value = 'authoritative';
  dna.brandVoice.wordsToAvoid.value = ['authoritative', 'cheap'];

  const validationResult = validateBusinessDNA(dna);
  assert.equal(validationResult.valid, false);
  const toneIssue = validationResult.issues.find((i: ValidationIssue) => i.field === 'brandVoice.primaryTone');
  assert.ok(toneIssue, 'Should catch primaryTone listed in wordsToAvoid');
});
