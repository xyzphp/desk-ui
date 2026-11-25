import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../foundation/ConfigProvider';
import { AccentPicker, SegmentedControl, ThemePicker, WallpaperPicker } from './Pickers';

describe('SegmentedControl', () => {
  const options = [
    { value: 'auto', label: '跟随系统' },
    { value: 'macos', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
  ];

  it('分组有名称，当前项 aria-pressed，点击回调选项值', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl aria-label="窗口风格" options={options} value="macos" onChange={onChange} />);
    expect(screen.getByRole('group', { name: '窗口风格' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'macOS' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Windows' }));
    expect(onChange).toHaveBeenCalledWith('windows');
  });

  it('选项是 button 类型，不会提交外层表单', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SegmentedControl aria-label="窗口风格" options={options} value="auto" onChange={() => {}} />
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'macOS' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('紧凑选项可用说明提供悬停提示和无障碍名称', () => {
    render(
      <SegmentedControl
        aria-label="验证码安全等级"
        options={[{ value: 'low', label: '低', description: '低（误差宽松）' }]}
        value="low"
        onChange={() => {}}
      />,
    );
    const option = screen.getByRole('button', { name: '低（误差宽松）' });
    expect(option).toHaveTextContent('低');
    expect(option).toHaveAttribute('title', '低（误差宽松）');
  });
});

describe('ThemePicker', () => {
  it('提供自动、浅色、深色三个选项并标记当前项', async () => {
    const onChange = vi.fn();
    render(<ThemePicker value="light" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '浅色' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '自动' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: '深色' }));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('文案可由 ConfigProvider 覆盖', () => {
    render(
      <ConfigProvider labels={{ themePicker: { dark: 'Dark' } }}>
        <ThemePicker value="auto" onChange={() => {}} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '浅色' })).toBeInTheDocument();
  });
});

describe('AccentPicker', () => {
  const colors = [
    { value: '#0a84ff', label: '蓝色' },
    { value: '#ff375f', label: '红色' },
  ];

  it('颜色按钮以名称标识，当前色 aria-pressed，点击回调颜色值', async () => {
    const onChange = vi.fn();
    render(<AccentPicker colors={colors} value="#0a84ff" onChange={onChange} />);
    expect(screen.getByRole('group', { name: '强调色' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '蓝色' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '红色' }));
    expect(onChange).toHaveBeenCalledWith('#ff375f');
  });
});

describe('WallpaperPicker', () => {
  it('八张内置壁纸使用本地化名称，当前项 aria-pressed，点击回调壁纸名', async () => {
    const onChange = vi.fn();
    render(<WallpaperPicker value="aurora" onChange={onChange} />);
    expect(screen.getAllByRole('button')).toHaveLength(8);
    expect(screen.getByRole('button', { name: '极光' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '暮色' }));
    expect(onChange).toHaveBeenCalledWith('dusk');
    await userEvent.click(screen.getByRole('button', { name: '水族馆' }));
    expect(onChange).toHaveBeenLastCalledWith('aquarium');
    for (const [name, value] of [
      ['森林', 'forest'],
      ['草原', 'grassland'],
      ['星空', 'galaxy'],
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name }));
      expect(onChange).toHaveBeenLastCalledWith(value);
    }
  });

  it('壁纸名称可由 ConfigProvider 覆盖', () => {
    render(
      <ConfigProvider labels={{ wallpaperPicker: { sequoia: 'Sequoia' } }}>
        <WallpaperPicker value="sequoia" onChange={() => {}} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Sequoia' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '索诺玛' })).toBeInTheDocument();
  });
});
