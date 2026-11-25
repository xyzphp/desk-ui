import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AvatarGroup } from './AvatarGroup';
import { Result } from './Result';
import { LoadingOverlay } from './LoadingOverlay';
import { Input, Field } from './Field';
import { Button } from './Button';
import { Link } from './Display';
import { Timeline } from '../layout/Timeline';

describe('AvatarGroup', () => {
  it('溢出人数可展开查阅所有名称，max=0 保留完整入口', async () => {
    const items = ['甲成员', '乙成员', '丙成员'].map((name) => ({ id: name, name }));
    const { rerender } = render(<AvatarGroup label="成员" items={items} max={1} />);
    expect(screen.getByRole('img', { name: '甲成员' })).toBeInTheDocument();
    expect(screen.getByText('乙成员')).not.toBeVisible();
    const more = screen.getByText('+2');
    expect(more).toHaveAccessibleName('查看其余 2 位成员');
    await userEvent.click(more);
    expect(screen.getByText('乙成员')).toBeVisible();
    expect(screen.getByText('丙成员')).toBeVisible();
    rerender(<AvatarGroup label="成员" items={items} max={0} />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});
describe('Result / Timeline', () => {
  it('静态结果动作由宿主处理，时间线保留顺序和机器可读时间，内容按文本转义', async () => {
    const retry = vi.fn();
    const { rerender } = render(<Result status="forbidden" actions={<Button onClick={retry}>申请访问</Button>} />);
    expect(screen.getByRole('region', { name: '暂无访问权限' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '申请访问' }));
    expect(retry).toHaveBeenCalledTimes(1);
    rerender(<Timeline label="记录" items={[{ id: 'one', title: '<script>example()</script>',
      time: '09:00', dateTime: '2026-11-05T09:00:00+08:00', content: '内容' }]} />);
    expect(screen.getByRole('list', { name: '记录' })).toBeInTheDocument();
    expect(screen.getByText('09:00')).toHaveAttribute('datetime', '2026-11-05T09:00:00+08:00');
    expect(screen.getByText('<script>example()</script>').querySelector('script')).toBeNull();
  });
});
describe('LoadingOverlay', () => {
  it('保持同一输入与草稿，加载时禁用 / inert，完成后恢复内部焦点', async () => {
    const root = createRef<HTMLDivElement>();
    const view = (loading: boolean) => <LoadingOverlay ref={root} loading={loading} label="正在处理">
      <Field label="草稿"><Input name="draft" defaultValue="初值" /></Field>
    </LoadingOverlay>;
    const { rerender } = render(view(false));
    const input = screen.getByRole('textbox', { name: '草稿' });
    await userEvent.type(input, '编辑');
    rerender(view(true));
    expect(input).toBeDisabled();
    expect(input.closest('[inert]')).not.toBeNull();
    expect(root.current).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('正在处理');
    rerender(view(false));
    expect(screen.getByRole('textbox', { name: '草稿' })).toBe(input);
    expect(input).toHaveValue('初值编辑');
    expect(input).toHaveFocus();
  });
  it('链接也被 inert 阻断，外部已取得焦点时完成不抢回', async () => {
    const root = createRef<HTMLDivElement>();
    const view = (loading: boolean) => <><LoadingOverlay ref={root} loading={loading}>
      <Link href="https://example.com/">详情</Link>
    </LoadingOverlay><Button>外部</Button></>;
    const { rerender } = render(view(false));
    screen.getByRole('link', { name: '详情' }).focus();
    rerender(view(true));
    expect(root.current).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '外部' }));
    rerender(view(false));
    expect(screen.getByRole('button', { name: '外部' })).toHaveFocus();
  });
});
