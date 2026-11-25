import { describe, expect, it } from 'vitest';
import { formatBytes } from './format';

describe('formatBytes', () => {
  it('区分零与无效值，支持原系统基数、十进制、语言和自定义单位', () => {
    expect(formatBytes(0, { locale: 'en-US' })).toBe('0 B');
    expect(formatBytes(2097152, { locale: 'en-US' })).toBe('2 MB');
    expect(formatBytes(1500, { base: 1000, locale: 'en-US' })).toBe('1.5 KB');
    expect(formatBytes(1536, { units: ['B', 'KiB'], locale: 'de-DE' })).toBe('1,5 KiB');
    expect(formatBytes(1048575, { locale: 'en-US' })).toBe('1 MB');
    for (const invalid of [null, undefined, -1, NaN, Infinity]) expect(formatBytes(invalid, { empty: '无大小' })).toBe('无大小');
    expect(formatBytes(1024, { units: [], locale: 'en-US' })).toBe('1 KB');
  });
});
