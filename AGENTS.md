# 协作规则（智能体）

- 先读 [README](README.md) 与 [CONTRIBUTING](CONTRIBUTING.md)，组件约定以 CONTRIBUTING 为准。
- 依赖方向：`apps/docs → packages/ui`，组件库不得引用文档站。
- 改组件时，同一改动里同步维护导出、文档站页面、测试和 changeset。
- 基础自检：`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build:ui`、`pnpm build:docs`。如实报告运行过的命令及结果；未在真实浏览器中检查的外观与交互要明确说明。
- 不提交 `node_modules`、`dist`、密钥或任何运行配置；不手工编辑 `pnpm-lock.yaml`。
- 发布（`changeset version` / `changeset publish`）只由 Release 工作流执行，不在本地发布。
