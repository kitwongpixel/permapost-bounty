import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kitwongpixel/keplr-chain-button': path.resolve(
        fileURLToPath(new URL('.', import.meta.url)),
        'packages/keplr-chain-button/src/index.ts',
      ),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  }
});
