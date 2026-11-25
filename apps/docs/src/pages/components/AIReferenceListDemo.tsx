import { useState } from 'react';
import { AIReferenceList, Notice } from '@desk/ui';

export function AIReferenceListDemo() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  return <div style={{ display: 'grid', gap: 12 }}>
    <AIReferenceList label="生成参考" value={selected} onValueChange={setSelected}
      items={[
        { id: 'title', label: '当前标题', content: '准备团队例会' },
        { id: 'notes', label: '会议要点', content: '确认目标、讨论进度、记录待办。' },
        { id: 'history', label: '近期历史（不可用）', disabled: true },
      ]} labels={{ empty: '暂无可用参考', preview: (item) => `查看${item.label}` }} />
    <Notice>已选择 {selected.length} 项；当前示例只展示选择状态。</Notice>
  </div>;
}
