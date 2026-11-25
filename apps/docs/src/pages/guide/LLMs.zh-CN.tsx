import { CodeBlock, Lead, Link, Panel, Title } from '@xyzos/desk-ui';

export function LLMsZh() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>LLMs 文档</Title>
        <Lead>为 AI 编程工具提供从组件源码与注册表自动生成的快速接入说明、分类索引、完整参考和逐组件 Markdown。</Lead>
      </header>

      <h2 className="docs-section-title">可用文档</h2>
      <Panel>
        <ul className="docs-list">
          <li>
            <code className="docs-code-inline">llms.txt</code>：中文索引，包含安装、样式引入、主题/多语言约定及按分类排列的逐页链接 —{' '}
            <Link href="./llms.txt" target="_blank" rel="noopener noreferrer">
              打开中文索引
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms-full.txt</code>：合并后的完整中文参考（含全部组件示例、属性表、无障碍约束与图标列表） —{' '}
            <Link href="./llms-full.txt" target="_blank" rel="noopener noreferrer">
              打开中文完整参考
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms.en-US.txt</code> 与{' '}
            <code className="docs-code-inline">llms-full.en-US.txt</code>：英文索引与英文标题本地化完整参考（详细说明保留源语言） —{' '}
            <Link href="./llms.en-US.txt" target="_blank" rel="noopener noreferrer">
              打开英文索引
            </Link>
            {' / '}
            <Link href="./llms-full.en-US.txt" target="_blank" rel="noopener noreferrer">
              打开英文完整参考
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms/zh-CN/&lt;页面 id&gt;.md</code> 与{' '}
            <code className="docs-code-inline">llms/en-US/&lt;页面 id&gt;.md</code>：单组件按需读取的 Markdown 文档，例如{' '}
            <Link href="./llms/zh-CN/button.md" target="_blank" rel="noopener noreferrer">
              按钮（button.md）
            </Link>
            {'、'}
            <Link href="./llms/zh-CN/icon.md" target="_blank" rel="noopener noreferrer">
              图标与全量图标名（icon.md）
            </Link>
            。
          </li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">推荐给 AI 工具的提示</h2>
      <CodeBlock
        label="提示词模板"
        language="text"
        code={
          '先读取 llms.txt 了解安装、样式入口与分类索引，再按任务需要拉取相关组件的 llms/zh-CN/<页面 id>.md。\n' +
          '组件从 @xyzos/desk-ui 导入；通过 npm 使用构建产物时务必在应用入口引入一次 @xyzos/desk-ui/styles.css。\n' +
          '严格遵循文档中的组件名、属性、默认值、图标名称、键盘导航与无障碍约束，不推测未记录的 API。'
        }
      />

      <h2 className="docs-section-title">生成方式与使用建议</h2>
      <Panel>
        <ul className="docs-list">
          <li>
            索引和逐页 Markdown 在每次开发请求或生产构建时自动从 <code className="docs-code-inline">registry.ts</code>、各{' '}
            <code className="docs-code-inline">ComponentDoc</code>、图标注册表与包元数据同步生成，无需手写维护第二份 API 文档。
          </li>
          <li>日常编码建议先读索引再按需拉取单个组件 Markdown，避免一次塞入全库占用过多上下文；离线导入或跨多组件重构时可使用完整参考文件。</li>
          <li>所有示例均为纯前端本地状态演示，组件不内置网络请求与存储读写，由宿主传入数据、权限与保存回调。</li>
        </ul>
      </Panel>
    </div>
  );
}
