const fields = {title: 80, tagline: 140, about: 650, action: 44};
export const palettes = {
  violet: ['#19142b', '#eee8ff', '#c5adff'],
  ocean: ['#0b2631', '#e9fbff', '#82e8df'],
  ember: ['#302019', '#fff1e8', '#ffba8f'],
  paper: ['#f9efe0', '#2c261f', '#854222']
};

export const draftSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'tagline', 'about', 'action', 'palette'],
  properties: {
    ...Object.fromEntries(Object.entries(fields).map(([key, maxLength]) => [
      key, {type: 'string', minLength: 1, maxLength}
    ])),
    palette: {type: 'string', enum: Object.keys(palettes)}
  }
};

export function validateDraft(value) {
  if (!value || typeof value !== 'object' || !Object.hasOwn(palettes, value.palette)) {
    throw new Error('Choose a supported palette.');
  }
  const result = {palette: value.palette};
  for (const [key, max] of Object.entries(fields)) {
    const text = typeof value[key] === 'string' ? value[key].trim() : '';
    if (!text || text.length > max) throw new Error('Check the ' + key + ' field (up to ' + max + ' characters).');
    result[key] = text;
  }
  return result;
}

export function lippyPrompt(brief) {
  return [
    'Lippy is helping a creator draft an original launch page. Use the creator brief as source material.',
    'Return exactly one JSON object with these keys and string values: title, tagline, about, action, palette.',
    'title must be 1-80 characters, tagline 1-140, about 1-650, action 1-44. palette must be exactly one of violet, ocean, ember, paper.',
    'Return no Markdown fences, commentary, or extra keys. Do not invent testimonials, links, dates, or credentials.',
    'Creator brief: ' + JSON.stringify(brief)
  ].join('\n');
}

export async function floaterDraft({brief, route, cloudConsent, model}, providers) {
  if (!['device', 'hybrid', 'cloud', 'ollama'].includes(route)) throw new Error('Choose an AI route.');
  if (['hybrid', 'cloud'].includes(route) && !cloudConsent) throw new Error('Allow Firebase processing for this draft first.');
  if (route === 'ollama' && !model) throw new Error('Select an installed Ollama model.');
  const result = await providers[route](lippyPrompt(brief), model);
  const json = String(result.text ?? '').trim().replace(/^\x60\x60\x60(?:json)?\s*|\s*\x60\x60\x60$/gi, '');
  let value;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error((result.source || 'The selected AI engine') + ' returned text that was not valid JSON. Your saved page is safe; try again.');
  }
  try {
    const draft = validateDraft(value);
    return {draft, source: result.source};
  } catch (error) {
    throw new Error((result.source || 'The selected AI engine') + ' returned JSON that does not match the page fields. ' + error.message + ' Your saved page is safe; try again.');
  }
}
