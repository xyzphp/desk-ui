import { useRef, useState } from 'react';
import { AIResultPanel, AnchorPopover, Button, DesktopNote } from '@desk/ui';

/** Local composition only. Documentation never sends editor text to a model. */
export function DesktopNoteAIDemo() {
  const [value, setValue] = useState('开会前整理资料，确认这周目标。');
  const [snapshot, setSnapshot] = useState<{ source: string; text: string; start: number; end: number }>();
  const [output, setOutput] = useState('');
  const [undo, setUndo] = useState<{ before: string; after: string }>();
  const [error, setError] = useState('');
  const editor = useRef<HTMLTextAreaElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  function open() {
    const start = editor.current?.selectionStart ?? 0;
    const end = editor.current?.selectionEnd ?? 0;
    const from = start === end ? 0 : start;
    const to = start === end ? value.length : end;
    setSnapshot({ source: value, start: from, end: to, text: value.slice(from, to) });
    setOutput('会议前备齐资料，明确本周目标与行动安排。');
    setError('');
  }
  return (
    <div style={{ width: 'min(100%, 380px)', padding: 20 }}>
      <DesktopNote
        title="AI 文字处理（本地示例）"
        value={value}
        onValueChange={setValue}
        inputProps={{ ref: editor }}
        tools={
          <>
            <Button
              ref={anchor}
              size="sm"
              variant="quiet"
              icon="wand-sparkles"
              aria-expanded={!!snapshot}
              onMouseDown={(event) => event.preventDefault()}
              onClick={open}
            >
              模拟润色
            </Button>
            {undo && value === undo.after && (
              <Button
                size="sm"
                icon="undo-2"
                variant="quiet"
                onClick={() => {
                  setValue(undo.before);
                  setUndo(undefined);
                }}
              >
                撤销
              </Button>
            )}
          </>
        }
      />
      <AnchorPopover
        open={!!snapshot}
        anchor={anchor}
        onClose={() => setSnapshot(undefined)}
        role="dialog"
        aria-label="AI 便签草稿示例"
        style={{ width: 'min(640px, calc(100vw - 24px))', containerType: 'inline-size', containerName: 'ds-workspace' }}
      >
        <AIResultPanel
          label="本地模拟结果"
          original={snapshot?.text ?? ''}
          value={output}
          onValueChange={(value) => {
            setOutput(value);
            setError('');
          }}
          state="ready"
          error={error || undefined}
          onDiscard={() => setSnapshot(undefined)}
          labels={{
            original: '选中内容',
            result: '可编辑的示例结果',
            empty: '尚无结果',
            generating: '正在生成',
            apply: '应用到便签',
            append: '追加',
            discard: '放弃',
            retry: '重试',
            stop: '停止',
          }}
          onApply={(result) => {
            if (!snapshot) return;
            if (snapshot.source !== value) {
              setError('正文已变化，请关闭面板后重新选择');
              return;
            }
            const next = value.slice(0, snapshot.start) + result + value.slice(snapshot.end);
            if ([...next].length > 4000) {
              setError('应用后正文不能超过 4000 字');
              return;
            }
            setUndo({ before: value, after: next });
            setValue(next);
            setSnapshot(undefined);
          }}
        />
      </AnchorPopover>
    </div>
  );
}
