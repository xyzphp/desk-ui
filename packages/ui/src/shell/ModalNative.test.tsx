import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal 原生结构入口', () => {
  it('保留 dialog > form 以及调用方标题，关闭时返回触发器焦点', () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>设置</button>
          <Modal
            open={open}
            title="原生表单"
            onCancel={() => setOpen(false)}
            className="source-dialog"
            renderNative={({ titleId }) => (
              <form>
                <h2 id={titleId}>原生表单</h2>
                <input aria-label="名称" />
              </form>
            )}
          />
        </>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole('button', { name: '设置' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '原生表单' });
    expect(dialog).toHaveClass('source-dialog');
    expect(dialog.firstElementChild?.tagName).toBe('FORM');
    expect(dialog.querySelector('.ds-modal, .ds-modal-content')).toBeNull();
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveFocus();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('忙碌时阻止取消，回调接收 busy 并由源表单禁用字段', () => {
    const cancel = vi.fn();
    render(
      <Modal
        open
        title="表单"
        busy
        onCancel={cancel}
        renderNative={({ titleId, busy }) => (
          <form>
            <h2 id={titleId}>表单</h2>
            <fieldset disabled={busy}>
              <input aria-label="名称" />
            </fieldset>
          </form>
        )}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: '表单' });
    expect(screen.getByRole('textbox')).toBeDisabled();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(cancel).not.toHaveBeenCalled();
  });
});
