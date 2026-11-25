# desk-ui

[![CI](https://github.com/xyzphp/desk-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/xyzphp/desk-ui/actions/workflows/ci.yml)
[![Docs](https://github.com/xyzphp/desk-ui/actions/workflows/docs.yml/badge.svg)](https://xyzphp.github.io/desk-ui/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

面向后台应用与浏览器桌面的 React 组件库 `@xyzos/desk-ui`，以及用它自己搭成的组件文档站。

A React 19 + TypeScript component library for admin apps and browser desktops — forms, data display and feedback, plus a full desktop shell — with a documentation site built from the library itself.

**组件文档 / Docs：<https://xyzphp.github.io/desk-ui/>**

## 特性

- **147 个组件文档页，6 个分类**：基础、表单、反馈、布局、数据、桌面系统，每个组件都有可操作示例、属性表与无障碍说明；使用指南内置 LLMs 文档页，构建时自动生成 `llms.txt`、完整参考与逐组件 Markdown。
- **完整的桌面壳**：桌面与图标网格、窗口（macOS / Windows 两种标题栏）、Dock 与任务栏、菜单栏、开始菜单、启动台、窗口切换、命令面板、通知中心、锁屏、右键菜单与动态场景壁纸。
- **后台常用组件**：表单与选择器（日期 / 时间 / 范围、搜索选择、标签输入、取色器）、表格与分页、树与权限树、上传与图片裁剪、Markdown 编辑与渲染、消息线程、图表、AI 编辑工具条。
- **主题**：设计令牌（CSS 变量）统一颜色、圆角、间距与字号，支持浅色、深色与高对比度。
- **多语言**：内置简体中文与英文文案，`ConfigProvider` 切换语言或覆盖任意文案。
- **无障碍**：键盘操作、焦点管理与 ARIA 语义，测试中包含 axe 语义检查。
- **与宿主解耦**：组件不发请求、不读写浏览器存储、不依赖全局对象，数据、权限与保存由使用方注入。
- **依赖少**：React 19 为 peer 依赖，运行时依赖只有 `lucide-react`（图标）。

## 使用

### 通过 npm 安装

```sh
pnpm add @xyzos/desk-ui
# 或 npm install @xyzos/desk-ui
```

在应用入口显式引入一次样式表，再按需导入组件：

```tsx
import '@xyzos/desk-ui/styles.css';
import { Button, Workspace } from '@xyzos/desk-ui';

export function App() {
  return (
    <Workspace>
      <Button variant="primary">保存</Button>
    </Workspace>
  );
}
```

### 通过 git 子模块直接使用源码（pnpm 工作区）

```sh
git submodule add https://github.com/xyzphp/desk-ui.git vendor/desk-ui
```

```yaml
# pnpm-workspace.yaml
packages:
  - vendor/desk-ui/packages/*
```

```json
{ "dependencies": { "@xyzos/desk-ui": "workspace:*" } }
```

以源码方式在工作区内使用时，引入一次 `@xyzos/desk-ui` 即自动带上样式。

更多用法、全部组件与示例见[文档站](https://xyzphp.github.io/desk-ui/)和 [packages/ui](packages/ui/README.md)。

## 浏览器支持

需要支持 CSS 级联层（`@layer`）与容器查询的现代浏览器。浮层优先使用 Popover API，不支持的环境就地显示。

## 仓库结构

| 目录 | 内容 |
|---|---|
| [packages/ui](packages/ui/README.md) | 组件库 `@xyzos/desk-ui` |
| [apps/docs](apps/docs/README.md) | 组件文档站（静态单页应用，部署在 GitHub Pages） |
| `scripts/` | 代码质量检查（行长、色值、已抽取文案） |
| `.changeset/` | 版本与变更说明 |

## 开发

需要 Node 22.18+（或 24.11+）与 pnpm（版本见 `package.json` 的 `packageManager`，可用 `corepack enable` 启用）。

```sh
pnpm install
pnpm dev:docs        # 启动文档站
pnpm check           # 类型检查、lint、测试、元数据测试与两个构建
```

| 命令 | 作用 |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm format:check` | 静态检查 |
| `pnpm test` | 组件测试（Vitest + Testing Library + axe 语义检查） |
| `pnpm test:metadata` | 文档站搜索元数据抽取测试 |
| `pnpm build:ui` | 构建组件库到 `packages/ui/dist` |
| `pnpm build:docs` | 构建文档站到 `apps/docs/dist` |
| `pnpm changeset` | 为组件库改动添加版本说明 |

推送到 `main` 后，`CI` 工作流运行全部检查，`Docs` 工作流自动部署文档站。

## 发布

版本由 [Changesets](https://github.com/changesets/changesets) 管理，包名为 `@xyzos/desk-ui`。发布通过 GitHub Actions 的 `Release` 工作流执行（产出 ESM、类型声明、独立样式表与来源证明）。

## 参与贡献

贡献约定见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

## 许可证与第三方说明

- **本仓库**：[MIT](LICENSE)。壁纸场景及其图片素材为 AI 生成，随组件库以同一许可证提供。
- **图标依赖**：矢量图标使用 [Lucide](https://lucide.dev/)（`lucide-react`，[ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE)；其中部分图标衍生自 [Feather Icons](https://feathericons.com/)，MIT License，Copyright (c) 2013-present Cole Bemis）。
- **设计参考**：部分表单选择与层次细节参考了 [Naive UI](https://www.naiveui.com/)（MIT License）的视觉风格，未引入其代码或依赖。
