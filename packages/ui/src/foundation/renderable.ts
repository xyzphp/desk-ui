import type { ReactNode } from 'react';

/** 插槽是否有可渲染内容：`cond && <X />` 得到的 false、空字符串与空值都视为未提供。 */
export function isRenderable(node: ReactNode) {
  return node != null && node !== false && node !== true && node !== '';
}
