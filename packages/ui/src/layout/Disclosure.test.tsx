import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Disclosure } from './Layout';
import { Field, Input } from '../primitives/Field';

describe('Disclosure', () => {
  it('用 Enter / Space 就地展开与收起，并关联面板名称', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Disclosure title="连接参数" onOpenChange={onOpenChange}>参数内容</Disclosure>);
    const trigger = screen.getByRole('button', { name: '连接参数' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: '连接参数' })).not.toBeInTheDocument();

    await user.tab();
    await user.keyboard('{Enter}');
    const panel = screen.getByRole('region', { name: '连接参数' });
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('折叠内容退出键盘顺序，重新打开仍保留未提交草稿', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Disclosure title="连接参数" defaultOpen>
          <Field label="超时"><Input defaultValue="30" /></Field>
        </Disclosure>
        <button type="button">下一项</button>
      </>,
    );
    const input = screen.getByRole('textbox', { name: '超时' });
    await user.clear(input);
    await user.type(input, '60');
    await user.click(screen.getByRole('button', { name: '连接参数' }));
    expect(screen.queryByRole('textbox', { name: '超时' })).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: '下一项' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '连接参数' }));
    expect(screen.getByRole('textbox', { name: '超时' })).toHaveValue('60');
  });

  it('受控展开只回调，禁用时保持原来的展开状态', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(<Disclosure title="连接参数" open onOpenChange={onOpenChange}>参数内容</Disclosure>);
    const trigger = screen.getByRole('button', { name: '连接参数' });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    rerender(<Disclosure title="连接参数" open disabled onOpenChange={onOpenChange}>参数内容</Disclosure>);
    await user.click(trigger);
    expect(trigger).toBeDisabled();
    expect(screen.getByRole('region', { name: '连接参数' })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('多个同名展开区使用独立的关联标识', () => {
    render(<><Disclosure title="更多" defaultOpen>第一组</Disclosure><Disclosure title="更多" defaultOpen>第二组</Disclosure></>);
    const triggers = screen.getAllByRole('button', { name: '更多' });
    const panels = screen.getAllByRole('region', { name: '更多' });
    expect(triggers[0]).toHaveAttribute('aria-controls', panels[0]?.id);
    expect(triggers[1]).toHaveAttribute('aria-controls', panels[1]?.id);
    expect(panels[0]?.id).not.toBe(panels[1]?.id);
  });
});
