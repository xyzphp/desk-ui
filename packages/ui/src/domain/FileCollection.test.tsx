import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileCollection } from './FileCollection';

describe('FileCollection', () => {
  it('preserves original root and item classes while retaining selection behavior', async () => {
    const onSelectedIdsChange = vi.fn();
    const { container } = render(
      <FileCollection
        aria-label="文件"
        aria-multiselectable="true"
        role="listbox"
        className="fm-items fm-grid"
        nativeStructure
        items={[{ id: 'folder:1', name: '项目资料', icon: 'folder' }]}
        itemIdAttribute="data-fm-item"
        itemClassName={() => 'fm-item'}
        renderItemContent={(item) => (
          <span className="fm-file-name">
            <span>{item.name}</span>
          </span>
        )}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    );

    const root = container.querySelector('.fm-items');
    const item = screen.getByRole('option', { name: '项目资料' });
    expect(root).toHaveClass('fm-grid');
    expect(root).not.toHaveClass('ds-file-collection');
    expect(root).not.toHaveAttribute('style');
    expect(root).not.toHaveAttribute('aria-description');
    expect(item).toHaveAttribute('class', 'fm-item');
    expect(item).toHaveAttribute('data-fm-item', 'folder:1');
    expect(item.querySelector('.fm-file-name > span')).toHaveTextContent('项目资料');
    await userEvent.click(item);
    expect(onSelectedIdsChange).toHaveBeenCalledExactlyOnceWith(['folder:1']);
  });

  it('uses the provided native focus item for the single tab stop', () => {
    render(
      <FileCollection
        items={[
          { id: 'file:1', name: '一' },
          { id: 'file:2', name: '二' },
        ]}
        nativeStructure
        focusId="file:2"
        itemIdAttribute="data-fm-item"
      />,
    );
    expect(screen.getByRole('option', { name: '一' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('option', { name: '二' })).toHaveAttribute('tabindex', '0');
  });

  it('places the host empty state inside the collection root', () => {
    const { container } = render(
      <FileCollection aria-label="文件" items={[]} emptyState={<div className="fm-empty">没有文件</div>} />,
    );
    expect(container.querySelector('.ds-file-collection > .fm-empty')).toHaveTextContent('没有文件');
  });

  it('uses the host drag MIME type and selects an unselected item before dragging', () => {
    const onSelectedIdsChange = vi.fn();
    const setData = vi.fn();
    const dataTransfer = { setData, effectAllowed: '' } as unknown as DataTransfer;
    render(
      <FileCollection
        items={[{ id: 'file:1', name: '资料.txt' }]}
        dragType="application/x-app-files"
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    );
    fireEvent.dragStart(screen.getByRole('option', { name: '资料.txt' }), { dataTransfer });
    expect(setData).toHaveBeenCalledWith('application/x-app-files', '["file:1"]');
    expect(onSelectedIdsChange).toHaveBeenCalledExactlyOnceWith(['file:1']);
  });
});
