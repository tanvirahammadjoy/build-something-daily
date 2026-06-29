import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-time proxy means the frontend and backend look same-origin to the
// browser, which sidesteps CORS/cookie-domain headaches entirely - the
// httpOnly auth cookie just works for both REST calls and the Socket.io
// handshake. In production you'd serve the built frontend behind the same
// reverse proxy/domain as the API, or set explicit CORS + cookie domains.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
