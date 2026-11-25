import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDocMetadata } from './docMetadata.mjs';

test('共享属性与 JSX 共存，搜索覆盖属性说明且不收录示例源码', () => {
  const metadata = extractDocMetadata(
    `
    const shared = [{ name: 'onSave', description: '保存草稿' }];
    const unused = '未加载示例源码';
    export const doc: ComponentDoc = {
      name: '示例组件', summary: '摘要', usage: ['键盘操作'], a11y: ['焦点'],
      api: [{ component: 'Sample', props: [...shared] }], demos: [{ code: unused, render: () => <div /> }]
    };`,
    'sample.tsx',
  );
  assert.deepEqual(metadata.doc.name, { 'zh-CN': '示例组件' });
  assert.ok(metadata.doc.keywords.includes('onSave'));
  assert.ok(metadata.doc.keywords.includes('保存草稿'));
  assert.ok(!metadata.doc.keywords.includes('未加载示例源码'));
});
test('动态标题或没有文档的模块必须失败，避免不完整索引静默上线', () => {
  assert.throws(() => extractDocMetadata('export const Demo = () => <div />;', 'empty.tsx'), /没有可搜索/);
  assert.throws(
    () => extractDocMetadata('export const doc = {name: getTitle(), summary: "摘要"};', 'dynamic.tsx'),
    /标题和摘要/,
  );
});
test('标题和摘要支持双语对象，英文缺失时回退中文', () => {
  const metadata = extractDocMetadata(
    `
    export const doc = {
      name: { 'zh-CN': '按钮', 'en-US': 'Button' },
      summary: { 'zh-CN': '点击触发动作' },
      usage: [], a11y: [], api: [],
    };`,
    'bilingual.tsx',
  );
  assert.deepEqual(metadata.doc.name, { 'zh-CN': '按钮', 'en-US': 'Button' });
  assert.deepEqual(metadata.doc.summary, { 'zh-CN': '点击触发动作' });
});
