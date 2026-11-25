import { useState } from 'react';
import { CodeBlock, CopyButton, CopyField, Field, Switch } from '@xyzos/desk-ui';

/** 文档页充当宿主，只有点击时请求系统复制；组件库本身不调用剪贴板。 */
export async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

export function CopyButtonDemo() {
  const [fail, setFail] = useState(false);
  return <>
    <Switch checked={fail} onCheckedChange={setFail}>模拟复制失败</Switch>
    <CopyButton text="示例文字" onCopy={(text) => fail ? false : copyText(text)} />
    <CopyButton text="不可用" onCopy={copyText} disabled />
  </>;
}

export function CopyFieldDemo() {
  return <Field label="文档地址"><CopyField value="https://example.com/docs" onCopy={copyText} /></Field>;
}

const code = '<section>\n  <h1>按纯文本显示</h1>\n  <script>example()</script>\n</section>';
export function CodeBlockDemo() {
  return <>
    <CodeBlock label="标记文本" language="html" code={code} onCopy={copyText} />
    <CodeBlock label="自动换行" wrap code={'长内容示例 '.repeat(35)} />
  </>;
}
