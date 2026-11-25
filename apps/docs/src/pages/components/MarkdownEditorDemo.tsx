import { useRef, useState } from 'react';
import { Button, Field, Inline, MarkdownEditor, Stack, Switch, Text, type MarkdownEditorHandle } from '@desk/ui';

/** 仅演示宿主返回安全 React 节点的接线，不提供第二套 Markdown 渲染器。 */
function PreviewSample({ source }: { source: string }) {
  return <Stack gap="md">{source.split('\n').map((line, index) => {
    if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith('# ')) return <h1 key={index}>{line.slice(2)}</h1>;
    if (line.startsWith('> ')) return <blockquote key={index}>{line.slice(2)}</blockquote>;
    return <Text key={index}>{line || '　'}</Text>;
  })}</Stack>;
}
const initial = '# 编辑示例\n\n选中一段文字，再使用右侧格式按钮。\n\n> 预览由宿主渲染器提供。';

export function MarkdownEditorDemo() {
  const editor = useRef<MarkdownEditorHandle>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [result, setResult] = useState('尚未读取');
  return <Stack gap="lg">
    <Switch checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)}>只读状态</Switch>
    <form onSubmit={(event) => {
      event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('body')).length + ' 个字符');
    }}>
      <Stack gap="md">
        <Field label="文档正文" hint="示例预览只演示标题与引用；生产宿主应复用原系统经过审查的 Markdown 渲染器。">
          <MarkdownEditor ref={editor} name="body" required maxLength={6000} defaultValue={initial} historyKey="demo-document"
            renderPreview={(source) => <PreviewSample source={source} />} readOnly={readOnly}
            onPickAttachment={(selection) => {
              // 宿主选择 / 上传后传入已授权引用；快照过期时 insert 返回 false。
              editor.current?.insert('[示例附件](https://example.com/attachment)', selection);
            }} onFiles={(files) => setResult(`宿主收到 ${files.length} 个待上传文件；示例没有发起上传`)} />
        </Field>
        <Inline><Button type="submit">读取表单</Button><Button type="reset">重置草稿</Button></Inline>
        <Text tone="muted" role="status">{result}</Text>
      </Stack>
    </form>
  </Stack>;
}
