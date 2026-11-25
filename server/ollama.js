import {pathToFileURL} from 'node:url';
import {draftSchema} from '../src/draft.js';

const endpoint = 'http://127.0.0.1:11434';

async function call(route, body) {
  const response = await fetch(endpoint + route, {
    redirect: 'error', signal: AbortSignal.timeout(body ? 180000 : 5000),
    ...(body && {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
  });
  if (!response.ok) throw new Error('Ollama request failed.');
  return response.json();
}

async function getAdapter() {
  const configured = process.env.SKYNZ_LOCAL_OLLAMA_ADAPTER;
  if (configured) return import(pathToFileURL(configured).href);
  return {
    async ollamaModels() {
      return (await call('/api/tags')).models;
    },
    async ollamaChat({model, messages, format}) {
      return call('/api/chat', {
        model, messages, stream: false, think: false, format,
        options: {num_gpu: 0, num_predict: 384}
      });
    }
  };
}

export function createOllamaMiddleware(port) {
  const local = '127.0.0.1:' + port;
  return async (req, res, next) => {
    if (req.url !== '/api/local-ai') return next();
    const send = (code, body) => {
      res.writeHead(code, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      res.end(JSON.stringify(body));
    };

    if (req.headers.host !== local || (req.headers.origin && req.headers.origin !== 'http://' + local) ||
        req.headers['sec-fetch-site'] === 'cross-site') return send(403, {error: 'Local requests only.'});
    try {
      const adapter = await getAdapter();
      if (req.method === 'GET') {
        const models = await adapter.ollamaModels(endpoint);
        return send(200, {models: models.map(({name}) => name).filter(name => typeof name === 'string' && !name.endsWith('-cloud') && !name.includes(':cloud'))});
      }
      if (req.method !== 'POST' || req.headers.origin !== 'http://' + local ||
          req.headers['content-type'] !== 'application/json') return send(405, {error: 'Expected a local JSON request.'});
      let input = '';
      for await (const chunk of req) {
        input += chunk;
        if (input.length > 10000) {
          send(413, {error: 'Request too large.'});
          return;
        }
      }
      let body;
      try { body = JSON.parse(input); }
      catch { return send(400, {error: 'Invalid JSON.'}); }
      if (typeof body?.prompt !== 'string' || body.prompt.length > 6000 ||
          typeof body.model !== 'string' || body.model.length > 200 ||
          /(?:-cloud$|:cloud|\/)/i.test(body.model)) return send(400, {error: 'Select a local model and enter a brief.'});
      const models = await adapter.ollamaModels(endpoint);
      if (!models.some(({name}) => name === body.model)) return send(400, {error: 'Model is not installed.'});
      const result = await adapter.ollamaChat({
        endpoint, model: body.model, messages: [{role: 'user', content: body.prompt}],
        format: draftSchema, cpuOnly: true, options: {num_predict: 384}, signal: AbortSignal.timeout(180000)
      });
      return send(200, {text: result.message.content});
    } catch {
      return send(503, {error: 'Local AI is unavailable. Check Ollama and try again.'});
    }
  };
}
