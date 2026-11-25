import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageThread } from './MessageThread';

describe('MessageThread', () => {
  it('正文按文本显示，只有附件时不创建空正文，并保留宿主操作', () => {
    const open = vi.fn();
    const row = createRef<HTMLElement>();
    const { container } = render(
      <MessageThread
        label="会话消息"
        items={[
          { id: 'text', text: '<script>run()</script>\n第二行', time: '10:30', dateTime: '2026-11-06T02:30:00Z' },
          { id: 'file', own: true, ref: row, attachments: <button onClick={open}>下载附件</button> },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: '会话消息' })).not.toHaveAttribute('aria-live');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('p')?.textContent).toBe('<script>run()</script>\n第二行');
    expect(row.current?.querySelector('p')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '下载附件' }));
    expect(open).toHaveBeenCalledOnce();
  });

  it('追加消息和切换展示模式保留已有消息节点，不擅自播报或触发业务操作', () => {
    const items = [{ id: 'first', author: '同事', text: '第一条', time: '10:30' }];
    const { container, rerender } = render(<MessageThread label="评论" items={items} variant="comment" />);
    const first = container.querySelector('article');
    expect(first?.querySelector('header time')?.textContent).toBe('10:30');
    rerender(<MessageThread label="评论" items={[...items, { id: 'second', text: '第二条' }]} variant="bubble" />);
    expect(container.querySelector('article')).toBe(first);
    expect(first?.firstElementChild?.tagName).toBe('TIME');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
