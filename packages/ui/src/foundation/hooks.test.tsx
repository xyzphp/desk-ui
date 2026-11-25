import { useEffect, useRef, type RefObject } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useDismiss } from './useDismiss';
import { useFormReset } from './useFormReset';
import { useLatest } from './useLatest';

describe('useLatest', () => {
  it('提交后返回最新值，重新渲染不改变引用', () => {
    const seen: RefObject<number>[] = [];
    function Probe({ value }: { value: number }) {
      const latest = useLatest(value);
      useEffect(() => { seen.push(latest); });
      return <output>{value}</output>;
    }
    const { rerender } = render(<Probe value={1} />);
    rerender(<Probe value={2} />);
    expect(seen[0]).toBe(seen[1]);
    expect(seen[1]!.current).toBe(2);
  });
});

describe('useFormReset', () => {
  function Field({ onReset, formId }: { onReset: () => void; formId?: string }) {
    const input = useRef<HTMLInputElement>(null);
    useFormReset(input, onReset, formId);
    return <input ref={input} aria-label="名称" />;
  }

  it('原生重置完成后回调一次', async () => {
    const onReset = vi.fn();
    const { container } = render(<form><Field onReset={onReset} /></form>);
    fireEvent.reset(container.querySelector('form')!);
    expect(onReset).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('被 preventDefault 的重置不回调', async () => {
    const onReset = vi.fn();
    const { container } = render(<form><Field onReset={onReset} /></form>);
    const form = container.querySelector('form')!;
    form.addEventListener('reset', (event) => event.preventDefault());
    fireEvent.reset(form);
    await Promise.resolve();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('回调变化后使用最新回调，且不重新绑定监听', async () => {
    const first = vi.fn(), second = vi.fn();
    const { container, rerender } = render(<form><Field onReset={first} /></form>);
    const form = container.querySelector('form')!;
    const add = vi.spyOn(form, 'addEventListener');
    rerender(<form><Field onReset={second} /></form>);
    expect(add).not.toHaveBeenCalled();
    fireEvent.reset(form);
    await Promise.resolve();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('卸载后不再回调', async () => {
    const onReset = vi.fn();
    const { container, unmount } = render(<form><Field onReset={onReset} /></form>);
    const form = container.querySelector('form')!;
    unmount();
    fireEvent.reset(form);
    await Promise.resolve();
    expect(onReset).not.toHaveBeenCalled();
  });
});

describe('useDismiss', () => {
  function Panel({ open = true, onDismiss, ignoreTrigger = false }: { open?: boolean; onDismiss: () => void; ignoreTrigger?: boolean }) {
    const panel = useRef<HTMLDivElement>(null);
    useDismiss({ open, panel, onDismiss, ignore: ignoreTrigger ? (target) => target.closest('[data-trigger]') !== null : undefined });
    return (
      <>
        <button data-trigger>触发</button>
        <button>外部</button>
        <div ref={panel}><button>内部</button></div>
      </>
    );
  }

  it('点击外部与 Esc 关闭，点击内部不关闭', async () => {
    const onDismiss = vi.fn();
    render(<Panel onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText('内部'));
    expect(onDismiss).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('外部'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('ignore 命中的目标不算外部', async () => {
    const onDismiss = vi.fn();
    render(<Panel onDismiss={onDismiss} ignoreTrigger />);
    await userEvent.click(screen.getByText('触发'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('未打开时不监听', async () => {
    const onDismiss = vi.fn();
    render(<Panel open={false} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText('外部'));
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('回调变化时不重新绑定文档监听', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const { rerender } = render(<Panel onDismiss={() => {}} />);
    const count = add.mock.calls.length;
    rerender(<Panel onDismiss={() => {}} />);
    rerender(<Panel onDismiss={() => {}} />);
    expect(add.mock.calls.length).toBe(count);
    add.mockRestore();
  });

  it('关闭后移除监听', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Panel onDismiss={onDismiss} />);
    rerender(<Panel open={false} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByText('外部'));
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
