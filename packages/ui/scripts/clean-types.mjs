// 类型声明保留了源码里的 CSS 副作用导入（如 import './Button.css'），使用方的类型检查无法解析这些模块。
// 构建后从 dist/types 中删除这些行；样式由 dist/ui.js 引入，不受影响。
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../dist/types/', import.meta.url).pathname;
const cssImport = /^import\s+['"][^'"]+\.css['"];\r?\n/gm;
let changed = 0;
for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.d.ts')) continue;
  const file = join(entry.parentPath, entry.name);
  const source = await readFile(file, 'utf8');
  const next = source.replace(cssImport, '');
  if (next !== source) {
    await writeFile(file, next);
    changed += 1;
  }
}
console.log(`clean-types: removed CSS imports from ${changed} declaration files`);
