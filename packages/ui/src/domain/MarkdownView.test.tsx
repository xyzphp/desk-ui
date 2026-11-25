import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownView } from './MarkdownView';

describe('MarkdownView', () => {
  it('保留原生 div 根标签，不在 Markdown 内容外增加额外包装', () => {
    const { container } = render(<MarkdownView as="div" className="todo-project-detail-body" value="# 项目说明" />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('ds-markdown', 'todo-project-detail-body');
    expect(root?.firstElementChild?.tagName).toBe('H1');
    expect(root?.firstElementChild?.textContent).toBe('项目说明');
  });

  it('用 React 文本节点显示原始 HTML，不创建可执行元素', () => {
    const { container } = render(
      <MarkdownView value={'# 内容\n\n<script>run()</script>\n\n![远程](https://example.com/image.png)'} />,
    );
    expect(screen.getByRole('heading', { name: '内容' })).toBeTruthy();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a[href="https://example.com/image.png"]')).toBeTruthy();
    expect(container.querySelector('article')?.textContent).toContain('<script>run()</script>');
  });

  it('只渲染宿主显式提供的同源图片，并保留来源信息', () => {
    const { container } = render(
      <MarkdownView
        value={'![截图](project-file:12 =320 row=2)'}
        media={{ 'project-file:12': { url: '/projects/4/files/12', image: true } }}
        editable
      />,
    );
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/projects/4/files/12');
    expect(image?.getAttribute('width')).toBe('320');
    expect(image?.getAttribute('data-md-file')).toBe('project-file:12');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(container.querySelector('[data-md-start]')?.getAttribute('data-md-start')).toBe('0');
  });

  it('视觉编辑时保持图片框不可编辑并提供宽度滑块按钮', () => {
    const { container } = render(
      <MarkdownView
        as="div"
        contentEditable
        visualEditable
        value={'![截图](project-file:12 =320 row=2)'}
        media={{ 'project-file:12': { url: '/projects/4/files/12', image: true } }}
      />,
    );
    const frame = container.querySelector<HTMLElement>('[data-md-image="project-file:12"]');
    const handle = frame?.querySelector<HTMLButtonElement>('[data-md-image-resize]');
    expect(frame?.getAttribute('contenteditable')).toBe('false');
    expect(frame?.getAttribute('tabindex')).toBe('0');
    expect(handle).toHaveAttribute('role', 'slider');
    expect(handle).toHaveAttribute('aria-valuenow', '320');
  });

  it('把宿主追加内容放在同一根节点的 Markdown 区块之后', () => {
    const { container } = render(
      <MarkdownView as="div" value="# 项目说明" after={<div className="md-editor-attachments">附件</div>} />,
    );
    const root = container.firstElementChild;
    expect(root?.children).toHaveLength(2);
    expect(root?.children[0]?.tagName).toBe('H1');
    expect(root?.children[1]).toHaveClass('md-editor-attachments');
  });

  it('过滤映射返回的外部媒体地址', () => {
    const { container } = render(
      <MarkdownView
        value={'![截图](article-file:12)'}
        media={{ 'article-file:12': { url: 'https://outside.example/image.png', image: true } }}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });
});
