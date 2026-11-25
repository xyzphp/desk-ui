import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const wallpaperAssets = fileURLToPath(new URL('./src/shell/wallpapers/assets/', import.meta.url));
const imageTypes: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/**
 * 库模式会把 CSS 里的 url() 图片也内联进 ui.css，壁纸背景因此让样式表膨胀到数 MB 并在首屏加载。
 * 这里把 ui.css 中的壁纸 data URL 还原为 ./assets/ 下的独立文件；使用方的打包器按相对路径处理，
 * 直接用 <link> 引用 ui.css 时浏览器也按样式表位置解析。JS 分块里的图片仍内联（场景分块本身按需加载）。
 */
function externalCSSImages(): Plugin {
  return {
    name: 'desk-ui-external-css-images',
    apply: 'build',
    // ui.css 在 generateBundle 之后才加入产物，所以在写盘后改写文件。
    writeBundle(options, bundle) {
      const outDir = options.dir ?? 'dist';
      const files = readdirSync(wallpaperAssets).filter((name) => imageTypes[extname(name)]);
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.css')) continue;
        const target = join(outDir, output.fileName);
        let css = readFileSync(target, 'utf8');
        for (const name of files) {
          const data = readFileSync(join(wallpaperAssets, name));
          const inline = `data:${imageTypes[extname(name)]};base64,${data.toString('base64')}`;
          if (!css.includes(inline)) continue;
          css = css.split(inline).join(`./assets/${name}`);
          mkdirSync(join(outDir, 'assets'), { recursive: true });
          writeFileSync(join(outDir, 'assets', name), data);
        }
        writeFileSync(target, css);
      }
    },
  };
}

// 库模式：产出 dist/ui.js、dist/ui.css 与测试辅助 dist/test-setup.js；类型声明由 tsconfig.build.json 输出到 dist/types。
// 库模式下图片资源总是内联为 data URL，壁纸场景因此是按需加载的独立分块。
export default defineConfig({
  plugins: [react(), externalCSSImages()],
  build: {
    lib: {
      entry: { ui: 'src/index.ts', 'test-setup': 'src/test-setup.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: 'ui',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', /^lucide-react(\/|$)/, /^@testing-library\//, /^vitest(\/|$)/],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
});
