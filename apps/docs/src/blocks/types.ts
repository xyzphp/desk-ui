import type { ReactNode } from 'react';
import type { DesktopCardStyle, DockStyle, WallpaperName, WindowPlatform } from '@desk/ui';
import type { LocalizedText } from './docText';

export interface PropSpec {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** 构建插件从文档源码派生，导航搜索不需要加载示例模块。 */
export interface DocMetadata { name: string | LocalizedText; summary: string | LocalizedText; keywords: readonly string[] }

export interface DemoSpec {
  title: string;
  description?: string;
  /** 展示用代码，需与 render 的实际写法保持一致。 */
  code: string;
  render: () => ReactNode;
  /** 预览区排布：默认横向排列；stack 纵向撑满；frame 内嵌 380px 高的工作区画框；stage 内嵌一个迷你桌面（壁纸 + 壳层样式），用于菜单栏、Dock、窗口等壳层组件。 */
  layout?: 'row' | 'stack' | 'frame' | 'stage';
  /** layout 为 stage 时的桌面配置。 */
  stage?: {
    dockStyle?: DockStyle;
    dockAlign?: 'center' | 'left';
    windowPlatform?: WindowPlatform;
    wallpaper?: WallpaperName;
    cardStyle?: DesktopCardStyle;
  };
}

export interface ApiSpec {
  /** 组件名，如 Button。 */
  component: string;
  props: PropSpec[];
}

export interface ComponentDoc {
  /** 展示标题（支持双语），供页面与导航共用；代码中的组件标识写入 api.component。 */
  name: string | LocalizedText;
  summary: string | LocalizedText;
  usage: string[];
  demos: DemoSpec[];
  api: ApiSpec[];
  a11y: string[];
}
