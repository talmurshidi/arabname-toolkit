import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Use './' so built assets use relative paths — required for GitHub Pages
  // when deployed to a sub-path (e.g. username.github.io/repo/).
  // Override with VITE_BASE env var if deploying to a custom domain root.
  base: process.env['VITE_BASE'] ?? './',

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@services': resolve(__dirname, 'src/services'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },

  build: {
    // Single-page app — emits to dist/, deployed to Pages by
    // .github/workflows/deploy.yml.
    outDir: 'dist'
  }
});
