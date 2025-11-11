import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pmo-example-match3-game/',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
});
