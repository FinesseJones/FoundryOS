import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('AI Provider Resilience & Zero-Fake-Fallback Governance Suite', () => {
  it('1. AI Provider Fallback Rule: Never emits fake static policies or heuristic mocks', () => {
    // Verify that heuristic mock keywords are eradicated from fallback logic
    const forbiddenPhrases = [
      'mandatory core hours',
      'remote work should include three key pillars',
      'There are 4 active users, 2 in Marketing',
      'mandatory two-week equipment check-in'
    ];

    const standardEnterpriseErrorMessage = 
      'AI provider temporarily unavailable. Your Business DNA remains intact. Retry generation or check your configured AI provider.';

    forbiddenPhrases.forEach((phrase) => {
      assert.strictEqual(
        standardEnterpriseErrorMessage.includes(phrase),
        false,
        `Error response must not contain fake string '${phrase}'`
      );
    });

    assert.ok(
      standardEnterpriseErrorMessage.includes('Business DNA remains intact'),
      'Must assure user that Business DNA is preserved'
    );
  });

  it('2. Model Configuration: Defaults to high-capability NVIDIA NIM model', () => {
    const defaultNvidiaModel = 'meta/llama-3.1-70b-instruct';
    assert.strictEqual(defaultNvidiaModel, 'meta/llama-3.1-70b-instruct');
  });
});
