import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Desktop, isDynamicWallpaper, isSceneWallpaper, Wallpaper, wallpapers } from './Desktop';
import { onWallpaperBlank } from './wallpapers/pointerScope';

const wallpaperOf = (container: HTMLElement) => container.querySelector('.ds-wallpaper')!;

describe('Desktop 动态壁纸', () => {
  it('渐变预设只在开启动态时渲染流动层（三团光斑与两条色带）', () => {
    const { container, rerender } = render(<Desktop wallpaper="aurora" />);
    expect(wallpaperOf(container)).not.toHaveClass('is-animated');
    expect(container.querySelector('.ds-wallpaper-flow')).toBeNull();
    rerender(<Desktop wallpaper="aurora" wallpaperMotion />);
    expect(wallpaperOf(container)).toHaveClass('ds-wp-aurora', 'is-animated');
    const flow = container.querySelector('.ds-wallpaper-flow')!;
    expect(flow).toHaveAttribute('aria-hidden', 'true');
    expect(flow.querySelectorAll('.ds-wf-blob')).toHaveLength(3);
    expect(flow.querySelectorAll('.ds-wf-ribbon')).toHaveLength(2);
  });

  it('水族馆是画作场景：白天 / 深夜两张底图、光柱与一张 Canvas 鱼群层，关闭动态时静止', async () => {
    const { container, rerender } = render(<Desktop wallpaper="aquarium" wallpaperMotion />);
    const scene = await waitFor(() => {
      const element = container.querySelector('.ds-aquarium');
      expect(element).not.toBeNull();
      return element!;
    });
    expect(scene).toHaveAttribute('aria-hidden', 'true');
    expect(scene).toHaveAttribute('data-play');
    expect(scene.querySelectorAll('.ds-aq-backdrop')).toHaveLength(2);
    expect(scene.querySelectorAll('.ds-aq-rays path')).toHaveLength(3);
    expect(scene.querySelectorAll('canvas.ds-aq-canvas')).toHaveLength(1);
    expect(container.querySelector('.ds-wallpaper-flow')).toBeNull();
    rerender(<Desktop wallpaper="aquarium" />);
    expect(wallpaperOf(container)).not.toHaveClass('is-animated');
    expect(container.querySelector('.ds-aquarium')).not.toHaveAttribute('data-play');
  });

  it('壁纸指针交互只认壁纸范围内的空白处：按钮、窗口与范围外的元素不算', () => {
    const { container } = render(
      <>
        <Desktop wallpaper="aquarium">
          <main className="ds-desktop-area">
            <button type="button">图标</button>
          </main>
        </Desktop>
        <p>外部</p>
      </>,
    );
    const layer = wallpaperOf(container);
    expect(onWallpaperBlank(layer, container.querySelector('main'))).toBe(true);
    expect(onWallpaperBlank(layer, screen.getByRole('button', { name: '图标' }))).toBe(false);
    expect(onWallpaperBlank(layer, screen.getByText('外部'))).toBe(false);
    expect(onWallpaperBlank(layer, null)).toBe(false);
  });

  it('自定义图片优先：不渲染水族馆或流动层，开启动态时图片缓慢推移', () => {
    const { container } = render(
      <Desktop wallpaper="aquarium" wallpaperUrl="/api/wallpaper/1?v=2" wallpaperMotion />,
    );
    expect(wallpaperOf(container)).toHaveClass('has-image', 'is-animated');
    expect(container.querySelector('.ds-aquarium')).toBeNull();
    expect(container.querySelector('.ds-wallpaper-flow')).toBeNull();
  });

  it('水族馆、森林、草原、星空是画作场景壁纸：按需加载场景层，不叠加渐变流动层；关闭动态时静止', async () => {
    expect(wallpapers).toEqual(['sequoia', 'sonoma', 'aurora', 'dusk', 'aquarium', 'forest', 'grassland', 'galaxy']);
    expect(wallpapers.filter(isSceneWallpaper)).toEqual(['aquarium', 'forest', 'grassland', 'galaxy']);
    expect(wallpapers.filter(isDynamicWallpaper)).toEqual(['aquarium', 'forest', 'grassland', 'galaxy']);
    for (const name of ['aquarium', 'forest', 'grassland', 'galaxy'] as const) {
      const { container, rerender, unmount } = render(<Desktop wallpaper={name} wallpaperMotion />);
      expect(wallpaperOf(container)).toHaveClass(`ds-wp-${name}`, 'is-animated');
      const scene = await waitFor(() => {
        const element = container.querySelector(`.ds-${name}`);
        expect(element).not.toBeNull();
        return element!;
      });
      expect(scene).toHaveAttribute('aria-hidden', 'true');
      expect(scene).toHaveAttribute('data-play');
      expect(scene).not.toHaveAttribute('data-night');
      expect(container.querySelector('.ds-wallpaper-flow')).toBeNull();
      rerender(<Desktop wallpaper={name} />);
      expect(container.querySelector(`.ds-${name}`)).not.toHaveAttribute('data-play');
      unmount();
    }
  });

  it('深色主题切到夜景；同一页面上的两份壁纸使用各自的 SVG 定义 id', async () => {
    document.documentElement.dataset.theme = 'dark';
    try {
      const { container } = render(
        <>
          <Wallpaper name="forest" motion />
          <Wallpaper name="forest" />
        </>,
      );
      const scenes = await waitFor(() => {
        const found = container.querySelectorAll('.ds-forest');
        expect(found).toHaveLength(2);
        return found;
      });
      for (const scene of scenes) expect(scene).toHaveAttribute('data-night');
      const ids = Array.from(container.querySelectorAll('clipPath')).map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(scenes[0]!.querySelectorAll('.ds-fs-star').length).toBeGreaterThan(50);
    } finally {
      delete document.documentElement.dataset.theme;
    }
  });

  it('有自定义图片时不挂载场景；Wallpaper 也可单独使用', async () => {
    const { container } = render(<Desktop wallpaper="galaxy" wallpaperUrl="/wallpaper.jpg" wallpaperMotion />);
    expect(container.querySelector('.ds-galaxy')).toBeNull();
    const standalone = render(<Wallpaper className="login-bg" name="grassland" />);
    const layer = standalone.container.querySelector('.ds-wallpaper')!;
    expect(layer).toHaveClass('login-bg', 'ds-wp-grassland');
    expect(layer).not.toHaveClass('is-animated');
    await waitFor(() => expect(layer.querySelector('.ds-grassland')).not.toHaveAttribute('data-play'));
  });
});
