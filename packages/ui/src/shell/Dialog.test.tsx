import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AlertDialog, ConfirmDialog, PromptDialog, SystemDialog } from './Dialog';
import { Modal } from './Modal';
import { Drawer } from './Drawer';

const prototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(prototype, 'close');

// 仅补充 DOM 环境的原生生命周期；真实顶层、inert 与 Tab 隔离由浏览器验收方确认。
beforeAll(() => {
  Object.defineProperty(prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) {
    if (this.open) throw new DOMException('Already open', 'InvalidStateError');
    this.open = true;
  } });
  Object.defineProperty(prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterAll(() => {
  if (originalShow) Object.defineProperty(prototype, 'showModal', originalShow); else Reflect.deleteProperty(prototype, 'showModal');
  if (originalClose) Object.defineProperty(prototype, 'close', originalClose); else Reflect.deleteProperty(prototype, 'close');
});

describe('Modal', () => {
  it('标题、描述、任意内容与底部操作共存，背景默认不取消', () => {
    const cancel = vi.fn();
    render(<Modal open title="详细设置" description="设置说明" onCancel={cancel} footer={<button>保存</button>}>
      <label>名称<input defaultValue="草稿" /></label>
    </Modal>);
    const dialog = screen.getByRole('dialog', { name: '详细设置' });
    expect(dialog).toHaveAccessibleDescription('设置说明');
    expect(screen.getByLabelText('名称')).toHaveFocus();
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('关闭'));
    expect(cancel).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });
  it('忙碌禁用原生内容和动作，阻止取消；解除后保留输入内容', () => {
    const cancel = vi.fn();
    const content = <><label>名称<input defaultValue="草稿" /></label><button>操作</button></>;
    const { rerender } = render(<Modal open title="编辑" busy onCancel={cancel}>{content}</Modal>);
    expect(screen.getByLabelText('名称')).toBeDisabled();
    const event = new Event('cancel', { cancelable: true });
    fireEvent(screen.getByRole('dialog'), event);
    expect(event.defaultPrevented).toBe(true);
    expect(cancel).not.toHaveBeenCalled();
    rerender(<Modal open title="编辑" onCancel={cancel}>{content}</Modal>);
    expect(screen.getByLabelText('名称')).toBeEnabled();
    expect(screen.getByLabelText('名称')).toHaveValue('草稿');
  });
});

describe('Drawer', () => {
  it('内容聚焦、标题描述、取消与关闭后焦点返回共用模态层', () => {
    const cancel = vi.fn();
    const content = (open: boolean) => <><button>打开详情</button>
      <Drawer open={open} title="任务详情" description="编辑内容" onCancel={cancel} placement="left">
        <label>名称<input defaultValue="草稿" /></label>
      </Drawer></>;
    const { rerender } = render(content(false));
    screen.getByText('打开详情').focus();
    rerender(content(true));
    expect(screen.getByRole('dialog', { name: '任务详情' })).toHaveAccessibleDescription('编辑内容');
    expect(screen.getByLabelText('名称')).toHaveFocus();
    fireEvent.click(screen.getByLabelText('关闭抽屉'));
    expect(cancel).toHaveBeenCalledOnce();
    rerender(content(false));
    expect(screen.getByText('打开详情')).toHaveFocus();
  });
  it('忙碌阻止取消，解除后点击背景请求关闭且保留草稿', () => {
    const cancel = vi.fn();
    const view = (busy: boolean) => <Drawer open title="详情" busy={busy} onCancel={cancel}>
      <label>名称<input defaultValue="草稿" /></label>
    </Drawer>;
    const { rerender } = render(view(true));
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(cancel).not.toHaveBeenCalled();
    expect(screen.getByLabelText('名称')).toBeDisabled();
    rerender(view(false));
    expect(screen.getByLabelText('名称')).toHaveValue('草稿');
    fireEvent.pointerDown(dialog); fireEvent.click(dialog);
    expect(cancel).toHaveBeenCalledOnce();
  });
});

describe('ConfirmDialog', () => {
  const base = { title: '删除项目？', message: '所有记录都会删除。', confirmLabel: '删除项目', cancelLabel: '取消' };

  it('危险确认关联描述并聚焦取消，只请求动作，关闭后归还触发器焦点', () => {
    const onConfirm = vi.fn(), onCancel = vi.fn();
    const { rerender } = render(<><button>打开确认</button><ConfirmDialog {...base} open={false} danger onConfirm={onConfirm} onCancel={onCancel} /></>);
    const trigger = screen.getByRole('button', { name: '打开确认' });
    trigger.focus();
    rerender(<><button>打开确认</button><ConfirmDialog {...base} open danger onConfirm={onConfirm} onCancel={onCancel} /></>);
    const dialog = screen.getByRole('alertdialog', { name: '删除项目？' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription('所有记录都会删除。');
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '删除项目' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(dialog).toHaveAttribute('open');
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onCancel).toHaveBeenCalledOnce();
    rerender(<><button>打开确认</button><ConfirmDialog {...base} open={false} danger onConfirm={onConfirm} onCancel={onCancel} /></>);
    expect(trigger).toHaveFocus();
  });

  it('忙碌时禁用动作、Esc 和背景取消；失败保留弹窗并恢复可重试状态', () => {
    const onConfirm = vi.fn(), onCancel = vi.fn();
    const { rerender } = render(<ConfirmDialog {...base} open busy busyLabel="删除中" closeOnBackdrop onConfirm={onConfirm} onCancel={onCancel} />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '删除中' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '删除中' }));
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.pointerDown(dialog); fireEvent.click(dialog);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    rerender(<ConfirmDialog {...base} open error="删除失败，请重试。" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('alert')).toHaveTextContent('删除失败');
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '删除项目' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('背景取消默认关闭，显式开启后仅接受起止都在背景的点击', () => {
    const onCancel = vi.fn();
    const { rerender } = render(<ConfirmDialog {...base} open onConfirm={() => {}} onCancel={onCancel} />);
    const dialog = screen.getByRole('alertdialog');
    fireEvent.pointerDown(dialog); fireEvent.click(dialog);
    expect(onCancel).not.toHaveBeenCalled();
    rerender(<ConfirmDialog {...base} open closeOnBackdrop onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.pointerDown(screen.getByText('所有记录都会删除。')); fireEvent.click(dialog);
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.pointerDown(dialog); fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('确认单独禁用时仍可取消，按钮不会提交宿主表单', async () => {
    const onConfirm = vi.fn(), onCancel = vi.fn(), onSubmit = vi.fn((event) => event.preventDefault());
    render(<form onSubmit={onSubmit}><ConfirmDialog {...base} open confirmDisabled onConfirm={onConfirm} onCancel={onCancel} /></form>);
    expect(screen.getByRole('button', { name: '删除项目' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('PromptDialog', () => {
  const base = { open: true, title: '重命名', inputLabel: '名称', confirmLabel: '保存', cancelLabel: '取消', onCancel: () => {} };

  it('输入框显式命名并全选，受控草稿等待宿主，确认回调原文', () => {
    const onValueChange = vi.fn(), onConfirm = vi.fn();
    const { rerender } = render(<PromptDialog {...base} value="原名称" onValueChange={onValueChange} onConfirm={onConfirm} />);
    const input = screen.getByRole('textbox', { name: '名称' }) as HTMLInputElement;
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(3);
    fireEvent.change(input, { target: { value: '  新名称  ' } });
    expect(onValueChange).toHaveBeenCalledWith('  新名称  ');
    expect(input).toHaveValue('原名称');
    rerender(<PromptDialog {...base} value="  新名称  " onValueChange={onValueChange} onConfirm={onConfirm} />);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledWith('  新名称  ');
  });

  it('中文组合、229、长按与修饰键不确认，普通回车确认', () => {
    const onConfirm = vi.fn();
    render(<PromptDialog {...base} defaultValue="草稿" onConfirm={onConfirm} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input); fireEvent.keyDown(input, { key: 'Enter' }); fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    fireEvent.keyDown(input, { key: 'Enter', repeat: true });
    for (const modifier of ['altKey', 'metaKey', 'ctrlKey', 'shiftKey']) fireEvent.keyDown(input, { key: 'Enter', [modifier]: true });
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledWith('草稿');
  });

  it('非空和长度约束覆盖受控值及快捷确认，错误与忙碌保留草稿', () => {
    const onConfirm = vi.fn();
    const { rerender } = render(<PromptDialog {...base} required maxLength={4} value="  " onConfirm={onConfirm} />);
    let input = screen.getByRole('textbox');
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    fireEvent.keyDown(input, { key: 'Enter' });
    rerender(<PromptDialog {...base} required maxLength={4} value="12345" onConfirm={onConfirm} />);
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onConfirm).not.toHaveBeenCalled();
    rerender(<PromptDialog {...base} busy value="草稿" onConfirm={onConfirm} />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    fireEvent.change(input, { target: { value: '不应写入' } });
    expect(input).toHaveValue('草稿');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onConfirm).not.toHaveBeenCalled();
    rerender(<PromptDialog {...base} error="保存失败" value="草稿" onConfirm={onConfirm} />);
    expect(input).toHaveValue('草稿');
    expect(input).toHaveAccessibleDescription('保存失败');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: '保存' })).toBeEnabled();
  });

  it('非受控内容关闭后再打开保留，卸载时归还外部焦点', () => {
    const { rerender } = render(<><button>打开</button><PromptDialog {...base} open={false} defaultValue="初始" onConfirm={() => {}} /></>);
    const trigger = screen.getByRole('button', { name: '打开' });
    trigger.focus();
    rerender(<><button>打开</button><PromptDialog {...base} defaultValue="初始" onConfirm={() => {}} /></>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '新草稿' } });
    rerender(<><button>打开</button><PromptDialog {...base} open={false} defaultValue="初始" onConfirm={() => {}} /></>);
    expect(trigger).toHaveFocus();
    rerender(<><button>打开</button><PromptDialog {...base} defaultValue="初始" onConfirm={() => {}} /></>);
    expect(screen.getByRole('textbox')).toHaveValue('新草稿');
    rerender(<button>打开</button>);
    expect(trigger).toHaveFocus();
  });
});

describe('AlertDialog / SystemDialog', () => {
  it('提示按钮与 Esc 使用同一个知晓回调，背景不自动知晓', () => {
    const onConfirm = vi.fn();
    render(<AlertDialog open title="结果提示" message="导入失败" confirmLabel="知道了" onConfirm={onConfirm} />);
    const dialog = screen.getByRole('alertdialog', { name: '结果提示' });
    expect(screen.getByRole('button', { name: '知道了' })).toHaveFocus();
    fireEvent.pointerDown(dialog); fireEvent.click(dialog);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(screen.getByRole('button', { name: '知道了' }));
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('兼容旧输入和动作，StrictMode 清理后可重开，Esc 不传播给宿主', () => {
    const onChange = vi.fn(), onAction = vi.fn(), onCancel = vi.fn(), onKey = vi.fn();
    render(<StrictMode><div onKeyDown={onKey}><SystemDialog open title="旧接口" input={{ value: '旧输入', onChange }}
      onCancel={onCancel} actions={[{ label: '关闭', onClick: onAction }]} /></div></StrictMode>);
    const input = screen.getByRole('textbox', { name: '旧接口' });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: '新输入' } });
    expect(onChange).toHaveBeenCalledWith('新输入');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
