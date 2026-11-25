import { useState } from 'react';
import { Button, SystemDialog } from '@desk/ui';

/** A local controlled sequence; actual session and cancellation belong to the host. */
export function DialogQueueDemo() {
  const [queue, setQueue] = useState<readonly string[]>([]);
  const [completed, setCompleted] = useState(0);
  const current = queue[0];
  const next = () => {
    setQueue((items) => items.slice(1));
    setCompleted((count) => count + 1);
  };
  return (
    <>
      <Button
        disabled={!!current}
        onClick={() => {
          setCompleted(0);
          setQueue(['第一项提示', '第二项提示']);
        }}
      >
        演示依次显示
      </Button>
      {current && (
        <SystemDialog
          key={current}
          open
          title={current}
          message="当前项关闭后，继续显示下一项。"
          initialFocus={0}
          onCancel={next}
          actions={[{ label: '知道了', variant: 'primary', onClick: next }]}
        />
      )}
      {completed > 0 && <p role="status">已关闭 {completed} 项</p>}
    </>
  );
}
