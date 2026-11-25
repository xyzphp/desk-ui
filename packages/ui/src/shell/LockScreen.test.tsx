import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Desktop } from './Desktop';
import { LockCountdown } from './LockCountdown';
import { LockScreen } from './LockScreen';
import { Field, Input } from '../primitives/Field';

describe('LockScreen', () => {
  it('原生校验先于提交，字段仍由宿主管理，解锁 / 退出不改变视图', async () => {
    const unlock = vi.fn(), signOut = vi.fn();
    render(<LockScreen label="锁屏" name="示例用户" time="15:42" onUnlock={unlock} onSignOut={signOut}
      unlockFields={<Field label="验证"><Input name="verification" required /></Field>} />);
    await userEvent.click(screen.getByRole('button', { name: '解锁' })); expect(unlock).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox', { name: '验证' }), '示例');
    await userEvent.click(screen.getByRole('button', { name: '解锁' })); expect(unlock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toHaveValue('示例');
    expect(screen.getByText('屏幕已锁定')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '退出登录' })); expect(signOut).toHaveBeenCalledTimes(1);
  });
  it('内置密码框保留原生校验和显示切换，表单重置后清空并恢复隐藏', async () => {
    const unlock = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.currentTarget.reset());
    const user = userEvent.setup();
    render(<LockScreen label="锁屏" name="示例用户" time="15:42" requiresPassword onUnlock={unlock} />);
    const input = screen.getByLabelText('锁屏密码');
    const button = screen.getByRole('button', { name: '解锁' });
    await user.click(button);
    expect(unlock).not.toHaveBeenCalled();
    await user.type(input, '示例');
    await user.click(screen.getByRole('button', { name: /显示/ }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(button);
    expect(unlock).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('type', 'password');
  });
  it('忙碌禁用与 inert 阻断插槽，结束保留错误并恢复可操作入口', async () => {
    const unlock = vi.fn();
    const view = (busy: boolean) => <LockScreen label="锁屏" name="示例用户" time="15:42" busy={busy} error="请重试" onUnlock={unlock}
      unlockFields={<Field label="验证"><Input defaultValue="草稿" /></Field>} />;
    const { rerender } = render(view(false));
    await userEvent.click(screen.getByRole('textbox')); rerender(view(true));
    const input = screen.getByDisplayValue('草稿');
    expect(input).toBeDisabled(); expect(input.closest('[inert]')).not.toBeNull();
    expect(screen.getByRole('region', { name: '锁屏' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '正在解锁…' })); expect(unlock).not.toHaveBeenCalled();
    rerender(view(false)); expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent('请重试');
  });
  it('放入液态玻璃 Desktop 时保留锁屏与倒计时结构及交互', () => {
    const { container } = render(
      <Desktop cardStyle="liquid">
        <LockCountdown seconds={20} onCancel={vi.fn()} />
        <LockScreen label="锁屏" name="示例用户" time="15:42" requiresPassword onUnlock={vi.fn()} />
      </Desktop>,
    );
    expect(container.querySelector('.ds-desktop')).toHaveAttribute('data-card-style', 'liquid');
    expect(screen.getByRole('region', { name: '锁屏' })).toBeInTheDocument();
    expect(screen.getByLabelText('锁屏密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消锁屏' })).toBeInTheDocument();
  });
});
