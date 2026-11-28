import type { ComponentProps } from 'react';
import { cx } from './cx';

/** 工作区背景表面：default 为标准面板底色，ambient 为商店/目录页的浅雾微光工作台画布。 */
export type WorkspaceSurface = 'default' | 'ambient';

export interface WorkspaceProps extends ComponentProps<'div'> {
  /** 背景表面，ambient 会覆盖工具栏与正文区域，避免顶栏或边缘出现白边。 */
  surface?: WorkspaceSurface;
}

/**
 * 工作区根容器：提供字体、底色、公共滚动条与容器查询上下文（ds-workspace），
 * 对应原生页面的 .workspace-app。列表 / 文档类页面应整体放在其中。
 */
export function Workspace({ surface = 'default', className, ...rest }: WorkspaceProps) {
  return (
    <div
      className={cx('ds-workspace', 'ds-scrollable', surface === 'ambient' && 'ds-workspace--ambient', className)}
      {...rest}
    />
  );
}

/** 单独启用公共滚动条样式的滚动区域，对应原生 workspace-scrollbars。 */
export function Scrollable({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-scrollable', className)} {...rest} />;
}
