import type { ComponentProps } from 'react';
import { cx } from './cx';

/**
 * 工作区根容器：提供字体、底色、公共滚动条与容器查询上下文（ds-workspace），
 * 对应原生页面的 .workspace-app。列表 / 文档类页面应整体放在其中。
 */
export function Workspace({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-workspace', 'ds-scrollable', className)} {...rest} />;
}

/** 单独启用公共滚动条样式的滚动区域，对应原生 workspace-scrollbars。 */
export function Scrollable({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-scrollable', className)} {...rest} />;
}
