import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HelpTip } from './Feedback';

describe('HelpTip', () => {
  it('是可聚焦的图片角色，提示文本同时作为无障碍名称', () => {
    render(<HelpTip text="用于限制每分钟的请求数" />);
    const tip = screen.getByRole('img', { name: '用于限制每分钟的请求数' });
    expect(tip).toHaveAttribute('tabindex', '0');
  });

  it('键盘聚焦时展示提示，失焦后收起', () => {
    render(<HelpTip text="用于限制每分钟的请求数" />);
    const tip = screen.getByRole('img', { name: '用于限制每分钟的请求数' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => tip.focus());
    expect(screen.getByRole('tooltip')).toHaveTextContent('用于限制每分钟的请求数');
    act(() => tip.blur());
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('合并自定义 className', () => {
    render(<HelpTip text="说明" className="custom" />);
    expect(screen.getByRole('img', { name: '说明' })).toHaveClass('ds-help-tip', 'custom');
  });
});
