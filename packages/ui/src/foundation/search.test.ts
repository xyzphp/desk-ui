import { describe, expect, it } from 'vitest';
import { matchesSearch } from './search';

describe('matchesSearch', () => {
  it('支持中文、API 大小写、全角字符与多词交集，不解释正则或 HTML', () => {
    const text = '搜索选择器 Combobox query 输入过滤';
    expect(matchesSearch(text, '选择 COMBOBOX')).toBe(true);
    expect(matchesSearch(text, 'Ｃｏｍｂｏｂｏｘ')).toBe(true);
    expect(matchesSearch(text, 'query 不存在')).toBe(false);
    expect(matchesSearch(text, '[.*]')).toBe(false);
    expect(matchesSearch(text, '   ')).toBe(true);
  });
});
