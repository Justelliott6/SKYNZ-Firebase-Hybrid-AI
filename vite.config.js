import {defineConfig} from 'vite';
import {createOllamaMiddleware} from './server/ollama.js';

function install(server) {
  server.middlewares.use(createOllamaMiddleware(server.config.preview.port));
}

export default defineConfig({
  server: {host: '127.0.0.1', port: 4173, cors: false},
  preview: {host: '127.0.0.1', port: 4173, cors: false},
  plugins: [{
    name: 'local-ollama',
    configureServer: install,
    configurePreviewServer: install
  }]
});
