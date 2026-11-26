import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppCard, AppCardGrid } from './AppCard';

describe('AppCard / AppCardGrid', () => {
  it('网格保留列表语义，每张卡片是以名称命名的 article', () => {
    render(
      <AppCardGrid aria-label="应用">
        <AppCard name="世界时钟" summary="多个时区并排显示" href="#/apps/clock" />
        {false}
        <AppCard name="服务状态" summary="检查服务是否在线" />
      </AppCardGrid>,
    );
    const list = screen.getByRole('list', { name: '应用' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('article', { name: '世界时钟' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '世界时钟' })).toBeInTheDocument();
  });

  it('href 渲染为链接，onOpen 渲染为按钮；底栏操作独立触发', () => {
    const onOpen = vi.fn();
    const onInstall = vi.fn();
    render(
      <>
        <AppCard name="世界时钟" href="#/apps/clock" />
        <AppCard
          name="服务状态"
          onOpen={onOpen}
          meta="版本 1.0.0"
          actions={<button type="button" onClick={onInstall}>安装</button>}
        />
      </>,
    );
    expect(screen.getByRole('link', { name: '世界时钟' })).toHaveAttribute('href', '#/apps/clock');
    fireEvent.click(screen.getByRole('button', { name: '安装' }));
    expect(onInstall).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '服务状态' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByText('版本 1.0.0')).toBeInTheDocument();
  });

  it('没有打开动作时只展示名称；不可显示的图标地址回退为名称首字', () => {
    const { container } = render(<AppCard name="示例应用" icon={{ image: 'javascript:alert(1)' }} headingLevel={2} actions={false} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '示例应用' })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('示');
  });
});
