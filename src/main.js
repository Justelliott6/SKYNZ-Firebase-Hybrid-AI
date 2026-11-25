import './style.css';
import {firebaseDraft, firebaseReady} from './firebase-ai.js';
import {floaterDraft, palettes, validateDraft} from './draft.js';

const get = id => document.getElementById(id);
const editor = get('editor');
const status = message => { get('status').textContent = message; };
const storageKey = 'skynz-launch-canvas:v1';
const demoBrief = 'I make limited-run ceramic mugs inspired by the Oregon coast. My next collection is Tidepool Studio. Help curious buyers join my release list. Use a warm voice and an ocean palette.';

function fields() {
  return Object.fromEntries(new FormData(editor));
}

function preview() {
  const draft = fields();
  const [background, color, accent] = palettes[draft.palette];
  const page = get('preview');
  page.style.setProperty('--page-bg', background);
  page.style.setProperty('--page-text', color);
  page.style.setProperty('--page-accent', accent);
  for (const key of ['title', 'tagline', 'about', 'action']) {
    get('page-' + key).textContent = draft[key] || (key === 'title' ? 'Your page title' : '');
  }
  get('page-action').hidden = !draft.action;
}

function apply(draft) {
  for (const [key, value] of Object.entries(draft)) editor.elements.namedItem(key).value = value;
  preview();
}

function reopen(quiet = false) {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      apply(validateDraft(JSON.parse(saved)));
      if (!quiet) status('Saved page reopened.');
    } else if (!quiet) status('No saved page yet.');
  } catch {
    status('Could not read the saved page. Your editor was left as it was.');
  }
}

async function refreshModels() {
  const select = get('model');
  const previous = select.value;
  select.replaceChildren();
  try {
    const response = await fetch('/api/local-ai');
    if (!response.ok) throw new Error();
    const {models} = await response.json();
    for (const name of models) select.add(new Option(name, name));
    if (models.includes(previous)) select.value = previous;
    get('setup').textContent = models.length ? 'Ollama connected.' : 'Install a local Ollama model, then refresh.';
  } catch {
    get('setup').textContent = 'Ollama is unavailable here. Start Ollama and run the local edition.';
  }
}

async function ollama(prompt, model) {
  const response = await fetch('/api/local-ai', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({model, prompt})
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Ollama request failed.');
  return {text: payload.text, source: 'Ollama · on this computer'};
}

function updateRoute() {
  const route = get('route').value;
  get('consent-row').hidden = route !== 'hybrid';
  get('consent').checked = false;
  get('model-row').hidden = route !== 'ollama';
  if (route === 'ollama') void refreshModels();
  else get('setup').textContent = firebaseReady
    ? 'Use a supported Chrome installation with Gemini Nano enabled.'
    : 'Firebase setup is required for this route. See the README or choose Ollama.';
}

get('generate').addEventListener('submit', async event => {
  event.preventDefault();
  const brief = get('brief').value.trim();
  if (!brief) return status('Enter a creator brief.');
  const run = get('run');
  const cloudConsent = get('consent').checked;
  const route = get('route').value;
  const deviceProgress = value => status('Preparing Gemini Nano · ' + Math.round(value * 100) + '%');
  get('consent').checked = false;
  run.disabled = true;
  let generating = true;
  const progress = value => { if (generating) deviceProgress(value); };
  status('Lippy is drafting your page…');
  try {
    const result = await floaterDraft({brief, route, cloudConsent, model: get('model').value}, {
      device: prompt => firebaseDraft(prompt, false, progress),
      hybrid: prompt => firebaseDraft(prompt, true, progress),
      ollama
    });
    apply(result.draft);
    status('Draft ready · ' + result.source + '. Review it before saving.');
  } catch (error) {
    status(firebaseReady && route !== 'ollama' && !error.message.startsWith('AI returned') &&
      !(route === 'hybrid' && !cloudConsent)
      ? 'Firebase generation failed. Check Chrome model availability and Firebase/App Check setup.'
      : error.message);
  } finally {
    generating = false;
    run.disabled = false;
  }
});

editor.addEventListener('input', preview);
editor.addEventListener('submit', event => {
  event.preventDefault();
  try {
    localStorage.setItem(storageKey, JSON.stringify(validateDraft(fields())));
    status('Page saved on this device.');
  } catch (error) { status(error.message); }
});
get('restore').addEventListener('click', () => reopen());
get('export').addEventListener('click', () => {
  try {
    const blob = new Blob([JSON.stringify(validateDraft(fields()), null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const download = Object.assign(document.createElement('a'), {href: url, download: 'skynz-page.json'});
    download.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('Page JSON exported.');
  } catch (error) { status(error.message); }
});
get('example').addEventListener('click', () => { get('brief').value = demoBrief; get('brief').focus(); });
get('route').addEventListener('change', updateRoute);
get('refresh').addEventListener('click', refreshModels);
reopen(true);
preview();
updateRoute();
