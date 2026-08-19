import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultBusinessDNA } from '../index';

test('Launch Blocker Audit 2 & 3: Synthetic demo DNA must carry GENERATED/INFERRED status and NEVER appear as VERIFIED', () => {
  const dna = createDefaultBusinessDNA('biz_audit_test_001');

  // Verify company identity fallbacks
  assert.equal(dna.companyIdentity.legalName?.originType, 'UNKNOWN');
  assert.equal(dna.companyIdentity.legalName?.confidence, 0.0);

  // Industry & Stage fallbacks
  assert.equal(dna.companyIdentity.industry?.originType, 'GENERATED');
  assert.equal(dna.companyIdentity.industry?.confidence, 0.5);
  assert.equal(dna.companyIdentity.industry?.approvalStatus, 'pending');
  assert.equal(dna.companyIdentity.industry?.source, 'synthetic_template_fallback');

  // Mission & UVP fallbacks
  assert.equal(dna.companyIdentity.mission?.originType, 'GENERATED');
  assert.equal(dna.companyIdentity.mission?.confidence, 0.5);
  assert.equal(dna.companyIdentity.mission?.approvalStatus, 'pending');

  // Verify that NO synthetic default field is tagged as VERIFIED or approved
  const fields = [
    dna.companyIdentity.mission,
    dna.companyIdentity.uniqueValueProposition,
    dna.brandVoice.primaryTone,
    dna.customerProfile.targetAudience,
    dna.competitivePositioning.marketPosition,
  ];

  for (const field of fields) {
    assert.notEqual(field?.originType, 'VERIFIED');
    assert.notEqual(field?.approvalStatus, 'approved');
  }
});
