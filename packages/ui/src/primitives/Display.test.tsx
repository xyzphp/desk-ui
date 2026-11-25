import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, Badge, Divider, Link, Progress, Skeleton, Text } from './Display';

describe('基础展示组件', () => {
  it('文字按纯文本呈现并透传正确的段落元素引用', () => {
    const ref = createRef<HTMLParagraphElement>();
    const { container } = render(<Text as="p" ref={ref} code strong>{'<script>example</script>'}</Text>);
    expect(ref.current?.tagName).toBe('P');
    expect(screen.getByText('<script>example</script>')).toBe(ref.current);
    expect(container.querySelector('script')).toBeNull();
  });

  it('链接补新窗口隔离，保留原 rel；拒绝脚本、凭据和显式禁用', () => {
    const click = vi.fn();
    const { rerender } = render(<Link href="https://example.com/help" target="_blank" rel="help">帮助</Link>);
    const link = screen.getByRole('link', { name: '帮助' });
    expect(link).toHaveAttribute('rel', 'help noopener noreferrer');
    for (const href of ['javascript:alert(1)', 'data:text/html,example', 'https://user:secret@example.com/']) {
      rerender(<Link href={href} onClick={click}>帮助</Link>);
      expect(link).not.toHaveAttribute('href');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(link);
    }
    rerender(<Link href="#/overview" disabled onClick={click}>帮助</Link>);
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('分隔线有明确方向，标题为可访问名称，垂直模式不渲染标题', () => {
    const { rerender } = render(<Divider>更多选项</Divider>);
    expect(screen.getByRole('separator', { name: '更多选项' })).toHaveAttribute('aria-orientation', 'horizontal');
    rerender(<Divider vertical aria-label="操作分隔">不展示</Divider>);
    expect(screen.getByRole('separator', { name: '操作分隔' })).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.queryByText('不展示')).not.toBeInTheDocument();
  });

  it('头像图片失败回退姓名首字，改变来源后可重新加载；危险来源不创建图片', () => {
    const failed = vi.fn();
    const { container, rerender } = render(<Avatar name="林青" src="/avatar-a.png" onImageError={failed} />);
    expect(screen.getByRole('img', { name: '林青' })).toBeInTheDocument();
    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
    fireEvent.error(image);
    expect(failed).toHaveBeenCalledTimes(1);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('林')).toBeInTheDocument();
    rerender(<Avatar name="林青" src="/avatar-b.png" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/avatar-b.png');
    rerender(<Avatar name="林青" src="javascript:example" />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('装饰头像不重复命名，数字尺寸归一后仍保留最小文字尺寸', () => {
    const { container } = render(<Avatar name="联系人" decorative size={8} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ '--ds-avatar-size': '24px', '--ds-avatar-font-size': '12px' });
  });

  it('徽标隐藏零，完整数量可读，缩略为 99+ 且不拦截子按钮', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const { rerender } = render(<Badge value={0} label="0 条消息"><button onClick={click}>收件箱</button></Badge>);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<Badge value={128} label="128 条未读消息"><button onClick={click}>收件箱</button></Badge>);
    expect(screen.getByRole('img', { name: '128 条未读消息' })).toHaveTextContent('99+');
    await user.click(screen.getByRole('button', { name: '收件箱' }));
    expect(click).toHaveBeenCalledTimes(1);
    rerender(<Badge value={0} showZero label="0 条消息" />);
    expect(screen.getByRole('img', { name: '0 条消息' })).toHaveTextContent('0');
    rerender(<Badge value={NaN} label="无效数量" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('确定进度限制在范围内，保留业务原始单位，未知进度没有伪造当前值', () => {
    const { rerender } = render(<Progress label="文件用量" value={2048} max={1024} format={(value, max) => `${value}/${max} MB`} />);
    expect(screen.getByRole('progressbar', { name: '文件用量' })).toHaveAttribute('aria-valuenow', '1024');
    expect(screen.getByText('1024/1024 MB')).toBeInTheDocument();
    rerender(<Progress label="上传" value={-3} max={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    rerender(<Progress label="上传" value={NaN} />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('骨架切换只隐藏内容，保留同一输入节点和草稿，不永久公告加载', () => {
    const { rerender } = render(<Skeleton loading={false}><input aria-label="草稿" defaultValue="初始" /></Skeleton>);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '未保存草稿' } });
    rerender(<Skeleton loading label="加载资料"><input aria-label="草稿" defaultValue="初始" /></Skeleton>);
    expect(screen.getByRole('status')).toHaveTextContent('加载资料');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    rerender(<Skeleton loading={false}><input aria-label="草稿" defaultValue="初始" /></Skeleton>);
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('未保存草稿');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
