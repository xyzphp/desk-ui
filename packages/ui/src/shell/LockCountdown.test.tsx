import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { LockCountdown } from './LockCountdown';

it('更新显示的秒数但保持读屏状态，取消按钮发出一次请求', async () => {
  const cancel = vi.fn();
  const { rerender } = render(<LockCountdown seconds={30} onCancel={cancel} />);
  expect(screen.getByRole('status')).toHaveTextContent('即将自动锁屏');
  rerender(<LockCountdown seconds={29} onCancel={cancel} />);
  expect(screen.getByText('距离锁屏还剩 29 秒')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('即将自动锁屏');
  await userEvent.click(screen.getByRole('button', { name: '取消锁屏' }));
  expect(cancel).toHaveBeenCalledTimes(1);
});
