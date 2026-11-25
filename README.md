# desk-ui

`@desk/ui` 组件库与组件文档站的源码仓库。

Source for the `@desk/ui` React component library and its documentation site.

| 目录 | 内容 |
|---|---|
| [packages/ui](packages/ui/README.md) | 组件库 `@desk/ui`：后台应用的表单、数据、反馈组件，以及浏览器桌面壳层（窗口、Dock、菜单栏、锁屏、通知中心等） |
| [apps/docs](apps/docs/README.md) | 组件文档站：本身就是用组件库搭成的浏览器桌面，每个组件有示例、属性表与无障碍说明 |

## 快速开始

需要 Node 22.18+（或 24.11+）与 pnpm（版本见 `package.json` 的 `packageManager`，可用 `corepack enable` 启用）。

```sh
pnpm install
pnpm dev:docs        # 启动文档站
pnpm check           # 类型检查、lint、测试、元数据测试与两个构建
```

常用命令：

| 命令 | 作用 |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm format:check` | 静态检查 |
| `pnpm test` | 组件测试（Vitest + Testing Library + axe 语义检查） |
| `pnpm test:metadata` | 文档站搜索元数据抽取测试 |
| `pnpm build:ui` | 构建组件库到 `packages/ui/dist` |
| `pnpm build:docs` | 构建文档站到 `apps/docs/dist` |
| `pnpm changeset` | 为组件库改动添加版本说明 |

## 发布

组件库通过 [Changesets](https://github.com/changesets/changesets) 管理版本，由 GitHub Actions 的 `Release` 工作流发布到 npm（可信发布，附来源证明）。文档站由 `Docs` 工作流部署到 GitHub Pages。

贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题报告方式见 [SECURITY.md](SECURITY.md)。
