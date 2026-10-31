import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs so mobile devices & tablets on Wi-Fi can access
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    cssTarget: 'chrome61',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});

