import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CodeBlock, CopyButton, CopyField } from './Copy';
import { Field } from './Field';

describe('CopyButton / CopyField / CodeBlock', () => {
  it('复制回调收到原文，异步期间禁止重复动作，成功后反馈', async () => {
    let complete!: () => void;
    const copy = vi.fn(() => new Promise<void>((resolve) => { complete = resolve; }));
    render(<CopyButton text="example" onCopy={copy} />);
    await userEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(copy).toHaveBeenCalledExactlyOnceWith('example');
    expect(screen.getByRole('button')).toBeDisabled();
    await act(async () => complete());
    expect(screen.getByRole('status')).toHaveTextContent('已复制');
  });
  it('失败显示可重试反馈，旧文本与卸载后的异步结果不回调', async () => {
    let complete!: (value: boolean) => void;
    const copied = vi.fn();
    const copy = () => new Promise<boolean>((resolve) => { complete = resolve; });
    const { rerender, unmount } = render(<CopyButton text="old" onCopy={copy} onCopied={copied} />);
    await userEvent.click(screen.getByRole('button'));
    rerender(<CopyButton text="new" onCopy={copy} onCopied={copied} />);
    await act(async () => complete(true));
    expect(copied).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button'));
    await act(async () => complete(false));
    expect(screen.getByRole('alert')).toHaveTextContent('复制失败');
    await userEvent.click(screen.getByRole('button'));
    unmount();
    await act(async () => complete(true));
    expect(copied).not.toHaveBeenCalled();
  });
  it('只读字段可通过 Field 命名，复制代码保留换行并转义标记', async () => {
    const copy = vi.fn();
    const code = '<script>example()</script>\n  second line';
    const { container } = render(<>
      <Field label="地址"><CopyField value="https://example.com/docs" onCopy={copy} /></Field>
      <CodeBlock code={code} label="示例源码" onCopy={copy} language="html" />
    </>);
    expect(screen.getByLabelText('地址')).toHaveAttribute('readonly');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe(code);
    const buttons = screen.getAllByRole('button', { name: '复制' });
    await userEvent.click(buttons[1]!);
    expect(copy).toHaveBeenLastCalledWith(code);
  });
});
