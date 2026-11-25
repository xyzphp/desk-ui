import { describe, expect, it } from 'vitest';
import { desktopCardColumns } from './desktopCardColumns';

describe('桌面卡片分列', () => {
  it('按原站安全余量依次分列，达到宽度预算后让末列溢出', () => {
    expect(desktopCardColumns([180, 180, 180, 180], 400, 2, 12)).toEqual({
      columns: [[0], [1, 2, 3]],
      totals: [180, 564],
    });
  });

  it('单个高卡片留在首列，其余卡片按原顺序进入下一列', () => {
    expect(desktopCardColumns([500, 80, 80], 400, 3, 12)).toEqual({
      columns: [[0], [1, 2]],
      totals: [500, 172],
    });
  });

  it('折叠后的高度重新分列，间距只发生在同列卡片之间', () => {
    expect(desktopCardColumns([48, 48, 48], 400, 2, 12)).toEqual({ columns: [[0, 1, 2]], totals: [168] });
    expect(desktopCardColumns([], 400, 2, 12)).toEqual({ columns: [[]], totals: [0] });
  });
});
