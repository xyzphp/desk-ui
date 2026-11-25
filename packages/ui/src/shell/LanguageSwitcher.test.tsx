import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../foundation/ConfigProvider';
import { enUS } from '../foundation/localeEnUS';
import { SYSTEM_LOCALE } from '../foundation/locales';
import { LanguageSwitcher, type LanguageOption } from './LanguageSwitcher';

const three: LanguageOption[] = [
  { tag: 'zh-CN', name: '简体中文', short: '中' },
  { tag: 'en-US', name: 'English', short: 'EN' },
  { tag: 'ja-JP', name: '日本語', short: 'あ' },
];

describe('LanguageSwitcher 两种语言互切', () => {
  it('入口显示当前语言短码，点击直接换成另一种语言，不弹菜单', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<LanguageSwitcher choice="zh-CN" current="zh-CN" onChoiceChange={change} />);
    const trigger = screen.getByRole('button', { name: '切换到 English' });
    expect(trigger).toHaveTextContent('中');
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    await user.click(trigger);
    expect(change).toHaveBeenCalledWith('en-US');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('当前为英文时切回中文', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<LanguageSwitcher choice="en-US" current="en-US" onChoiceChange={change} />);
    const trigger = screen.getByRole('button', { name: '切换到 简体中文' });
    expect(trigger).toHaveTextContent('EN');
    await user.click(trigger);
    expect(change).toHaveBeenCalledWith('zh-CN');
  });

  it('跟随系统时按生效语言互切，结果是显式选择另一种语言', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<LanguageSwitcher choice={SYSTEM_LOCALE} current="en-US" onChoiceChange={change} />);
    await user.click(screen.getByRole('button', { name: '切换到 简体中文' }));
    expect(change).toHaveBeenCalledWith('zh-CN');
  });

  it('键盘 Enter 触发互切，文案随 ConfigProvider 切换', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US" labels={enUS}>
        <LanguageSwitcher choice="en-US" current="en-US" variant="plain" onChoiceChange={change} />
      </ConfigProvider>,
    );
    screen.getByRole('button', { name: 'Switch to 简体中文' }).focus();
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('zh-CN');
  });
});

describe('LanguageSwitcher 多于两种语言', () => {
  it('点击弹出单选菜单，列出各语言与跟随系统', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher locales={three} choice="zh-CN" current="zh-CN" onChoiceChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: '当前语言：简体中文' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: '切换语言' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: '简体中文', checked: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: '日本語', checked: false })).toHaveAttribute('lang', 'ja-JP');
    expect(screen.getByRole('menuitemradio', { name: '跟随系统', checked: false })).toBeInTheDocument();
  });

  it('选择另一种语言时回调并关闭菜单，重复选择当前项不回调', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<LanguageSwitcher locales={three} choice="zh-CN" current="zh-CN" onChoiceChange={change} />);
    await user.click(screen.getByRole('button', { name: '当前语言：简体中文' }));
    await user.click(screen.getByRole('menuitemradio', { name: '日本語' }));
    expect(change).toHaveBeenCalledWith('ja-JP');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '当前语言：简体中文' }));
    await user.click(screen.getByRole('menuitemradio', { name: '简体中文' }));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('方向键在菜单项间移动，Esc 关闭并把焦点还给入口', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher locales={three} choice="zh-CN" current="zh-CN" onChoiceChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: '当前语言：简体中文' });
    await user.click(trigger);
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitemradio', { name: '跟随系统' })).toHaveFocus();
    await user.keyboard('{Home}{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: 'English' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('allowSystem 关闭时不出现系统项', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher locales={three} allowSystem={false} choice="ja-JP" current="ja-JP" onChoiceChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: '当前语言：日本語' }));
    expect(screen.queryByRole('menuitemradio', { name: '跟随系统' })).not.toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
