import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/estimate': {
        target: 'https://estimate-pwil4mmbgq-uc.a.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/estimate/, ''),
      },
      '/api/currencies': {
        target: 'https://getcurrencies-pwil4mmbgq-uc.a.run.app/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/currencies/, ''),
      },
      '/api/bridge': {
        target: 'https://bridgeandmessage-pwil4mmbgq-uc.a.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bridge/, ''),
      },
    },
  },
});

