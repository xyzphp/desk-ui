import { useRef, useState } from 'react';
import { AIReferenceList, AIResultPanel, Button, MessageComposer, Stack, Text } from '@desk/ui';

/** Local composition example using synthetic history and a fixed draft result. */
export function ChatDraftAIDemo() {
  const editor = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('请查看这份设计说明，我们明天讨论。');
  const [references, setReferences] = useState<string[]>(['history']);
  const [target, setTarget] = useState<{ source: string; start: number; end: number; caret: number }>();
  const [result, setResult] = useState('请先阅读设计说明，我们明天一起讨论具体方案。');
  const [feedback, setFeedback] = useState('');
  const [undo, setUndo] = useState<{ before: string; after: string }>();
  const stale = !!target && target.source !== value;
  const preview = () => {
    const start = editor.current?.selectionStart ?? 0;
    const end = editor.current?.selectionEnd ?? 0;
    setTarget({ source: value, start: start === end ? 0 : start, end: start === end ? value.length : end, caret: end });
    setFeedback('');
  };
  const apply = (text: string, append: boolean) => {
    if (!target || stale) return;
    const start = append ? target.caret : target.start;
    const end = append ? target.caret : target.end;
    const next = value.slice(0, start) + text + value.slice(end);
    setUndo({ before: value, after: next });
    setValue(next);
    setTarget(undefined);
    setFeedback('已应用到示例草稿');
  };
  return (
    <Stack>
      <AIReferenceList
        label="聊天参考内容"
        items={[{ id: 'history', label: '历史聊天记录', content: '我：请确认讨论时间。\n\n对方：明天上午可以。' }]}
        value={references}
        onValueChange={setReferences}
        labels={{ empty: '暂无参考', preview: (item) => `查看${item.label}` }}
      />
      <MessageComposer
        label="示例聊天草稿"
        value={value}
        onValueChange={setValue}
        onSend={() => setFeedback('已触发示例发送回调')}
        sendDisabled={!!target}
        inputProps={{ ref: editor }}
        tools={
          <>
            <Button size="sm" icon="sparkles" onMouseDown={(event) => event.preventDefault()} onClick={preview}>
              预览本地 AI 草稿
            </Button>
            {undo && value === undo.after && (
              <Button
                size="sm"
                icon="undo-2"
                onClick={() => {
                  setValue(undo.before);
                  setUndo(undefined);
                }}
              >
                撤销应用
              </Button>
            )}
          </>
        }
        labels={{ send: '演示发送', sending: '正在发送', stop: '停止' }}
      />
      {target && (
        <AIResultPanel
          label="本地结果预览"
          original={target.source.slice(target.start, target.end)}
          value={result}
          onValueChange={setResult}
          state="ready"
          error={stale ? '草稿已修改，请重新载入本地结果' : undefined}
          onApply={(text) => apply(text, false)}
          onAppend={(text) => apply(text, true)}
          onDiscard={() => setTarget(undefined)}
          labels={{
            original: '选中原文',
            result: '示例结果',
            empty: '等待预览',
            generating: '正在生成',
            apply: '替换选区',
            append: '在光标处插入',
            discard: '放弃',
            retry: '重试',
            stop: '停止',
          }}
        />
      )}
      {feedback && (
        <Text role="status" tone="muted">
          {feedback}
        </Text>
      )}
    </Stack>
  );
}
