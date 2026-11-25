import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { docMetadata } from './build/docMetadata.mjs';
import { llmsDocumentation } from './build/llmsDocumentation.mjs';

// 文档站是纯静态应用（hash 路由，相对 base），产物输出到 dist，可部署到任意静态托管。
export default defineConfig({
  plugins: [docMetadata(), llmsDocumentation(), react()],
  base: './',
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  build: { outDir: 'dist', sourcemap: false },
});
