import { useEffect, useRef, useState } from 'react';
import { AIResultPanel, AIToolbar, Checkbox, Select, type AIToolSelection } from '@desk/ui';

export function AIToolbarDemo({ emptyModels = false }: { emptyModels?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [fail, setFail] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [closed, setClosed] = useState(false);
  const [result, setResult] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = useRef(false);
  const cancel = () => {
    clearTimeout(timer.current);
    running.current = false;
    setBusy(false);
    setStatus('已停止本地演示');
  };
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      running.current = false;
    },
    [],
  );

  const generate = ({ action, model }: AIToolSelection) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setStatus('正在模拟生成…');
    setResult('');
    timer.current = setTimeout(() => {
      running.current = false;
      setBusy(false);
      setStatus('');
      setResult(fail ? '' : `本地演示完成：${action} · ${model}`);
      setError(fail ? '模拟生成失败，可修改设置后重新生成' : '');
    }, 1000);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {closed ? (
        <button type="button" onClick={() => setClosed(false)}>
          重新打开面板
        </button>
      ) : (
        <div style={{ maxWidth: 680 }}>
          <AIToolbar
            label="文字快捷工具"
            title="AI 优化"
            onClose={() => setClosed(true)}
            actions={[
              { id: 'polish', label: '润色', icon: 'sparkles' },
              { id: 'expand', label: '扩写', icon: 'expand' },
              { id: 'translate', label: '翻译', icon: 'languages' },
              { id: 'image', label: '生图', icon: 'image', disabled: true },
            ]}
            models={
              emptyModels
                ? []
                : [
                    { id: 'text-standard', label: '标准文本模型' },
                    { id: 'text-compact', label: '轻量文本模型' },
                  ]
            }
            onGenerate={generate}
            onStop={cancel}
            busy={busy}
            status={status}
            error={error}
            instruction={{
              value: instruction,
              onValueChange: setInstruction,
              label: '补充要求',
              placeholder: '补充要求（可选）',
              maxLength: 2000,
            }}
            options={
              <Select aria-label="翻译目标语言" defaultValue="zh">
                <option value="zh">中文</option>
                <option value="en">英语</option>
              </Select>
            }
            labels={{
              actions: '选择 AI 动作',
              model: '本次模型',
              generate: '生成',
              generating: '生成中',
              stop: '停止生成',
              emptyModels: '暂无可用模型',
              unavailableModel: '所选模型已不可用',
            }}
          >
            <AIResultPanel
              label="AI 草稿"
              original="先整理要点，会后确认下一步。"
              value={result}
              onValueChange={setResult}
              state={busy ? 'generating' : result ? 'ready' : 'idle'}
              onApply={() => setStatus('已应用（本地演示）')}
              onAppend={() => setStatus('已追加（本地演示）')}
              labels={{
                original: '选中内容',
                result: '生成结果',
                empty: '选择内容并生成',
                generating: '正在生成，可随时停止',
                apply: '应用',
                append: '在光标处追加',
                discard: '放弃',
                retry: '重试',
                stop: '停止生成',
              }}
            />
          </AIToolbar>
        </div>
      )}
      <Checkbox checked={fail} disabled={busy} onChange={(event) => setFail(event.currentTarget.checked)}>
        模拟失败
      </Checkbox>
    </div>
  );
}
