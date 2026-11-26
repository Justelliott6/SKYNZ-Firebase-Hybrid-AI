import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMedia, validateDraft} from '../src/draft.js';

const base = {title: 'Night Shift', tagline: 'Make the night yours.', about: 'Independent music for late hours.', action: 'Listen now', palette: 'violet'};

test('upgrades legacy saved page fields while preserving the original copy', () => {
  const design = validateDraft(base);
  assert.equal(design.title, base.title);
  assert.equal(design.layout, 'editorial');
  assert.deepEqual(design.sections, []);
  assert.deepEqual(design.media, []);
});

test('validates and normalizes a customized page, media, sections, and stream route', () => {
  const design = validateDraft({...base, layout: 'spotlight', background: 'aurora', font: 'serif',
    backgroundColor: '#080b18', textColor: '#ffffff', accentColor: '#34d3f5',
    sections: [{heading: 'Tour', body: 'See us live this summer.'}],
    media: [{provider: 'youtube', label: 'New video', url: 'https://youtu.be/dQw4w9WgXcQ'}],
    streamUrl: 'https://www.twitch.tv/exampleartist'});
  assert.equal(design.layout, 'spotlight');
  assert.equal(design.media[0].url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(design.streamUrl, 'https://www.twitch.tv/exampleartist');
  assert.equal(design.sections[0].heading, 'Tour');
});

test('rejects unsafe URLs, unsupported hosts, and invalid colors before rendering', () => {
  assert.throws(() => normalizeMedia({provider: 'youtube', label: 'bad', url: 'javascript:alert(1)'}));
  assert.throws(() => normalizeMedia({provider: 'spotify', label: 'bad', url: 'https://example.com/track/abc'}));
  assert.throws(() => validateDraft({...base, accentColor: 'red'}));
  assert.throws(() => validateDraft({...base, streamUrl: 'https://example.com/live'}));
});

test('accepts two visibly different layout decisions for separately generated page designs', () => {
  const artist = validateDraft({...base, layout: 'spotlight', palette: 'ember', background: 'sunset', font: 'serif'});
  const studio = validateDraft({...base, title: 'Salt & Sun', layout: 'grid', palette: 'ocean', background: 'aurora', font: 'rounded'});
  assert.notDeepEqual([artist.layout, artist.palette, artist.background, artist.font], [studio.layout, studio.palette, studio.background, studio.font]);
});

