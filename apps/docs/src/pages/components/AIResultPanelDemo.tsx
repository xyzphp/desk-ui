import { useState } from 'react';
import { AIResultPanel, Field, Notice, Select, Switch, type AIResultState } from '@xyzos/desk-ui';

export function AIResultPanelDemo() {
  const [state, setState] = useState<AIResultState>('ready');
  const [value, setValue] = useState('请提前整理会议要点，并在会后确认下一步行动。');
  const [compare, setCompare] = useState(true);
  const [applied, setApplied] = useState('');
  return <div style={{ display: 'grid', gap: 12 }}>
    <Field label="演示状态"><Select value={state} onChange={(event) => setState(event.currentTarget.value as AIResultState)}>
      <option value="idle">未生成</option><option value="generating">生成中</option><option value="ready">可应用</option><option value="error">生成失败</option>
    </Select></Field>
    <Switch checked={compare} onCheckedChange={setCompare}>对比原文</Switch>
    <AIResultPanel label="文字结果预览" original="先整理要点，会后确认下一步。" value={value} onValueChange={setValue}
      compare={compare} state={state} maxLength={500} error={state === 'error' ? '本地模拟失败，草稿已保留' : undefined}
      onStop={() => setState('ready')} onRetry={() => setState('ready')}
      onDiscard={() => { setValue(''); setState('idle'); setApplied(''); }}
      onApply={(text) => setApplied(`替换草稿：${text}`)} onAppend={(text) => setApplied(`追加草稿：${text}`)}
      labels={{ original: '当前内容', result: '生成内容', empty: '等待生成', generating: '正在生成…', apply: '应用', append: '追加', discard: '舍弃', retry: '重试', stop: '停止' }} />
    {applied && <Notice>{applied}</Notice>}
  </div>;
}
