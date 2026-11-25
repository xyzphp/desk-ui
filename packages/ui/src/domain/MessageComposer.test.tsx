import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageComposer, type MessageComposerLabels } from './MessageComposer';

const labels: MessageComposerLabels = { send: '发送', sending: '正在发送', stop: '停止' };

describe('MessageComposer', () => {
  it('暂停发送时仍可编辑草稿，按钮与 Enter 不触发发送', () => {
    const send = vi.fn();
    render(<MessageComposer label="离线草稿" defaultValue="原文" sendDisabled onSend={send} labels={labels} />);
    const input = screen.getByRole('textbox', { name: '离线草稿' });
    fireEvent.change(input, { target: { value: '继续编辑' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('继续编辑');
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
    expect(send).not.toHaveBeenCalled();
  });
  it('受控草稿等待宿主更新，发送保留原始文本且不自动清空', () => {
    const onValueChange = vi.fn(),
      onSend = vi.fn(),
      ref = createRef<HTMLTextAreaElement>();
    const props = { label: '消息', labels, onSend, onValueChange, inputProps: { ref, maxLength: 200 } };
    const { rerender } = render(<MessageComposer {...props} value="原文" />);
    const input = screen.getByRole('textbox', { name: '消息' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('maxlength', '200');
    fireEvent.change(input, { target: { value: '  新消息\n' } });
    expect(onValueChange).toHaveBeenCalledWith('  新消息\n');
    expect(input).toHaveValue('原文');
    rerender(<MessageComposer {...props} value={'  新消息\n'} />);
    fireEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledWith('  新消息\n');
    expect(input).toHaveValue('  新消息\n');
  });

  it('中文输入法、229 键码、换行及修饰键不误发送，普通回车发送', () => {
    const onSend = vi.fn();
    render(<MessageComposer label="消息" defaultValue="你好" onSend={onSend} labels={labels} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    for (const modifier of ['shiftKey', 'altKey', 'ctrlKey', 'metaKey'])
      fireEvent.keyDown(input, { key: 'Enter', [modifier]: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('你好');
  });

  it('空白默认不可发送；宿主显式确认附件可发送时允许空文本', () => {
    const onSend = vi.fn();
    const { rerender } = render(<MessageComposer label="消息" value="  " onSend={onSend} labels={labels} />);
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    rerender(
      <MessageComposer
        label="消息"
        value=""
        attachments={<span>image.png</span>}
        allowEmpty
        onSend={onSend}
        labels={labels}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledWith('');
  });

  it('忙碌冻结草稿与插槽按钮，停止动作仍可调用，并关联状态和错误', () => {
    const onSend = vi.fn(),
      onStop = vi.fn();
    render(
      <MessageComposer
        label="消息"
        defaultValue="保留草稿"
        busy
        onSend={onSend}
        onStop={onStop}
        tools={<button>添加附件</button>}
        attachments={<button>移除图片</button>}
        status="上传中"
        error="连接断开"
        labels={labels}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAccessibleDescription('连接断开 上传中');
    expect(screen.getByRole('button', { name: '添加附件' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '移除图片' })).toBeDisabled();
    fireEvent.change(input, { target: { value: '不可写入' } });
    expect(input).toHaveValue('保留草稿');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it.each(['disabled', 'readOnly'] as const)('%s 阻止发送，保留内容', (state) => {
    const onSend = vi.fn();
    render(<MessageComposer label="消息" defaultValue="草稿" {...{ [state]: true }} onSend={onSend} labels={labels} />);
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('支持宿主拦截快捷键，关闭快捷发送后保留 Enter 换行，不提交外层表单', () => {
    const onSend = vi.fn(),
      onSubmit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <MessageComposer
          label="消息"
          defaultValue="草稿"
          onSend={onSend}
          inputProps={{ onKeyDown: (event) => event.preventDefault() }}
          labels={labels}
        />
      </form>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    rerender(
      <form onSubmit={onSubmit}>
        <MessageComposer label="消息" defaultValue="草稿" sendOnEnter={false} onSend={onSend} labels={labels} />
      </form>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSend).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('非受控草稿遵循表单重置及取消重置', async () => {
    const onReset = vi.fn();
    const { container } = render(
      <form onReset={onReset}>
        <MessageComposer label="消息" defaultValue="初始草稿" onSend={() => {}} labels={labels} />
      </form>,
    );
    const input = screen.getByRole('textbox'),
      form = container.querySelector('form')!;
    fireEvent.change(input, { target: { value: '未提交' } });
    onReset.mockImplementationOnce((event) => event.preventDefault());
    fireEvent.reset(form);
    await waitFor(() => expect(input).toHaveValue('未提交'));
    fireEvent.reset(form);
    await waitFor(() => expect(input).toHaveValue('初始草稿'));
  });
});
