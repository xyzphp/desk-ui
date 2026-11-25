# 组件文档站（@desk/docs）

`@desk/ui` 的文档站，是一个静态单页应用（Vite + React）。站点本身就是用组件库搭成的浏览器桌面：组件按分类做成桌面图标，双击图标或点击 Dock 打开分类窗口，窗口内是该分类的文档页。

- 访问 `#/<页面 id>` 直接打开对应页面，例如 `#/window`、`#/select`。
- 侧栏常驻全站搜索，按名称、API 标识、属性与说明检索；查询只保存在当前页面内存。
- 示例只使用本地数据与计时器，不请求接口，也不保存用户选择的文件。
- 构建产物是纯静态文件（hash 路由），可部署到任意静态托管，不需要服务端回退。

## 目录

```text
src/
├── main.tsx、App.tsx、docs.css    # 入口与文档排版样式（不覆盖组件外观）
├── registry.ts                    # 分类（桌面图标）与页面登记
├── site/                          # 桌面壳、分类窗口、窗口管理、外观偏好、站点文案
├── blocks/                        # 文档积木：ComponentPage 模板、Demo、PropsTable、类型
└── pages/
    ├── guide/                     # 概览、设计令牌、使用约定
    └── components/                # 按主题共用文件，每个主组件独立导出 ComponentDoc
build/docMetadata.mjs              # 构建时从源码抽取搜索元数据
```

## 新增一个组件页

1. 在 `src/pages/components/` 新建（或加入已有）文件，为每个主组件导出独立的 `ComponentDoc`：`name`、`summary`（可为中英双语对象）、`usage`、`demos`（`code` 必须与 `render` 写法一致）、`api`（组件名和属性名保留代码标识）、`a11y`。
2. 在 `src/registry.ts` 用 `component(id, 分类 id, 图标, doc)` 登记。壳层组件的示例用 `layout: 'stage'`（迷你桌面舞台）。
3. 标题与摘要保持静态字符串，搜索元数据在构建时抽取；`pnpm test:metadata` 检查抽取规则。
4. 运行 `pnpm typecheck`，并确认示例在浅色 / 深色下可读。

## 命令

在仓库根目录执行：

```sh
pnpm dev:docs     # 开发服务器
pnpm build:docs   # 产出 apps/docs/dist
```
