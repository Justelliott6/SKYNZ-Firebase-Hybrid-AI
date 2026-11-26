import {defineConfig} from 'vite';
import {createOllamaMiddleware} from './server/ollama.js';

function install(server, port) {
  server.middlewares.use(createOllamaMiddleware(port));
}

export default defineConfig({
  server: {host: '127.0.0.1', port: 4173, cors: false},
  preview: {host: '127.0.0.1', port: 4173, cors: false},
  plugins: [{
    name: 'local-ollama',
    configureServer(server) { install(server, server.config.server.port); },
    configurePreviewServer(server) { install(server, server.config.preview.port); }
  }]
});
