import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Cererile catre /api merg la backend-ul FastAPI pornit local.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
