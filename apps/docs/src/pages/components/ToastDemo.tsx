import { useState } from 'react';
import { Button, ToastProvider, useToast } from '@xyzos/desk-ui';

function ToastActions() {
  const toast = useToast();
  const [last, setLast] = useState('尚无关闭事件');
  return <div style={{ padding: 20, position: 'relative', color: 'var(--text)' }}>
    <Button onClick={() => toast.notify({
      title: '保存完成', message: '悬停或聚焦关闭按钮可暂停计时。', tone: 'success',
      onClose: (reason) => setLast(`关闭原因：${reason}`),
    })}>普通消息</Button>{' '}
    <Button onClick={() => toast.notify({ title: '操作失败', message: '请检查输入后重试。', tone: 'error', duration: 0 })}>
      持续错误消息
    </Button>{' '}
    <Button onClick={() => { for (let index = 1; index <= 4; index++) toast.notify({ title: `排队消息 ${index}`, duration: 3000 }); }}>
      连续加入四条
    </Button>{' '}
    <Button onClick={toast.clear}>清空</Button>
    <p role="status">{last}</p>
  </div>;
}

export function ToastDemo() {
  return <ToastProvider maxVisible={2}><ToastActions /></ToastProvider>;
}
