import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from './MarkdownEditor';
import { Field } from '../primitives/Field';
import type { MarkdownEditorHandle } from './markdownTypes';
import { createMarkdownHistory } from './markdownEditing';

describe('MarkdownEditor', () => {
  it('选区格式化、原生 change / FormData、撤销重做与重置保持一致', async () => {
    const ref = createRef<MarkdownEditorHandle>();
    const changed = vi.fn();
    const { container } = render(<form><Field label="正文"><MarkdownEditor ref={ref} name="body" defaultValue="abcd"
      onChange={(event) => changed(event.currentTarget)} /></Field></form>);
    const input = screen.getByRole('textbox', { name: '正文' }) as HTMLTextAreaElement;
    input.focus(); input.setSelectionRange(1, 3);
    await userEvent.click(screen.getByRole('button', { name: '加粗' }));
    expect(input).toHaveValue('a**bc**d');
    expect(changed).toHaveBeenCalledWith(input);
    expect(new FormData(container.querySelector('form')!).get('body')).toBe('a**bc**d');
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(input).toHaveValue('abcd');
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(input).toHaveValue('a**bc**d');
    await act(async () => container.querySelector('form')!.reset());
    expect(input).toHaveValue('abcd');
    expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  });
  it('受控拒绝还原值；旧选区与跨文档快照不能插入，外部替换清空历史', async () => {
    const ref = createRef<MarkdownEditorHandle>();
    const changed = vi.fn();
    const { rerender } = render(<MarkdownEditor aria-label="正文" ref={ref} value="source" onValueChange={changed} historyKey="a" />);
    const input = screen.getByRole('textbox');
    await userEvent.click(screen.getByRole('button', { name: '加粗' }));
    expect(changed).toHaveBeenCalled(); expect(input).toHaveValue('source');
    const old = ref.current!.selection()!;
    rerender(<MarkdownEditor aria-label="正文" ref={ref} value="source" onValueChange={changed} historyKey="b" />);
    act(() => { expect(ref.current!.insert('attachment', old)).toBe(false); });
    rerender(<MarkdownEditor aria-label="正文" ref={ref} value="replacement" onValueChange={changed} historyKey="b" />);
    expect(screen.getByRole('button', { name: '撤销' })).toBeDisabled();
  });
  it('输入法组合期间不执行格式或历史，文件粘贴只回调宿主，预览字符串按文本渲染', async () => {
    const files = vi.fn();
    render(<MarkdownEditor aria-label="正文" defaultValue="<img src=x onerror=alert(1)>" onFiles={files}
      renderPreview={(source) => source} defaultMode="split" />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'b', ctrlKey: true, isComposing: true });
    expect(input).toHaveValue('<img src=x onerror=alert(1)>');
    expect(screen.getByRole('button', { name: '加粗' })).toBeDisabled();
    fireEvent.compositionEnd(input);
    const file = new File(['file'], 'sample.png', { type: 'image/png' });
    fireEvent.paste(input, { clipboardData: { files: [file] } });
    expect(files).toHaveBeenCalledWith([file], expect.objectContaining({ source: '<img src=x onerror=alert(1)>' }));
    expect(screen.getByRole('region', { name: '预览' }).querySelector('img')).toBeNull();
  });
  it('预览中的必填错误回到可见源码，只读仍提交值且不能通过 API 修改', async () => {
    const ref = createRef<MarkdownEditorHandle>();
    const { rerender } = render(<MarkdownEditor ref={ref} aria-label="正文" required defaultMode="preview" renderPreview={(source) => source} />);
    act(() => { expect(ref.current!.input!.checkValidity()).toBe(false); });
    expect(screen.getByRole('textbox', { name: '正文' })).not.toHaveAttribute('hidden');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(<form aria-label="表单"><MarkdownEditor ref={ref} aria-label="正文" name="body" value="readonly" readOnly /></form>);
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('body')).toBe('readonly');
    act(() => { expect(ref.current!.insert('change')).toBe(false); });
  });
});

describe('Markdown 历史', () => {
  it('最多保存 60 步，新编辑截断 redo 分支', () => {
    const history = createMarkdownHistory('');
    for (let i = 0; i < 65; i++) history.record({ source: String(i), start: 0, end: 0 });
    expect(history.stack).toHaveLength(60);
    history.index -= 2; history.record({ source: 'new', start: 3, end: 3 });
    expect(history.canRedo('new')).toBe(false);
    expect(history.stack.at(-1)?.source).toBe('new');
  });
});
