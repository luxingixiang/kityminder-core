import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src')
    }
  },
  server: { port: 5173 },
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html']
    }
  }
});
