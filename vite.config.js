// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      // todo el tráfico que va a '/api' será redirigido a la URL indicada en target
      '/api': {
        target: 'https://api.datawrapper.de', // URL de la API de Datawrapper
        changeOrigin: true, // necesario para virtual hostings como GitHub pages y otros
        rewrite: (path) => path.replace(/^\/api/, ''), // elimina el prefijo '/api' antes de enviar la petición
     },
    },
  },
});
