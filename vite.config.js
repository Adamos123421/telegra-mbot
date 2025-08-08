import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

const debug = false;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/estimate': {
        target: `http://${debug ? 'localhost:3000' : '34.68.76.183:3000'}/estimate`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/estimate/, ''),
      },
      '/api/currencies': {
        target: `http://${debug ? 'localhost:3000' : '34.68.76.183:3000'}/currencies`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/currencies/, ''),
      },
      '/api/bridge': {
        target: `http://${debug ? 'localhost:3000' : '34.68.76.183:3000'}/exchange`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bridge/, ''),
      },
      '/api/data': {
        target: `http://${debug ? 'localhost:3000' : '34.68.76.183:3000'}/data`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/data/, ''),
      },
      '/api/ping': {
        target: `http://${debug ? 'localhost:3000' : '34.68.76.183:3000'}/ping`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ping/, ''),
      },
    },
  },
});

