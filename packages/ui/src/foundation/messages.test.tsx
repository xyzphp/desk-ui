import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigProvider, useLocale } from './ConfigProvider';
import { zhCN } from './locale';
import { enUS } from './localeEnUS';
import { locales, normalizeLocaleChoice, resolveLocale, SYSTEM_LOCALE } from './locales';
import { defineMessages, matchLocale, pickMessages, useMessages } from './messages';

const catalog = defineMessages(
  'zh-CN',
  { title: '任务', count: (total: number) => `共 ${total} 项` },
  { 'en-US': { title: 'Tasks', count: (total: number) => `${total} ${total === 1 ? 'item' : 'items'}` } },
);

function Probe() {
  const messages = useMessages(catalog);
  return <p data-locale={useLocale()}>{`${messages.title}｜${messages.count(1)}`}</p>;
}

describe('文案运行时', () => {
  it('没有 Provider 时使用基准语言', () => {
    render(<Probe />);
    expect(screen.getByText('任务｜共 1 项')).toHaveAttribute('data-locale', 'zh-CN');
  });

  it('按最近的 ConfigProvider 取字典，嵌套时未指定 locale 继承父级', () => {
    render(
      <ConfigProvider locale="en-US">
        <ConfigProvider labels={{ select: { placeholder: 'Pick' } }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByText('Tasks｜1 item')).toHaveAttribute('data-locale', 'en-US');
  });

  it('没有对应翻译时按主语言匹配，再回退基准语言', () => {
    expect(pickMessages(catalog, 'en-GB').title).toBe('Tasks');
    expect(pickMessages(catalog, 'ja-JP').title).toBe('任务');
  });

  it('matchLocale 按偏好顺序匹配：完全相同优先于主语言相同', () => {
    const supported = ['zh-CN', 'en-US'];
    expect(matchLocale(['fr-FR', 'en-GB', 'zh-CN'], supported, 'zh-CN')).toBe('en-US');
    expect(matchLocale(['ZH-cn'], supported, 'en-US')).toBe('zh-CN');
    expect(matchLocale([], supported, 'zh-CN')).toBe('zh-CN');
  });
});

describe('语言登记表', () => {
  it('第一项是回退语言，每项都带完整的组件文案', () => {
    expect(locales[0]?.tag).toBe('zh-CN');
    expect(locales.map((item) => item.labels)).toEqual([zhCN, enUS]);
  });

  it('英文文案与中文文案的分组一致', () => {
    expect(Object.keys(enUS).sort()).toEqual(Object.keys(zhCN).sort());
  });

  it('偏好只接受跟随系统和已登记语言', () => {
    expect(normalizeLocaleChoice('en-US')).toBe('en-US');
    expect(normalizeLocaleChoice('ja-JP')).toBe(SYSTEM_LOCALE);
    expect(normalizeLocaleChoice(undefined)).toBe(SYSTEM_LOCALE);
  });

  it('跟随系统时按系统语言解析，显式选择不受系统语言影响', () => {
    expect(resolveLocale(SYSTEM_LOCALE, ['en-AU', 'zh-CN']).tag).toBe('en-US');
    expect(resolveLocale(SYSTEM_LOCALE, ['ja-JP']).tag).toBe('zh-CN');
    expect(resolveLocale(SYSTEM_LOCALE).tag).toBe('zh-CN');
    expect(resolveLocale('zh-CN', ['en-US']).tag).toBe('zh-CN');
  });
});
