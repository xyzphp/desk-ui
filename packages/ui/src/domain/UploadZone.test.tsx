import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UploadZone, type UploadZoneLabels } from './UploadZone';

const labels: UploadZoneLabels = {
  fileList: '已选文件', remove: (file) => '移除' + file.name, clear: '清空', busy: '上传中',
  rejected: ({ file, reason }) => reason + ':' + file.name,
};
const makeFile = (name: string, type = 'image/png', body = '123') => new File([body], name, { type, lastModified: 1 });

describe('UploadZone', () => {
  it('复用原生选择器，接受有效文件，分别报告类型、大小、重复和数量拒绝', () => {
    const onFilesChange = vi.fn(), onReject = vi.fn();
    const { container } = render(<UploadZone label="上传图片" description="最多两张" multiple accept="image/*,.webp" maxFiles={2} maxFileSize={4} labels={labels} onFilesChange={onFilesChange} onReject={onReject} />);
    const input = container.querySelector('input')!;
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: '上传图片' }));
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '上传图片' })).toHaveAccessibleDescription('最多两张');
    const a = makeFile('a.png'), b = makeFile('b.webp', ''), wrong = makeFile('c.txt', 'text/plain');
    const large = makeFile('large.png', 'image/png', '12345'), extra = makeFile('d.png');
    fireEvent.change(input, { target: { files: [a, wrong, large, a, b, extra] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([a, b]);
    expect(onReject).toHaveBeenCalledWith([
      { file: wrong, reason: 'type' }, { file: large, reason: 'size' }, { file: a, reason: 'duplicate' }, { file: extra, reason: 'count' },
    ]);
    expect(screen.getByRole('alert')).toHaveTextContent('type:c.txt');
    expect(input.value).toBe('');
  });

  it('单选拒绝新文件时保留原文件，移除与清空后可以再次选择同一文件', async () => {
    const user = userEvent.setup(), onFilesChange = vi.fn();
    const a = makeFile('a.png'), b = makeFile('b.png');
    const { container } = render(<UploadZone label="封面" accept=".png" defaultFiles={[a]} onFilesChange={onFilesChange} labels={labels} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { files: [makeFile('bad.txt', 'text/plain')] } });
    expect(screen.getByText('a.png')).toBeInTheDocument();
    expect(onFilesChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { files: [b] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([b]);
    const remove = screen.getByRole('button', { name: '移除b.png' });
    remove.focus();
    await user.click(remove);
    expect(screen.getByRole('button', { name: '封面' })).toHaveFocus();
    fireEvent.change(input, { target: { files: [b] } });
    expect(screen.getByText('b.png')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '清空' }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
  });

  it('受控文件等待宿主更新，失败批次不抹掉已有选择', () => {
    const a = makeFile('a.png'), b = makeFile('b.png'), onFilesChange = vi.fn();
    const { container, rerender } = render(<UploadZone label="上传" files={[a]} multiple onFilesChange={onFilesChange} labels={labels} />);
    fireEvent.change(container.querySelector('input')!, { target: { files: [b] } });
    expect(onFilesChange).toHaveBeenCalledWith([a, b]);
    expect(screen.queryByText('b.png')).not.toBeInTheDocument();
    rerender(<UploadZone label="上传" files={[a, b]} multiple onFilesChange={onFilesChange} labels={labels} />);
    expect(screen.getByText('b.png')).toBeInTheDocument();
  });

  it('移除列表前项后归还焦点，保留其余文件', async () => {
    const user = userEvent.setup();
    render(<UploadZone label="上传" multiple defaultFiles={[makeFile('a.png'), makeFile('b.png')]} labels={labels} />);
    const remove = screen.getByRole('button', { name: '移除a.png' });
    remove.focus();
    await user.click(remove);
    expect(screen.getByRole('button', { name: '上传' })).toHaveFocus();
    expect(screen.queryByText('a.png')).not.toBeInTheDocument();
    expect(screen.getByText('b.png')).toBeInTheDocument();
  });

  it('文件拖拽穿过内部元素不闪退，支持投放并拒绝可识别的文件夹', () => {
    const onFilesChange = vi.fn(), onReject = vi.fn();
    render(<UploadZone label="上传" multiple labels={labels} onFilesChange={onFilesChange} onReject={onReject} />);
    const target = screen.getByRole('button', { name: '上传' }), zone = target.parentElement!;
    const image = makeFile('a.png'), directory = makeFile('folder', '');
    const dataTransfer = { types: ['Files'], files: [image, directory], items: [{ webkitGetAsEntry: () => ({ name: 'folder', isDirectory: true }) }] };
    fireEvent.dragEnter(zone, { dataTransfer });
    fireEvent.dragEnter(target, { dataTransfer });
    fireEvent.dragLeave(target, { dataTransfer });
    expect(zone).toHaveClass('is-dragging');
    fireEvent.drop(target, { dataTransfer });
    expect(zone).not.toHaveClass('is-dragging');
    expect(onFilesChange).toHaveBeenCalledWith([image]);
    expect(onReject).toHaveBeenCalledWith([{ file: directory, reason: 'directory' }]);
  });

  it.each(['disabled', 'busy'] as const)('%s 时阻止选择、移除与投放，仍拦截文件默认导航', (state) => {
    const onFilesChange = vi.fn(), file = makeFile('a.png');
    render(<UploadZone label="上传" defaultFiles={[file]} {...{ [state]: true }} labels={labels} onFilesChange={onFilesChange} />);
    const target = screen.getByRole('button', { name: '上传' });
    expect(target).toBeDisabled();
    expect(screen.getByRole('button', { name: '移除a.png' })).toBeDisabled();
    expect(fireEvent.drop(target, { dataTransfer: { files: [makeFile('b.png')], items: [], types: ['Files'] } })).toBe(false);
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('原生表单重置清理临时选择，取消重置则保留文件', async () => {
    const onReset = vi.fn();
    const { container } = render(<form onReset={onReset}><UploadZone label="上传" labels={labels} /></form>);
    const input = container.querySelector('input')!, form = container.querySelector('form')!;
    fireEvent.change(input, { target: { files: [makeFile('a.png')] } });
    onReset.mockImplementationOnce((event) => event.preventDefault());
    fireEvent.reset(form);
    await waitFor(() => expect(screen.getByText('a.png')).toBeInTheDocument());
    fireEvent.reset(form);
    await waitFor(() => expect(screen.queryByText('a.png')).not.toBeInTheDocument());
  });
});
