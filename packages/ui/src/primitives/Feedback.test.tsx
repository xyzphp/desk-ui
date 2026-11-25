import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CapsuleTag, Switch, Tag } from './Feedback';

describe('Switch', () => {
  it('点击标签与 Space 都切换原生状态并通知调用方', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} onChange={onChange}>显示提示</Switch>);
    const control = screen.getByRole('switch', { name: '显示提示' });

    await user.click(screen.getByText('显示提示'));
    expect(control).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(' ');
    expect(control).not.toBeChecked();
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('受控状态等待 props 更新，禁用状态不触发回调', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Switch checked={false} onCheckedChange={onCheckedChange}>显示提示</Switch>);
    const control = screen.getByRole('switch', { name: '显示提示' });
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked();

    rerender(<Switch checked disabled onCheckedChange={onCheckedChange}>显示提示</Switch>);
    expect(control).toBeChecked();
    expect(control).toBeDisabled();
    await user.click(screen.getByText('显示提示'));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('保留表单 name、value 和原生 reset，不把重置当成用户修改', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <form aria-label="偏好">
        <Switch name="tips" value="enabled" defaultChecked onCheckedChange={onCheckedChange}>显示提示</Switch>
        <button type="reset">重置</button>
      </form>,
    );
    const form = screen.getByRole('form', { name: '偏好' }) as HTMLFormElement;
    const control = screen.getByRole('switch', { name: '显示提示' });
    expect(new FormData(form).get('tips')).toBe('enabled');
    await user.click(control);
    expect(new FormData(form).has('tips')).toBe(false);
    await user.click(screen.getByRole('button', { name: '重置' }));
    expect(control).toBeChecked();
    expect(new FormData(form).get('tips')).toBe('enabled');
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });
});

describe('Tag 装饰色与胶囊标签', () => {
  it('color 覆盖 tone 的配色类，pill 追加全圆角类', () => {
    render(
      <>
        <Tag tone="success">启用</Tag>
        <Tag tone="success" color="purple" shape="pill">
          设计
        </Tag>
      </>,
    );
    expect(screen.getByText('启用')).toHaveClass('ds-tag', 'ds-tag--success');
    const decorated = screen.getByText('设计');
    expect(decorated).toHaveClass('ds-tag--color', 'ds-tag--purple', 'ds-tag--pill');
    expect(decorated).not.toHaveClass('ds-tag--success');
    expect(decorated).not.toHaveAttribute('color');
  });

  it('CapsuleTag 渲染两段并透传属性', () => {
    render(<CapsuleTag label="版本" value="1.2.0" tone="info" data-testid="capsule" />);
    const capsule = screen.getByTestId('capsule');
    expect(capsule).toHaveClass('ds-tag-capsule', 'ds-tag--info');
    expect(capsule.querySelector('.ds-tag-capsule-label')).toHaveTextContent('版本');
    expect(capsule.querySelector('.ds-tag-capsule-value')).toHaveTextContent('1.2.0');
  });
});
