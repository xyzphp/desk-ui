import { readFile } from 'node:fs/promises';
import { parseSync } from '@babel/core';

const unwrap = (node) =>
  ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression'].includes(node?.type)
    ? unwrap(node.expression)
    : node;
const propertyName = (node) => node?.key?.name ?? node?.key?.value;

/** 标题与摘要接受静态字符串或 zh-CN/en-US 双语对象，统一归一化为双语结构。 */
const localizedText = (node, label, filename) => {
  const value = unwrap(node);
  if (value?.type === 'StringLiteral') return { 'zh-CN': value.value };
  if (value?.type === 'ObjectExpression') {
    const entries = new Map(
      value.properties
        .filter((prop) => prop.type === 'ObjectProperty')
        .map((prop) => [propertyName(prop), unwrap(prop.value)]),
    );
    const pick = (key) => {
      const item = entries.get(key);
      return item?.type === 'StringLiteral' ? item.value : undefined;
    };
    const zh = pick('zh-CN');
    if (!zh) throw new Error(`${filename}: ${label} 的 zh-CN 文案必须是静态字符串`);
    const en = pick('en-US');
    return en ? { 'zh-CN': zh, 'en-US': en } : { 'zh-CN': zh };
  }
  throw new Error(`${filename}: ${label} 的标题和摘要必须是静态字符串或 zh-CN/en-US 双语对象`);
};

/** 提取可静态搜索的文案，不执行文档模块、不把示例和 raw 源码塞入首屏。 */
export function extractDocMetadata(source, filename) {
  const ast = parseSync(source, {
    filename,
    configFile: false,
    babelrc: false,
    parserOpts: { sourceType: 'module', plugins: ['typescript', 'jsx'] },
  });
  const variables = new Map();
  const exported = new Set();
  for (const statement of ast.program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const item of declaration.declarations) {
      if (item.id.type !== 'Identifier') continue;
      variables.set(item.id.name, unwrap(item.init));
      if (statement.type === 'ExportNamedDeclaration') exported.add(item.id.name);
    }
  }
  const strings = (node, seen = new Set()) => {
    if (!node || typeof node !== 'object') return [];
    if (node.type === 'StringLiteral') return [node.value];
    if (node.type === 'Identifier') {
      if (seen.has(node.name) || !variables.has(node.name)) return [];
      return strings(variables.get(node.name), new Set([...seen, node.name]));
    }
    if (node.type === 'ObjectProperty') return strings(node.value, seen);
    return Object.entries(node).flatMap(([key, value]) => {
      if (['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'typeAnnotation'].includes(key))
        return [];
      return Array.isArray(value) ? value.flatMap((item) => strings(item, seen)) : strings(value, seen);
    });
  };
  const result = {};
  for (const name of exported) {
    const node = variables.get(name);
    if (node?.type !== 'ObjectExpression') continue;
    const props = new Map(
      node.properties.filter((prop) => prop.type === 'ObjectProperty').map((prop) => [propertyName(prop), prop.value]),
    );
    if (!props.has('name') || !props.has('summary')) continue;
    const title = localizedText(props.get('name'), name, filename);
    const summary = localizedText(props.get('summary'), name, filename);
    const keywords = ['usage', 'a11y', 'api'].flatMap((key) => strings(props.get(key)));
    result[name] = { name: title, summary: summary, keywords: [...new Set(keywords)] };
  }
  if (!Object.keys(result).length) throw new Error(`${filename}: 没有可搜索的组件文档元数据`);
  return result;
}

export function docMetadata() {
  return {
    name: 'docs-search-metadata',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('?metadata')) return;
      const filename = id.slice(0, -'?metadata'.length);
      this.addWatchFile(filename);
      return `export default ${JSON.stringify(extractDocMetadata(await readFile(filename, 'utf8'), filename))};`;
    },
  };
}
