import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, sep } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const MAX_LINE = 160;
const HEX = /#[\da-f]{3,8}\b/i;
// 数据常量里允许直接写色值的文件（相对 packages/ui/src）：品牌渐变、原生取色器、JPEG 底色；
// 森林 / 草原 / 星空壁纸的 SVG 与 Canvas 装饰逐项移植自参考壁纸，色值与画作配套。
const HEX_ALLOWED = new Set([
  'shell/AppIcon.tsx',
  'primitives/ColorPicker.tsx',
  'domain/cropImage.ts',
  'shell/wallpapers/AquariumScene.tsx',
  'shell/wallpapers/sceneData.ts',
  'shell/wallpapers/ForestScene.tsx',
  'shell/wallpapers/GrasslandScene.tsx',
  'shell/wallpapers/GalaxyScene.tsx',
]);
// 相对仓库根目录登记的数据常量文件。
const ROOT_HEX_ALLOWED = new Set([]);
// 允许直接写色值的样式文件。
const SOURCE_STYLE_ALLOWED = new Set([
  // 森林 / 草原 / 星空壁纸的动画样式逐项移植自参考壁纸，色值与画作配套。
  'packages/ui/src/shell/wallpapers/wallpapers.css',
]);
// 已完成文案抽取的文件或目录（相对仓库根目录）：其中的代码不得再出现中文字面量，文案放进同级 locale/ 字典。
// 只增不减。
const I18N_CLEAN = [
  'packages/ui/src/foundation/messages.ts',
  'packages/ui/src/foundation/localeEnUS.ts',
  'packages/ui/src/shell/',
  'packages/ui/src/domain/',
  'packages/ui/src/layout/',
  'packages/ui/src/primitives/',
  // 文档站外壳与积木已完成双语抽取；pages/guide 的 zh 内容文件本身含中文，不登记。
  'apps/docs/src/site/',
  'apps/docs/src/blocks/',
];
const CJK = /[\u3400-\u9fff]/;
const isLocaleFile = (path) => /(^|\/)locale\//.test(path);
// 测试夹具（*.fixtures.ts）只供单元测试使用，里面的中文是测试数据，不算界面文案。
const i18nClean = (path) =>
  !isLocaleFile(path) &&
  !/\.fixtures\.tsx?$/.test(path) &&
  I18N_CLEAN.some((item) => path === item || (item.endsWith('/') && path.startsWith(item)));
// 注释里的中文不算文案：去掉整行注释、行内块注释和行尾注释后再判断。
const withoutComments = (line) =>
  /^\s*(\/\/|\/\*|\*)/.test(line) ? '' : line.replace(/\/\*.*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/, '$1');
const failures = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }
    const code = /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name);
    const style = entry.name.endsWith('.css') && entry.name !== 'tokens.css';
    if (!code && !style) continue;
    const short = relative(resolve(root, 'packages/ui/src'), path).split(sep).join('/');
    const rootRelative = relative(root, path).split(sep).join('/');
    // 文档站存在既有长字符串与示例色值，只启用中文字面量检查，行长与色值规则不适用。
    const inDocs = rootRelative.startsWith('apps/docs/src');
    const lines = (await readFile(path, 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      const label = `${relative(root, path)}:${index + 1}`;
      if (code && !inDocs && line.length > MAX_LINE) failures.push(`${label} 行长 ${line.length} > ${MAX_LINE}`);
      if (code && i18nClean(rootRelative) && CJK.test(withoutComments(line))) {
        failures.push(`${label} 已抽取文案的范围内不得写中文字面量，请放入 locale/ 字典`);
      }
      if (style && !inDocs && HEX.test(line) && !SOURCE_STYLE_ALLOWED.has(rootRelative)) {
        failures.push(`${label} 色值应引用 tokens.css 中的语义令牌`);
      }
      if (
        code &&
        !inDocs &&
        !HEX_ALLOWED.has(short) &&
        !ROOT_HEX_ALLOWED.has(rootRelative) &&
        /^[^/*]*['"`]#[\da-f]{3,8}\b/i.test(line)
      ) {
        failures.push(`${label} 代码中的色值应改用令牌，或在 check-quality.mjs 登记数据常量文件`);
      }
    });
  }
}
await visit(resolve(root, 'packages/ui/src'));
await visit(resolve(root, 'apps/docs/src'));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('组件 TS / TSX 行长、CSS / 代码色值与已抽取范围的中文字面量检查通过。');
