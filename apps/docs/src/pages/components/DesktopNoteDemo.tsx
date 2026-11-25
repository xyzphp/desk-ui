import { useState } from 'react';
import { Button, DesktopNote, Switch } from '@desk/ui';

export function DesktopNoteDemo() {
  const [card, setCard] = useState(false);
  const [error, setError] = useState(false);
  return <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 14, padding: 20, width: 'min(100%, 380px)' }}>
    <Switch checked={card} onCheckedChange={setCard}>卡片栏样式</Switch>
    <DesktopNote title="会议备忘" placement={card ? 'card' : 'note'} defaultValue="准备本周例会：\n确认目标，整理问题，记录行动项。"
      error={error ? '保存失败，正文已保留' : undefined}
      tools={<Button variant="quiet" size="sm" onClick={() => setError(!error)}>{error ? '重试保存' : '模拟保存失败'}</Button>} />
  </div>;
}
