import './style.css';
import {firebaseDraft, firebaseReady} from './firebase-ai.js';
import {floaterDraft, normalizeMedia, palettes, streamTarget, validateDraft} from './draft.js';

const get = id => document.getElementById(id);
const editor = get('editor');
const storageKey = 'skynz-launch-canvas:v2';
const legacyStorageKey = 'skynz-launch-canvas:v1';
let mediaItems = [];
let animationTimer;
const samples = [
  'I am an independent synth-rock musician launching my Neon Afterglow EP. Make it feel like a midnight city concert: dramatic spotlight layout, electric blue against near-black, bold modern type, a listen section, show dates and a live video. Use this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'I am a Texas Gulf Coast painter releasing a collection called Salt & Sun. Build a warm editorial portfolio with sand, sea-glass green and coral colors, a serif headline, a gallery introduction and a section about my process. I want visitors to commission a painting.'
];

function status(message) { get('status').textContent = message; }
function fields() { return Object.fromEntries(new FormData(editor)); }
function getSections() {
  return [...get('section-editor').querySelectorAll('.section-row')].map(row => ({
    heading: row.querySelector('[data-field="heading"]').value,
    body: row.querySelector('[data-field="body"]').value
  }));
}
function addSection(section = {heading: '', body: ''}) {
  const container = get('section-editor');
  if (container.children.length >= 4) return status('A page can have up to four custom sections.');
  const row = document.createElement('div'); row.className = 'section-row';
  const heading = document.createElement('input'); heading.maxLength = 60; heading.value = section.heading || ''; heading.dataset.field = 'heading'; heading.setAttribute('aria-label', 'Section heading');
  const body = document.createElement('textarea'); body.maxLength = 280; body.rows = 3; body.value = section.body || ''; body.dataset.field = 'body'; body.setAttribute('aria-label', 'Section text');
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'quiet'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove page section');
  remove.addEventListener('click', () => { row.remove(); renderPreview(); });
  row.append(labelled('Section heading', heading), labelled('Section text', body), remove);
  container.append(row);
}
function labelled(text, control) { const label = document.createElement('label'); label.append(document.createTextNode(text), control); return label; }

function renderMediaEditor() {
  const root = get('media-editor'); root.replaceChildren();
  mediaItems.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'media-row';
    const text = document.createElement('span'); text.textContent = item.label + ' � ' + item.provider;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'quiet'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove ' + item.label);
    remove.addEventListener('click', () => { mediaItems.splice(index, 1); renderMediaEditor(); renderPreview(); });
    row.append(text, remove); root.append(row);
  });
}

function frame(title, src) {
  const iframe = document.createElement('iframe');
  iframe.title = title; iframe.src = src; iframe.loading = 'lazy'; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
  return iframe;
}
function embedSource(item) {
  const url = new URL(item.url);
  if (item.provider === 'youtube') return 'https://www.youtube-nocookie.com/embed/' + url.searchParams.get('v');
  if (item.provider === 'spotify') return 'https://open.spotify.com/embed' + url.pathname;
  if (item.provider === 'soundcloud') return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(item.url) + '&auto_play=false&visual=true';
  if (item.provider === 'twitch') {
    const parts = url.pathname.split('/').filter(Boolean);
    const target = parts[0] === 'videos' ? 'video=' + encodeURIComponent(parts[1]) : 'channel=' + encodeURIComponent(parts[0]);
    return 'https://player.twitch.tv/?' + target + '&parent=' + encodeURIComponent(location.hostname) + '&muted=true';
  }
  return '';
}

function renderPreview() {
  let design;
  try { design = validateDraft({...fields(), sections: getSections(), media: mediaItems}); }
  catch { return; }
  const page = get('preview');
  page.style.setProperty('--page-bg', design.backgroundColor);
  page.style.setProperty('--page-text', design.textColor);
  page.style.setProperty('--page-accent', design.accentColor);
  page.dataset.background = design.background;
  page.dataset.font = design.font;
  page.dataset.widgetPosition = design.widgetPosition;
  page.dataset.widgetWidth = design.widgetWidth;
  page.dataset.animation = design.animation;
  page.className = 'layout-' + design.layout;
  for (const key of ['title', 'tagline', 'about']) get('page-' + key).textContent = design[key];
  const action = get('page-action');
  action.textContent = design.action; action.hidden = false;
  if (design.actionUrl) { action.href = design.actionUrl; action.target = '_blank'; action.rel = 'noopener noreferrer'; }
  else { action.removeAttribute('href'); action.removeAttribute('target'); action.removeAttribute('rel'); }
  const artwork = get('page-artwork');
  if (design.artworkUrl) { artwork.src = design.artworkUrl; artwork.alt = design.title + ' artwork'; artwork.hidden = false; }
  else { artwork.removeAttribute('src'); artwork.alt = ''; artwork.hidden = true; }

  const nav = get('page-nav'); nav.replaceChildren();
  design.sections.forEach((section, index) => {
    const link = document.createElement('a'); link.href = '#custom-section-' + index; link.textContent = section.heading; nav.append(link);
  });
  const sectionRoot = get('page-sections'); sectionRoot.replaceChildren();
  design.sections.forEach((section, index) => {
    const article = document.createElement('section'); article.className = 'custom-section'; article.id = 'custom-section-' + index;
    const heading = document.createElement('h3'); heading.textContent = section.heading;
    const body = document.createElement('p'); body.textContent = section.body;
    article.append(heading, body); sectionRoot.append(article);
  });
  const mediaRoot = get('page-media'); mediaRoot.replaceChildren();
  design.media.forEach(item => {
    const card = document.createElement('div'); card.className = 'media-card';
    const title = document.createElement('h3'); title.textContent = item.label; card.append(title);
    const src = embedSource(item);
    if (src) card.append(frame(item.label + ' � ' + item.provider, src));
    else { const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open ' + item.label; card.append(link); }
    mediaRoot.append(card);
  });
  mediaRoot.hidden = design.media.length === 0;
  const streamPanel = get('stream-panel'); const streamRoot = get('stream-embed'); streamRoot.replaceChildren();
  streamPanel.hidden = !design.streamUrl;
  if (design.streamUrl) {
    const streamItem = normalizeMedia({provider: new URL(design.streamUrl).hostname.endsWith('twitch.tv') ? 'twitch' : 'youtube', label: 'Live stream', url: design.streamUrl});
    streamRoot.append(frame('OBS-compatible public livestream', embedSource(streamItem)));
  }
  if (animationTimer) clearTimeout(animationTimer);
  page.classList.remove('is-visible');
  if (design.animation !== 'none' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationTimer = setTimeout(() => page.classList.add('is-visible'), 40);
  } else page.classList.add('is-visible');
}

function completeDesign() { return validateDraft({...fields(), sections: getSections(), media: mediaItems}); }
function apply(design) {
  for (const [key, value] of Object.entries(design)) {
    if (['sections', 'media'].includes(key)) continue;
    const input = editor.elements.namedItem(key);
    if (input) input.value = value;
  }
  get('section-editor').replaceChildren();
  design.sections.forEach(addSection);
  mediaItems = design.media;
  renderMediaEditor(); renderPreview();
}
function reopen(quiet = false) {
  try {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
    if (saved) { apply(validateDraft(JSON.parse(saved))); if (!quiet) status('Complete page design reopened.'); }
    else if (!quiet) status('No saved page yet.');
  } catch { status('Could not read the saved page. Your editor was left as it was.'); }
}
async function refreshModels() {
  const select = get('model'); const previous = select.value; select.replaceChildren();
  try {
    const response = await fetch('/api/local-ai'); if (!response.ok) throw new Error();
    const {models} = await response.json();
    for (const name of models) select.add(new Option(name, name));
    if (models.includes(previous)) select.value = previous;
    get('setup').textContent = models.length ? 'Ollama connected.' : 'Install a local Ollama model, then refresh.';
  } catch { get('setup').textContent = 'Ollama is unavailable here. Start Ollama and run the local edition.'; }
}
async function ollama(prompt, model) {
  const response = await fetch('/api/local-ai', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({model, prompt})});
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Ollama request failed.');
  return {text: payload.text, source: 'Ollama � on this computer'};
}
function updateRoute() {
  const route = get('route').value, firebaseRoute = route === 'hybrid' || route === 'cloud';
  get('consent-row').hidden = !firebaseRoute; get('consent').checked = false; get('model-row').hidden = route !== 'ollama';
  if (route === 'ollama') void refreshModels();
  else get('setup').textContent = !firebaseReady ? 'Firebase setup is required for this route. See the README or choose Ollama.'
    : route === 'cloud' ? 'Firebase cloud inference will process this design directly.'
      : route === 'hybrid' ? 'Gemini Nano is preferred; Firebase cloud is used if on-device inference is unavailable.'
        : 'Use a supported Chrome installation with Gemini Nano enabled.';
}

get('generate').addEventListener('submit', async event => {
  event.preventDefault();
  const brief = get('brief').value.trim(); if (!brief) return status('Enter a creator brief.');
  const run = get('run'), cloudConsent = get('consent').checked, route = get('route').value;
  const deviceProgress = value => status('Preparing Gemini Nano � ' + Math.round(value * 100) + '%');
  get('consent').checked = false; run.disabled = true; let generating = true;
  const progress = value => { if (generating) deviceProgress(value); };
  status('Lippy is briefing Floater � preparing your page design.');
  try {
    const result = await floaterDraft({brief, route, cloudConsent, model: get('model').value}, {
      device: prompt => firebaseDraft(prompt, 'device', progress), hybrid: prompt => firebaseDraft(prompt, 'hybrid', progress),
      cloud: prompt => firebaseDraft(prompt, 'cloud', progress), ollama
    });
    apply(result.draft); status('Page design ready � ' + result.source + '. Review and customize it before saving.');
  } catch (error) {
    console.error('SKYNZ Launch Canvas generation failed:', error);
    status(firebaseReady && route !== 'ollama' && !error.message.startsWith('AI returned') && !(['hybrid', 'cloud'].includes(route) && !cloudConsent)
      ? 'Firebase generation failed: ' + error.message : error.message);
  } finally { generating = false; run.disabled = false; }
});

editor.addEventListener('input', renderPreview);
editor.addEventListener('change', event => {
  if (event.target.name === 'palette') {
    const [backgroundColor, textColor, accentColor] = palettes[event.target.value];
    editor.elements.namedItem('backgroundColor').value = backgroundColor;
    editor.elements.namedItem('textColor').value = textColor;
    editor.elements.namedItem('accentColor').value = accentColor;
  }
  renderPreview();
});
editor.addEventListener('submit', event => {
  event.preventDefault();
  try { localStorage.setItem(storageKey, JSON.stringify(completeDesign())); status('Complete page design saved on this device.'); }
  catch (error) { status(error.message); }
});
get('media-add').addEventListener('click', () => {
  try {
    if (mediaItems.length >= 4) throw new Error('A page can feature up to four media embeds.');
    mediaItems.push(normalizeMedia({provider: get('media-provider').value, label: get('media-label').value, url: get('media-url').value}));
    get('media-label').value = ''; get('media-url').value = ''; renderMediaEditor(); renderPreview(); status('Validated media link added to the live preview.');
  } catch (error) { status(error.message); }
});
get('add-section').addEventListener('click', () => addSection());
get('restore').addEventListener('click', () => reopen());
get('export').addEventListener('click', () => {
  try {
    const blob = new Blob([JSON.stringify(completeDesign(), null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob); const download = Object.assign(document.createElement('a'), {href: url, download: 'skynz-page-design.json'});
    download.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); status('Complete design JSON exported.');
  } catch (error) { status(error.message); }
});
get('example').addEventListener('click', () => { get('brief').value = samples[0]; get('brief').focus(); });
get('example-art').addEventListener('click', () => { get('brief').value = samples[1]; get('brief').focus(); });
get('route').addEventListener('change', updateRoute); get('refresh').addEventListener('click', refreshModels);
get('section-editor').addEventListener('input', renderPreview);
reopen(true); renderMediaEditor(); renderPreview(); updateRoute();

