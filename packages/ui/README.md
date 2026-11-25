# @desk/ui

React 19 + TypeScript 组件库，覆盖后台应用的表单、数据与反馈组件，以及浏览器桌面的壳层：窗口、Dock、菜单栏、桌面图标、锁屏、通知中心等。

A React 19 + TypeScript component library for admin apps and browser desktops: forms, data display, feedback, plus a desktop shell (windows, Dock, menu bar, desktop icons, lock screen, notification center).

## 安装

```sh
pnpm add @desk/ui react react-dom
```

`react` 与 `react-dom` 19 为 peer 依赖。

## 使用

在应用入口引入一次样式表，再按需导入组件：

```tsx
import '@desk/ui/styles.css';
import { Button, Workspace } from '@desk/ui';

export function App() {
  return (
    <Workspace>
      <Button variant="primary">保存</Button>
    </Workspace>
  );
}
```

- 样式表 `@desk/ui/styles.css` 同样可以直接用 `<link>` 引用（例如 iframe 中的页面），壁纸图片位于同级的 `assets/`，按需加载。
- 列表、文档类页面放进 `Workspace`，它提供字体、底色、公共滚动条和容器查询上下文。
- 默认文案为简体中文，通过 `ConfigProvider` 切换语言或覆盖文案；组件的 `labels` 与显式文字属性优先。
- 使用 Vitest 测试时，可在 `setupFiles` 中加入 `@desk/ui/test-setup`，它补齐 jsdom 缺少的 Popover API 并启用 jest-dom 断言。

## 设计约定

- 组件不发请求、不读写浏览器存储、不依赖全局宿主对象；数据、权限、保存与生命周期由使用方通过属性与回调注入。
- 样式位于 CSS 层 `@layer ds`，类名前缀 `ds-`，主题由设计令牌（CSS 变量）控制，支持浅色、深色与高对比度。
- 可见文字不小于 `12px`；交互组件提供键盘操作、焦点管理与无障碍名称。
- 运行时依赖只有 `lucide-react`（图标）。

## 目录

```text
src/
├── index.ts      # 公共导出，同时引入样式
├── styles/       # 设计令牌、根容器与全局样式
├── foundation/   # 共享 hook、图标、浮层定位、文案与格式化
├── primitives/   # 按钮、输入、选择器、日期时间、反馈等基础组件
├── layout/       # 面板、表格、分页、标签页、树、日历等布局与数据组件
├── domain/       # 上传、图片预览与裁剪、Markdown 编辑与渲染、消息、权限树、AI 工具
└── shell/        # 桌面壳：桌面、窗口、Dock、菜单栏、弹窗、锁屏、通知中心、壁纸
```

全部组件的示例与属性说明见[组件文档站](https://xyzphp.github.io/desk-ui/)（源码在 `apps/docs`）。

## 开发

在仓库根目录执行：

```sh
pnpm install
pnpm --filter @desk/ui test        # Vitest
pnpm --filter @desk/ui typecheck
pnpm --filter @desk/ui build       # 产出 dist/
```

测试文件与组件同目录（`*.test.tsx`，Vitest + Testing Library）。

## 许可证

MIT，见 [LICENSE](LICENSE)。
