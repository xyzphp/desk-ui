import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSync } from '@babel/core';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(appRoot, 'src');
const componentRoot = path.join(sourceRoot, 'pages', 'components');
const registryPath = path.join(sourceRoot, 'registry.ts');
const uiRoot = path.resolve(appRoot, '../../packages/ui');
const uiPackagePath = path.join(uiRoot, 'package.json');
const iconRegistryPath = path.join(uiRoot, 'src/foundation/Icon.tsx');
const missing = Symbol('missing');

function unwrap(node) {
  let current = node;
  while (
    current &&
    [
      'TSAsExpression',
      'TSNonNullExpression',
      'TSTypeAssertion',
      'TSSatisfiesExpression',
      'ParenthesizedExpression',
    ].includes(current.type)
  ) {
    current = current.expression;
  }
  return current;
}

function parse(source, filename) {
  return parseSync(source, {
    filename,
    configFile: false,
    babelrc: false,
    parserOpts: { sourceType: 'module', plugins: ['typescript', 'jsx'] },
  }).program;
}

function propertyName(property) {
  if (property.computed) return undefined;
  return property.key?.name ?? property.key?.value;
}

async function readModule(filename) {
  const source = await readFile(filename, 'utf8');
  const program = parse(source, filename);
  const variables = new Map();
  const exports = new Set();
  const imports = new Map();

  for (const statement of program.body) {
    if (statement.type === 'ImportDeclaration') {
      const specifier = statement.source.value;
      if (!specifier.endsWith('?raw')) continue;
      const rawPath = path.resolve(path.dirname(filename), specifier.slice(0, -'?raw'.length));
      for (const item of statement.specifiers) {
        imports.set(item.local.name, await readFile(rawPath, 'utf8'));
      }
      continue;
    }

    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const item of declaration.declarations) {
      if (item.id.type !== 'Identifier') continue;
      variables.set(item.id.name, item.init);
      if (statement.type === 'ExportNamedDeclaration') exports.add(item.id.name);
    }
  }

  return { filename, variables, exports, imports };
}

function evaluate(node, module, scope = new Map(), active = new Set()) {
  const value = unwrap(node);
  if (!value) return undefined;

  switch (value.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return value.value;
    case 'NullLiteral':
      return null;
    case 'Identifier': {
      if (scope.has(value.name)) return scope.get(value.name);
      if (module.imports.has(value.name)) return module.imports.get(value.name);
      if (value.name === 'undefined') return undefined;
      if (active.has(value.name) || !module.variables.has(value.name)) return missing;
      return evaluate(module.variables.get(value.name), module, scope, new Set([...active, value.name]));
    }
    case 'TemplateLiteral': {
      let result = '';
      for (let index = 0; index < value.quasis.length; index += 1) {
        result += value.quasis[index]?.value.cooked ?? value.quasis[index]?.value.raw ?? '';
        if (index < value.expressions.length) {
          const expression = evaluate(value.expressions[index], module, scope, active);
          if (expression === missing) return missing;
          result += String(expression);
        }
      }
      return result;
    }
    case 'ArrayExpression': {
      const result = [];
      for (const item of value.elements) {
        if (!item) continue;
        if (item.type === 'SpreadElement') {
          const spread = evaluate(item.argument, module, scope, active);
          if (!Array.isArray(spread)) return missing;
          result.push(...spread);
        } else {
          const evaluated = evaluate(item, module, scope, active);
          if (evaluated === missing) return missing;
          result.push(evaluated);
        }
      }
      return result;
    }
    case 'ObjectExpression': {
      const result = {};
      for (const property of value.properties) {
        if (property.type === 'SpreadElement') {
          const spread = evaluate(property.argument, module, scope, active);
          if (!spread || typeof spread !== 'object' || Array.isArray(spread)) return missing;
          Object.assign(result, spread);
          continue;
        }
        if (property.type !== 'ObjectProperty') return missing;
        const key = property.computed
          ? evaluate(property.key, module, scope, active)
          : (property.key.name ?? property.key.value);
        const evaluated = evaluate(property.value, module, scope, active);
        if (key === missing || evaluated === missing) return missing;
        if (evaluated !== undefined) result[String(key)] = evaluated;
      }
      return result;
    }
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return { kind: 'function', node: value, scope: new Map(scope) };
    case 'MemberExpression':
    case 'OptionalMemberExpression': {
      const parent = evaluate(value.object, module, scope, active);
      const key = value.computed ? evaluate(value.property, module, scope, active) : value.property.name;
      if (parent === missing || key === missing || parent === null || parent === undefined) return missing;
      return parent[key];
    }
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const args = value.arguments.map((argument) =>
        argument.type === 'SpreadElement'
          ? evaluate(argument.argument, module, scope, active)
          : evaluate(argument, module, scope, active),
      );
      if (args.includes(missing)) return missing;
      const callee = unwrap(value.callee);
      if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
        if (unwrap(callee.object)?.name === 'JSON' && callee.property.name === 'stringify') {
          return JSON.stringify(args[0], args[1] ?? null, args[2]);
        }
        const parent = evaluate(callee.object, module, scope, active);
        const key = callee.computed ? evaluate(callee.property, module, scope, active) : callee.property.name;
        if (parent === missing || key === missing) return missing;
        if (key === 'map' && Array.isArray(parent))
          return parent.map((item, index) => invoke(args[0], [item, index, parent], module));
        if (key === 'filter' && Array.isArray(parent))
          return parent.filter((item, index) => invoke(args[0], [item, index, parent], module));
        if (key === 'includes' && typeof parent === 'string') return parent.includes(...args);
        if (key === 'join' && Array.isArray(parent)) return parent.join(...args);
        return missing;
      }
      return invoke(evaluate(callee, module, scope, active), args, module);
    }
    case 'BinaryExpression': {
      const left = evaluate(value.left, module, scope, active);
      const right = evaluate(value.right, module, scope, active);
      if (left === missing || right === missing) return missing;
      switch (value.operator) {
        case '+':
          return left + right;
        case '===':
          return left === right;
        case '!==':
          return left !== right;
        default:
          return missing;
      }
    }
    case 'LogicalExpression': {
      const left = evaluate(value.left, module, scope, active);
      if (left === missing) return missing;
      if (value.operator === '&&') return left ? evaluate(value.right, module, scope, active) : left;
      if (value.operator === '||') return left ? left : evaluate(value.right, module, scope, active);
      if (value.operator === '??') {
        return left === null || left === undefined ? evaluate(value.right, module, scope, active) : left;
      }
      return missing;
    }
    case 'ConditionalExpression':
      return evaluate(value.test, module, scope, active)
        ? evaluate(value.consequent, module, scope, active)
        : evaluate(value.alternate, module, scope, active);
    case 'UnaryExpression': {
      const argument = evaluate(value.argument, module, scope, active);
      if (argument === missing) return missing;
      return value.operator === '!' ? !argument : missing;
    }
    default:
      return missing;
  }
}

function invoke(fn, args, module) {
  if (!fn || fn.kind !== 'function') return missing;
  const scope = new Map(fn.scope);
  fn.node.params.forEach((parameter, index) => {
    const key = unwrap(parameter);
    if (key.type === 'Identifier') scope.set(key.name, args[index]);
  });
  const body = unwrap(fn.node.body);
  if (body.type !== 'BlockStatement') return evaluate(body, module, scope);
  for (const statement of body.body) {
    if (statement.type === 'ReturnStatement') return evaluate(statement.argument, module, scope);
    if (statement.type === 'IfStatement') {
      const branch = evaluate(statement.test, module, scope);
      const selected = branch ? statement.consequent : statement.alternate;
      if (selected?.type === 'ReturnStatement') return evaluate(selected.argument, module, scope);
    }
  }
  return missing;
}

function objectField(node, name, module) {
  let result = missing;
  for (const property of unwrap(node)?.properties ?? []) {
    if (property.type === 'SpreadElement') {
      const spread = evaluate(property.argument, module);
      if (spread && typeof spread === 'object' && Object.hasOwn(spread, name)) result = spread[name];
      continue;
    }
    if (property.type !== 'ObjectProperty') continue;
    const key = propertyName(property);
    if (key === name) result = evaluate(property.value, module);
  }
  return result === missing ? undefined : result;
}

function localized(value, locale) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value[locale] ?? value['zh-CN'] ?? '';
}

function required(value, context) {
  if (value === undefined || value === missing) throw new Error(`无法从组件文档提取 ${context}`);
  return value;
}

function inline(value) {
  return String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
    .trim();
}

function codeFence(code) {
  const runs = [...String(code).matchAll(/`+/g)].map((match) => match[0].length);
  return '`'.repeat(Math.max(3, ...runs.map((length) => length + 1)));
}

function renderPage(page, doc, categoryName, locale) {
  const title = localized(doc.name, locale);
  const summary = localized(doc.summary, locale);
  const zh = locale === 'zh-CN';
  const lines = [
    `# ${title}`,
    '',
    `> ${summary}`,
    '',
    zh
      ? `- 分类：${categoryName}  |  页面路由：\`#/${page.id}\``
      : `- Category: ${categoryName}  |  Docs route: \`#/${page.id}\``,
  ];
  if (!zh) {
    lines.push(
      '',
      '> English titles and summaries are localized where available; detailed usage and API descriptions keep their ComponentDoc source language.',
    );
  }
  lines.push('', zh ? '## 使用说明' : '## Usage');
  for (const item of doc.usage) lines.push(`- ${item}`);
  lines.push('', zh ? '## 示例' : '## Examples');
  for (const demo of doc.demos) {
    lines.push('', `### ${demo.title}`);
    if (demo.description) lines.push('', demo.description);
    const fence = codeFence(demo.code);
    lines.push('', `${fence}tsx`, demo.code, fence);
  }
  lines.push('', '## API');
  for (const api of doc.api) {
    lines.push(
      '',
      `### ${api.component}`,
      '',
      zh ? '| 属性 | 类型 | 默认值 | 说明 |' : '| Property | Type | Default | Description |',
      '| --- | --- | --- | --- |',
    );
    for (const prop of api.props) {
      lines.push(
        `| \`${inline(prop.name)}\` | \`${inline(prop.type)}\` | ${prop.default ? `\`${inline(prop.default)}\`` : '—'} | ${inline(prop.description)} |`,
      );
    }
  }
  lines.push('', zh ? '## 无障碍与规范' : '## Accessibility');
  for (const item of doc.a11y) lines.push(`- ${item}`);
  if (doc.iconNames) {
    lines.push(
      '',
      zh ? `## 可用图标名称（${doc.iconNames.length}）` : `## Available icon names (${doc.iconNames.length})`,
      '',
      `\`${doc.iconNames.join('`, `')}\``,
    );
  }
  return `${lines.join('\n')}\n`;
}

function commonIntro(pkg, componentCount, locale) {
  const name = pkg.name;
  const version = pkg.version && pkg.version !== '0.0.0' ? ` (v${pkg.version})` : '';
  if (locale === 'en-US') {
    return [
      `# ${name}${version}`,
      '',
      '> A React 19 and TypeScript component library for admin applications and browser desktops.',
      '',
      `Covers ${componentCount} component documentation pages, regenerated automatically from the documentation registry and ComponentDoc sources on each build.`,
      'Use only the documented component names, props, defaults, examples, and accessibility constraints. Do not infer undocumented APIs.',
      '',
      '## Quick start',
      '',
      `- Install: \`pnpm add ${name}\` or \`npm install ${name}\` (peer dependencies: \`react >= 19\`, \`react-dom >= 19\`).`,
      `- Styles (required for published npm package): import \`${name}/styles.css\` once in your application entry. When consuming source directly inside a workspace, importing \`${name}\` includes styles automatically.`,
      `- Exports: \`${name}\` (components, hooks, types), \`${name}/styles.css\` (compiled CSS in \`@layer ds\`), \`${name}/test-setup\` (Vitest + jsdom helpers).`,
      '- Theming & i18n: set `data-theme="light"` or `"dark"` on `<html>`; customize CSS variables `--accent`, `--font`, `--ds-radius-scale`, and `--ds-shadow-strength`; wrap with `<ConfigProvider locale="en-US">` (or `"zh-CN"`) and wrap app content in `<Workspace>`.',
      '- Boundaries: components perform no network requests and persist no storage; pass data, permissions, and callbacks from the host.',
      '',
    ];
  }
  return [
    `# ${name}${version}`,
    '',
    '> 面向后台应用与浏览器桌面的 React 19、TypeScript 组件库。',
    '',
    `共收录 ${componentCount} 篇组件与图标文档，在每次构建时从文档注册表与 ComponentDoc 源码自动生成。请严格以文档列出的组件名、属性、默认值、示例和无障碍说明为准，不要推测未记录的 API。`,
    '',
    '## 快速接入',
    '',
    `- 安装：\`pnpm add ${name}\` 或 \`npm install ${name}\`（peer 依赖：\`react >= 19\`、\`react-dom >= 19\`）。`,
    `- 样式（通过 npm 安装构建产物时必填）：在应用入口引入一次 \`import '${name}/styles.css'\`；在同工作区直接引用源码时，引入一次 \`${name}\` 即可带上样式。`,
    `- 公开入口：\`${name}\`（组件、Hook 与类型）、\`${name}/styles.css\`（\`@layer ds\` 样式表）、\`${name}/test-setup\`（Vitest / jsdom 测试初始化）。`,
    '- 主题与多语言：在 `<html>` 上切换 `data-theme="light"` / `"dark"`；通过 CSS 变量 `--accent`、`--font`、`--ds-radius-scale`、`--ds-shadow-strength` 定制外观；使用 `<ConfigProvider locale="zh-CN">`（或 `"en-US"`）切换语言，并用 `<Workspace>` 包裹应用内容。',
    '- 边界约定：组件本身不发网络请求、不读写浏览器存储；数据、权限、持久化与生命周期回调均由宿主注入。',
    '',
  ];
}

function bundleLinks(locale) {
  if (locale === 'en-US') {
    return [
      '## Reference bundles',
      '',
      '- [Full reference with localized English titles](./llms-full.en-US.txt)',
      '- [Complete Chinese reference](./llms-full.txt)',
      '- [Chinese index](./llms.txt)',
      '',
    ];
  }
  return [
    '## 完整参考与多语言索引',
    '',
    '- [完整中文参考](./llms-full.txt)',
    '- [英文标题本地化完整参考](./llms-full.en-US.txt)',
    '- [English index](./llms.en-US.txt)',
    '',
  ];
}

function orderedGroups(pages, categories) {
  const byCategory = new Map();
  for (const page of pages) {
    const list = byCategory.get(page.category) ?? [];
    list.push(page);
    byCategory.set(page.category, list);
  }
  const groups = [];
  const used = new Set();
  for (const category of categories) {
    const items = byCategory.get(category.id);
    if (!items?.length) continue;
    used.add(category.id);
    groups.push({ id: category.id, name: category.name, pages: items });
  }
  for (const [id, items] of byCategory) {
    if (!used.has(id)) groups.push({ id, name: id, pages: items });
  }
  return groups;
}

function indexFor(pkg, pages, categories, locale) {
  const lines = [...commonIntro(pkg, pages.length, locale), ...bundleLinks(locale)];
  const directory = locale === 'en-US' ? 'en-US' : 'zh-CN';
  for (const group of orderedGroups(pages, categories)) {
    lines.push(`## ${localized(group.name, locale)}`, '');
    for (const entry of group.pages) {
      const title = localized(entry.doc.name, locale);
      const summary = localized(entry.doc.summary, locale);
      lines.push(`- [${title}](./llms/${directory}/${entry.id}.md): ${summary}`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}

async function readUiPackage() {
  const parsed = JSON.parse(await readFile(uiPackagePath, 'utf8'));
  return {
    name: typeof parsed.name === 'string' ? parsed.name : '@xyzos/desk-ui',
    version: typeof parsed.version === 'string' ? parsed.version : '0.0.0',
  };
}

async function collectPages() {
  const registryProgram = parse(await readFile(registryPath, 'utf8'), registryPath);
  const registryModule = { filename: registryPath, variables: new Map(), exports: new Set(), imports: new Map() };
  const metadataImports = new Map();
  for (const statement of registryProgram.body) {
    if (statement.type === 'ImportDeclaration' && statement.source.value.endsWith('?metadata')) {
      const local = statement.specifiers[0]?.local.name;
      if (local) metadataImports.set(local, statement.source.value.replace('?metadata', '.tsx'));
    }
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type === 'VariableDeclaration') {
      for (const item of declaration.declarations) {
        if (item.id.type === 'Identifier') registryModule.variables.set(item.id.name, item.init);
      }
    }
  }

  const categoryNodes = unwrap(registryModule.variables.get('categories'));
  const categories = categoryNodes.elements.map((node) => ({
    id: objectField(node, 'id', registryModule),
    name: objectField(node, 'name', registryModule),
  }));
  const pageNodes = unwrap(registryModule.variables.get('pages'));
  const sourcePages = [];
  for (const node of pageNodes.elements) {
    const call = unwrap(node);
    if (call?.type !== 'CallExpression' || unwrap(call.callee)?.name !== 'component') continue;
    const id = evaluate(call.arguments[0], registryModule);
    const category = evaluate(call.arguments[1], registryModule);
    const reference = unwrap(call.arguments[3]);
    if (!id || !category || reference?.type !== 'MemberExpression') continue;
    const alias = unwrap(reference.object)?.name;
    const exportName = unwrap(reference.property)?.name;
    const importedPath = metadataImports.get(alias);
    if (!importedPath || !exportName) throw new Error(`无法从文档注册表解析组件页面 ${id}`);
    sourcePages.push({ id, category, exportName, filename: path.resolve(sourceRoot, importedPath) });
  }

  const moduleCache = new Map();
  const pages = [];
  for (const page of sourcePages) {
    let module = moduleCache.get(page.filename);
    if (!module) {
      module = await readModule(page.filename);
      moduleCache.set(page.filename, module);
    }
    const docNode = module.exports.has(page.exportName) ? module.variables.get(page.exportName) : undefined;
    if (unwrap(docNode)?.type !== 'ObjectExpression')
      throw new Error(`无法解析 ${page.filename} 的 ${page.exportName}`);
    const doc = Object.fromEntries(
      ['name', 'summary', 'usage', 'demos', 'api', 'a11y'].map((field) => [field, objectField(docNode, field, module)]),
    );
    for (const field of ['name', 'summary', 'usage', 'demos', 'api', 'a11y']) {
      required(doc[field], `${page.filename}:${page.exportName}.${field}`);
    }
    pages.push({ ...page, doc });
  }
  return { pages, categories };
}

async function collectIconNames() {
  const filename = iconRegistryPath;
  const program = parse(await readFile(filename, 'utf8'), filename);
  for (const statement of program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const item of declaration.declarations) {
      if (item.id.type !== 'Identifier' || item.id.name !== 'registry') continue;
      const registry = unwrap(item.init);
      if (registry?.type !== 'ObjectExpression') throw new Error('无法解析图标注册表');
      return registry.properties
        .filter((property) => property.type === 'ObjectProperty')
        .map((property) => propertyName(property))
        .filter(Boolean)
        .sort();
    }
  }
  throw new Error('未找到图标注册表');
}

function iconPage(pkgName, iconNames) {
  return {
    id: 'icon',
    category: 'foundation',
    doc: {
      name: { 'zh-CN': '图标', 'en-US': 'Icons' },
      summary: {
        'zh-CN': '图标组件与图库；图标名称直接对应公开的 IconName。',
        'en-US': 'Icon component and registry; names map directly to the public IconName type.',
      },
      usage: [
        '使用 Icon 的 name 指定图库中的名称，size 以像素设置；颜色继承文字颜色。',
        '图标默认 aria-hidden 且不可聚焦；提供可访问名称应由外层按钮或链接负责。',
        `组件使用方从 ${pkgName} 导入 Icon；名称必须来自下方公开图库。`,
      ],
      demos: [
        {
          title: 'Icon',
          code: `import { Icon } from '${pkgName}';\n\n<Icon name="settings" />\n<Icon name="settings" size={20} />`,
        },
      ],
      api: [
        {
          component: 'Icon',
          props: [
            { name: 'name', type: 'IconName', description: '必填，已注册的图标名称。' },
            { name: 'size', type: 'number', description: '像素尺寸；缺省为 1em。' },
            { name: 'strokeWidth', type: 'number', default: '1.8', description: '图标线宽。' },
          ],
        },
      ],
      a11y: ['图标本身默认从读屏顺序中隐藏；按钮、链接等父级控件提供可访问名称。'],
      iconNames,
    },
  };
}

export async function buildLlmsAssets() {
  const [pkg, { pages, categories }, iconNames] = await Promise.all([
    readUiPackage(),
    collectPages(),
    collectIconNames(),
  ]);
  pages.push(iconPage(pkg.name, iconNames));
  const groups = orderedGroups(pages, categories);
  const orderedPages = groups.flatMap((group) => group.pages);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const assets = new Map();

  for (const locale of ['zh-CN', 'en-US']) {
    const directory = locale === 'zh-CN' ? 'zh-CN' : 'en-US';
    const pageMarkdown = orderedPages.map((page) => ({
      page,
      markdown: renderPage(
        page,
        page.doc,
        localized(categoryNames.get(page.category) ?? page.category, locale),
        locale,
      ),
    }));
    const fullName = locale === 'zh-CN' ? 'llms-full.txt' : 'llms-full.en-US.txt';
    const indexName = locale === 'zh-CN' ? 'llms.txt' : 'llms.en-US.txt';
    const fullHeader = [
      ...commonIntro(pkg, orderedPages.length, locale),
      locale === 'en-US' ? `Index file: \`./${indexName}\`` : `索引文件：\`./${indexName}\``,
    ]
      .join('\n')
      .trim();
    assets.set(fullName, `${fullHeader}\n\n---\n\n${pageMarkdown.map((item) => item.markdown).join('\n---\n\n')}\n`);
    assets.set(indexName, indexFor(pkg, orderedPages, categories, locale));
    for (const item of pageMarkdown) assets.set(`llms/${directory}/${item.page.id}.md`, item.markdown);
  }
  return assets;
}

export function llmsDocumentation() {
  let assetPromise;
  const getAssets = () => (assetPromise ??= buildLlmsAssets());
  const invalidate = (filename) => {
    const normalized = path.resolve(filename);
    if (
      normalized === registryPath ||
      normalized === iconRegistryPath ||
      normalized === uiPackagePath ||
      normalized.startsWith(`${componentRoot}${path.sep}`)
    ) {
      assetPromise = undefined;
    }
  };
  return {
    name: 'llms-documentation-assets',
    configureServer(server) {
      server.watcher.on('change', invalidate);
      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') return next();
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/^\/+/, '');
        try {
          const assets = await getAssets();
          const content = assets.get(pathname);
          if (content === undefined) return next();
          response.statusCode = 200;
          response.setHeader(
            'Content-Type',
            pathname.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
          );
          response.setHeader('Cache-Control', 'no-cache');
          response.end(request.method === 'HEAD' ? undefined : content);
        } catch (error) {
          next(error);
        }
      });
    },
    async generateBundle() {
      const assets = await getAssets();
      for (const [fileName, source] of assets) this.emitFile({ type: 'asset', fileName, source });
    },
  };
}
