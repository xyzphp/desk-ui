/** 沿用 moveImage 的移除后插入规则；禁用项固定位置且不能跨越。 */
export function reorderIds(order: readonly string[], id: string, to: number, locked: ReadonlySet<string>) {
  if (!Number.isInteger(to)) return order;
  const from = order.indexOf(id);
  const target = Math.max(0, Math.min(order.length - 1, to));
  if (from < 0 || from === target || locked.has(id)) return order;
  const crossed = order.slice(Math.min(from, target), Math.max(from, target) + 1);
  if (crossed.some((item) => locked.has(item))) return order;
  const next = [...order]; next.splice(from, 1); next.splice(target, 0, id);
  return next;
}
export function sameOrder(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
export function insertionIndex(order: readonly string[], source: string, target: string, after: boolean) {
  const remaining = order.filter((id) => id !== source);
  const index = remaining.indexOf(target);
  return index < 0 ? order.indexOf(source) : index + (after ? 1 : 0);
}
