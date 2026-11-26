const limits = {title: 80, tagline: 140, about: 650, action: 44};
export const palettes = {
  violet: ['#19142b', '#eee8ff', '#c5adff'],
  ocean: ['#0b2631', '#e9fbff', '#82e8df'],
  ember: ['#302019', '#fff1e8', '#ffba8f'],
  paper: ['#f9efe0', '#2c261f', '#854222']
};

const enums = {
  layout: ['editorial', 'spotlight', 'grid', 'split'],
  background: ['solid', 'aurora', 'sunset', 'paper'],
  font: ['system', 'serif', 'rounded', 'mono'],
  widgetPosition: ['below', 'left', 'right'],
  widgetWidth: ['compact', 'balanced', 'wide'],
  animation: ['none', 'fade', 'rise'],
  provider: ['youtube', 'spotify', 'soundcloud', 'twitch', 'link']
};

const string = (maxLength, minLength = 0) => ({type: 'string', minLength, maxLength});
export const draftSchema = {
  type: 'object', additionalProperties: false,
  required: [...Object.keys(limits), 'palette', ...Object.keys(enums).filter(key => key !== 'provider'), 'backgroundColor', 'textColor', 'accentColor', 'artworkUrl', 'actionUrl', 'streamUrl', 'sections', 'media'],
  properties: {
    ...Object.fromEntries(Object.entries(limits).map(([key, max]) => [key, string(max, 1)])),
    palette: {type: 'string', enum: Object.keys(palettes)},
    layout: {type: 'string', enum: enums.layout},
    background: {type: 'string', enum: enums.background},
    font: {type: 'string', enum: enums.font},
    widgetPosition: {type: 'string', enum: enums.widgetPosition},
    widgetWidth: {type: 'string', enum: enums.widgetWidth},
    animation: {type: 'string', enum: enums.animation},
    backgroundColor: {type: 'string'}, textColor: {type: 'string'}, accentColor: {type: 'string'},
    artworkUrl: string(600), actionUrl: string(600), streamUrl: string(600),
    sections: {type: 'array', maxItems: 4, items: {type: 'object', additionalProperties: false, required: ['heading', 'body'], properties: {heading: string(60, 1), body: string(280, 1)}}},
    media: {type: 'array', maxItems: 4, items: {type: 'object', additionalProperties: false, required: ['provider', 'label', 'url'], properties: {provider: {type: 'string', enum: enums.provider}, label: string(48, 1), url: string(600, 1)}}}
  }
};

const fallback = (palette = 'violet') => {
  const [backgroundColor, textColor, accentColor] = palettes[palette] || palettes.violet;
  return {layout: 'editorial', background: 'solid', backgroundColor, textColor, accentColor,
    font: 'system', widgetPosition: 'below', widgetWidth: 'balanced', animation: 'none',
    artworkUrl: '', actionUrl: '', streamUrl: '', sections: [], media: []};
};

function safeHttps(value, label, optional = false) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text && optional) return '';
  let url;
  try { url = new URL(text); } catch { throw new Error('Enter a valid HTTPS ' + label + ' URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 600) throw new Error('Only safe HTTPS ' + label + ' URLs are supported.');
  return url.href;
}

export function normalizeMedia(item) {
  if (!item || !enums.provider.includes(item.provider)) throw new Error('Choose a supported media type.');
  const label = String(item.label || '').trim();
  if (!label || label.length > 48) throw new Error('Media labels must be 1-48 characters.');
  const url = new URL(safeHttps(item.url, 'media'));
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (item.provider === 'youtube') {
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    if (host === 'youtube.com' && ['watch', 'shorts', 'live', 'embed'].includes(url.pathname.split('/').filter(Boolean)[0])) {
      const parts = url.pathname.split('/').filter(Boolean);
      id = parts[0] === 'watch' ? url.searchParams.get('v') || '' : parts[1] || '';
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('Use a YouTube video, Short, or live URL.');
    return {provider: 'youtube', label, url: 'https://www.youtube.com/watch?v=' + id};
  }
  if (item.provider === 'spotify') {
    if (host !== 'open.spotify.com' || !/^\/(track|album|playlist|artist|episode|show)\/[A-Za-z0-9]+\/?$/.test(url.pathname)) throw new Error('Use a Spotify track, album, playlist, artist, episode, or show URL.');
    return {provider: 'spotify', label, url: 'https://open.spotify.com' + url.pathname};
  }
  if (item.provider === 'soundcloud') {
    if (host !== 'soundcloud.com' || url.pathname.split('/').filter(Boolean).length < 2) throw new Error('Use a public SoundCloud track or playlist URL.');
    return {provider: 'soundcloud', label, url: 'https://soundcloud.com' + url.pathname};
  }
  if (item.provider === 'twitch') {
    if (host !== 'twitch.tv') throw new Error('Use a Twitch channel or video URL.');
    const path = url.pathname.split('/').filter(Boolean);
    const valid = path.length === 1 && /^[A-Za-z0-9_]{1,25}$/.test(path[0]) || path.length === 2 && path[0] === 'videos' && /^[A-Za-z0-9_-]+$/.test(path[1]);
    if (!valid) throw new Error('Use a public Twitch channel or video URL.');
    return {provider: 'twitch', label, url: 'https://www.twitch.tv/' + path.join('/')};
  }
  return {provider: 'link', label, url: url.href};
}

export function streamTarget(value) {
  if (!value) return '';
  const url = new URL(safeHttps(value, 'stream'));
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'twitch.tv') return normalizeMedia({provider: 'twitch', label: 'Live stream', url: url.href}).url;
  if (host === 'youtube.com' || host === 'youtu.be') return normalizeMedia({provider: 'youtube', label: 'Live stream', url: url.href}).url;
  throw new Error('Use a public YouTube or Twitch stream URL for the OBS-compatible stream panel.');
}

export function validateDraft(value) {
  if (!value || typeof value !== 'object' || !Object.hasOwn(palettes, value.palette)) throw new Error('Choose a supported palette.');
  const result = {palette: value.palette};
  for (const [key, max] of Object.entries(limits)) {
    const text = typeof value[key] === 'string' ? value[key].trim() : '';
    if (!text || text.length > max) throw new Error('Check the ' + key + ' field (up to ' + max + ' characters).');
    result[key] = text;
  }
  const defaults = fallback(result.palette);
  for (const key of Object.keys(enums).filter(key => key !== 'provider')) {
    const valueAtKey = value[key] ?? defaults[key];
    if (!enums[key].includes(valueAtKey)) throw new Error('Choose a supported ' + key + '.');
    result[key] = valueAtKey;
  }
  for (const key of ['backgroundColor', 'textColor', 'accentColor']) {
    const color = String(value[key] ?? defaults[key]).trim();
    if (!/^#[\da-fA-F]{6}$/.test(color)) throw new Error('Use a six-digit hex color for ' + key + '.');
    result[key] = color.toLowerCase();
  }
  result.artworkUrl = safeHttps(value.artworkUrl || '', 'artwork', true);
  result.actionUrl = safeHttps(value.actionUrl || '', 'button', true);
  result.streamUrl = streamTarget(value.streamUrl || '');
  result.sections = (Array.isArray(value.sections) ? value.sections : []).slice(0, 4).map(section => {
    const heading = String(section?.heading || '').trim(), body = String(section?.body || '').trim();
    if (!heading || heading.length > 60 || !body || body.length > 280) throw new Error('Page sections need a heading (1-60) and body (1-280 characters).');
    return {heading, body};
  });
  result.media = (Array.isArray(value.media) ? value.media : []).slice(0, 4).map(normalizeMedia);
  return result;
}

export function lippyPrompt(brief) {
  return [
    'Lippy helps a creator design an original, complete launch page. Floater routes this structured design to the selected model; the page-design capability renders it.',
    'Return exactly one JSON object matching the provided schema. Think in visual composition, not just marketing copy. Make a distinctive layout and color system suited to the creator, audience, medium and requested vibe.',
    'Choose layout editorial, spotlight, grid, or split. Choose background solid, aurora, sunset, or paper. Choose font system, serif, rounded, or mono; choose widgetPosition below, left, or right; widgetWidth compact, balanced, or wide; animation none, fade, or rise. Use six-digit hex colors that contrast accessibly.',
    'Create up to four useful sections and up to four media items. Only include an embed if the creator explicitly supplied a supported public URL: YouTube video/Short/live, Spotify open.spotify.com item, SoundCloud public track/playlist, or Twitch channel/video. Otherwise return an empty media array. Never invent URLs, links, images, stream keys, testimonials or credentials.',
    'artworkUrl, actionUrl and streamUrl must be empty unless the creator supplied that exact HTTPS URL. streamUrl may only be a public YouTube or Twitch channel/video URL. Never return HTML, CSS, JavaScript, code, or unrequested personal data. Keep title 1-80, tagline 1-140, about 1-650 and action 1-44 characters. palette must be violet, ocean, ember or paper.',
    'Creator brief: ' + JSON.stringify(brief)
  ].join('\n');
}

export async function floaterDraft({brief, route, cloudConsent, model}, providers) {
  if (!['device', 'hybrid', 'cloud', 'ollama'].includes(route)) throw new Error('Choose an AI route.');
  if (['hybrid', 'cloud'].includes(route) && !cloudConsent) throw new Error('Allow Firebase processing for this draft first.');
  if (route === 'ollama' && !model) throw new Error('Select an installed Ollama model.');
  const response = await providers[route](lippyPrompt(brief), model);
  const json = String(response.text ?? '').trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  let value;
  try { value = JSON.parse(json); }
  catch { throw new Error((response.source || 'The selected AI engine') + ' returned text that was not valid JSON. Your saved page is safe; try again.'); }
  try { return {draft: validateDraft(value), source: response.source}; }
  catch (error) { throw new Error((response.source || 'The selected AI engine') + ' returned a design that failed validation. ' + error.message + ' Your saved page is safe; try again.'); }
}

