/** 原站从右向左按高度依次分列，达到宽度预算后让末列纵向滚动。 */
export function desktopCardColumns(
  heights: readonly number[],
  availableHeight: number,
  maxColumns: number,
  gap: number,
) {
  const safety = Math.max(36, Math.min(72, availableHeight * 0.09));
  const targetHeight = Math.max(160, availableHeight - safety);
  const columns: number[][] = [[]];
  const totals = [0];
  let index = 0;
  heights.forEach((height, item) => {
    const nextHeight = totals[index]! + (totals[index] ? gap : 0) + height;
    if (totals[index] && nextHeight > targetHeight && index + 1 < maxColumns) {
      index += 1;
      columns[index] = [];
      totals[index] = 0;
    }
    columns[index]!.push(item);
    totals[index] = totals[index]! + (totals[index] ? gap : 0) + height;
  });
  return { columns, totals };
}
