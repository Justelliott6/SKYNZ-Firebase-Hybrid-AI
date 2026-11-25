import test from 'node:test';
import assert from 'node:assert/strict';
import {floaterDraft, validateDraft} from '../src/draft.js';
const draft = {title: 'Tidepool', tagline: 'Coastal ceramics', about: 'Handmade mugs', action: 'Join the list', palette: 'ocean'};
test('cloud fallback requires affirmative consent before calling a provider', async () => {
  await assert.rejects(floaterDraft({route: 'hybrid', cloudConsent: false}, {
    hybrid: () => assert.fail('Provider must not be invoked')
  }), /Allow cloud fallback/);
});
test('accepts valid generated content and discards unknown properties', async () => {
  const result = await floaterDraft({route: 'device', brief: 'A ceramics studio'}, {
    device: async () => ({text: JSON.stringify({...draft, script: 'ignored'}), source: 'on device'})
  });
  assert.deepEqual(result, {draft, source: 'on device'});
});
test('rejects invalid palette, missing text and oversized content', () => {
  for (const partial of [{palette: 'unknown'}, {about: 9}, {title: 'x'.repeat(81)}]) {
    assert.throws(() => validateDraft({...draft, ...partial}));
  }
});
