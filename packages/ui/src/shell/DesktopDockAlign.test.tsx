import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Desktop } from './Desktop';

describe('Desktop 任务栏对齐', () => {
  it('Windows 风格下 dockAlign="left" 写入 data-dock-align，默认与 macOS 风格不写入', () => {
    const { container, rerender } = render(<Desktop dockStyle="windows" dockAlign="left" />);
    const desktop = () => container.querySelector('.ds-desktop')!;
    expect(desktop()).toHaveAttribute('data-dock-align', 'left');
    rerender(<Desktop dockStyle="windows" />);
    expect(desktop()).not.toHaveAttribute('data-dock-align');
    rerender(<Desktop dockStyle="macos" dockAlign="left" />);
    expect(desktop()).not.toHaveAttribute('data-dock-align');
  });
});
