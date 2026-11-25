import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppIcon, appGradients } from './AppIcon';

describe('统一应用图标', () => {
  it('外框、内部图形、笔画与亮度分别生效，两种模式共用配置', () => {
    const { container, rerender } = render(<AppIcon icon="book-open" size={72} iconSize={24} strokeWidth={1.2} brightness={0.6} />);
    let graphic = container.firstElementChild as HTMLElement;
    expect(graphic).toHaveAttribute('aria-hidden', 'true');
    expect(graphic.style.width).toBe('72px');
    expect(graphic.style.getPropertyValue('--ds-app-icon-symbol-size')).toBe('24px');
    expect(graphic.style.getPropertyValue('--ds-app-icon-brightness')).toBe('0.6');
    expect(graphic.querySelector('svg')).toHaveAttribute('stroke-width', '1.2');
    rerender(<AppIcon variant="desktop" label="文档" icon="book-open" selected size={72} iconSize={24} strokeWidth={1.2} brightness={0.6} />);
    const entry = screen.getByRole('button', { name: '文档' });
    expect(entry).toHaveAttribute('aria-pressed', 'true');
    expect(entry.style.getPropertyValue('--desktop-icon-size')).toBe('72px');
    expect(entry.style.getPropertyValue('--ds-app-icon-symbol-size')).toBe('24px');
    expect(entry.style.getPropertyValue('--ds-app-icon-brightness')).toBe('0.6');
    graphic = entry.querySelector('.ds-app-icon')!;
    expect(graphic).not.toHaveClass('ds-app-icon--graphic');
    expect(graphic.querySelector('svg')).toHaveAttribute('stroke-width', '1.2');
  });

  it('图形优先级为自定义、图片、图标、字符，图片保持装饰语义', () => {
    const { container, rerender } = render(<AppIcon image="/example.png" icon="bell" glyph="文"><span>自定义图形</span></AppIcon>);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('自定义图形')).toBeInTheDocument();
    rerender(<AppIcon image="/example.png" icon="bell" glyph="文" transparent iconSize={30} />);
    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute('src', '/example.png');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('draggable', 'false');
    expect(image.parentElement).toHaveClass('ds-app-icon--transparent');
    expect(container.querySelector('svg')).toBeNull();
    rerender(<AppIcon icon="bell" glyph="文" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.queryByText('文')).not.toBeInTheDocument();
    rerender(<AppIcon glyph="文" />);
    expect(screen.getByText('文')).toBeInTheDocument();
  });

  it('零值可隐藏矢量内容，负值夹紧；无效数值清除旧配置而非遗留', () => {
    const { container, rerender } = render(<AppIcon icon="folder" size={1} iconSize={0} strokeWidth={0} brightness={0} />);
    const graphic = container.firstElementChild as HTMLElement;
    expect(graphic.style.width).toBe('24px');
    expect(graphic.style.getPropertyValue('--ds-app-icon-symbol-size')).toBe('0px');
    expect(graphic.style.getPropertyValue('--ds-app-icon-brightness')).toBe('0');
    expect(graphic.querySelector('svg')).toHaveAttribute('stroke-width', '0');
    rerender(<AppIcon icon="folder" iconSize={-1} strokeWidth={-1} brightness={-1} />);
    expect(graphic.style.getPropertyValue('--ds-app-icon-symbol-size')).toBe('0px');
    expect(graphic.style.getPropertyValue('--ds-app-icon-brightness')).toBe('0');
    expect(graphic.querySelector('svg')).toHaveAttribute('stroke-width', '0');
    for (const invalid of [NaN, Infinity, -Infinity]) {
      rerender(<AppIcon icon="folder" size={invalid} iconSize={invalid} strokeWidth={invalid} brightness={invalid} />);
      expect(graphic.style.width).toBe('');
      expect(graphic.style.getPropertyValue('--ds-app-icon-symbol-size')).toBe('');
      expect(graphic.style.getPropertyValue('--ds-app-icon-brightness')).toBe('');
      expect(graphic.querySelector('svg')).toHaveAttribute('stroke-width', '1.8');
    }
    rerender(<AppIcon icon="folder" brightness={1.4} />);
    expect(graphic.style.getPropertyValue('--ds-app-icon-brightness')).toBe('1.4');
  });

  it('切换为纯图形后移除桌面操作与名称，实例配置不串联', () => {
    const onOpen = vi.fn(), onSelect = vi.fn();
    const { container, rerender } = render(<AppIcon variant="desktop" label="入口" icon="folder" selected onOpen={onOpen} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: '入口' })).toBeInTheDocument();
    rerender(<><AppIcon icon="folder" brightness={0.5} size={72} /><AppIcon icon="bell" /></>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const custom = container.children.item(0) as HTMLElement;
    const standard = container.children.item(1) as HTMLElement;
    expect(custom.style.getPropertyValue('--ds-app-icon-brightness')).toBe('0.5');
    expect(standard.style.getPropertyValue('--ds-app-icon-brightness')).toBe('');
    expect(standard.style.getPropertyValue('--ds-app-icon-size')).toBe('');
    fireEvent.click(custom);
    fireEvent.doubleClick(custom);
    expect(onOpen).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('桌面模式支持 ref 和原生动作拦截，键盘与双击语义保留', async () => {
    const user = userEvent.setup(), ref = createRef<HTMLDivElement>(), onOpen = vi.fn(), onSelect = vi.fn();
    const { rerender } = render(<AppIcon variant="desktop" label="入口" icon="folder" ref={ref} onOpen={onOpen} onSelect={onSelect}
      onClick={(event) => event.preventDefault()} onKeyDown={(event) => event.preventDefault()} />);
    const entry = screen.getByRole('button');
    expect(ref.current).toBe(entry);
    await user.click(entry);
    await user.keyboard('{Enter}');
    expect(onOpen).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    rerender(<AppIcon variant="desktop" label="入口" icon="folder" ref={ref} onOpen={onOpen} onSelect={onSelect} />);
    fireEvent.click(entry);
    expect(onSelect).toHaveBeenCalledOnce();
    fireEvent.keyDown(entry, { key: 'Enter', repeat: true });
    fireEvent.keyDown(entry, { key: 'Enter', isComposing: true });
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.keyDown(entry, { key: 'Enter' });
    fireEvent.keyDown(entry, { key: ' ' });
    fireEvent.doubleClick(entry);
    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it('tinted 阴影取渐变末端色，图片与无色值背景保持默认阴影', () => {
    const { container, rerender } = render(<AppIcon icon="folder" color={appGradients.cyan} shadow="tinted" />);
    const art = () => container.querySelector<HTMLElement>('.ds-app-icon')!;
    expect(art()).toHaveClass('ds-app-icon--tinted');
    expect(art().style.getPropertyValue('--ds-app-icon-shadow-color')).toBe('#0ea5e9');
    rerender(<AppIcon icon="folder" color={appGradients.cyan} />);
    expect(art()).not.toHaveClass('ds-app-icon--tinted');
    rerender(<AppIcon icon="folder" color="var(--accent)" shadow="tinted" />);
    expect(art()).not.toHaveClass('ds-app-icon--tinted');
    rerender(<AppIcon image="/demo.png" color={appGradients.cyan} shadow="tinted" />);
    expect(art()).not.toHaveClass('ds-app-icon--tinted');
  });

  it('图片图标提供 shadowColor 后带同色阴影', () => {
    const { container } = render(<AppIcon image="/demo.png" shadow="tinted" shadowColor="#336699" />);
    const art = container.querySelector<HTMLElement>('.ds-app-icon')!;
    expect(art).toHaveClass('ds-app-icon--image', 'ds-app-icon--tinted');
    expect(art.style.getPropertyValue('--ds-app-icon-shadow-color')).toBe('#336699');
  });
});
