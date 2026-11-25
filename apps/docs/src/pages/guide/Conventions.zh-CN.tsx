import { Lead, Panel, Title } from '@desk/ui';

export function ConventionsZh() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>使用约定</Title>
        <Lead>组件库与桌面现有规范保持一致。页面只写业务差异，不复制公共样式另改配色、间距、圆角或选中态。</Lead>
      </header>

      <h2 className="docs-section-title">接入</h2>
      <Panel>
        <ul className="docs-list">
          <li>在应用入口 <code className="docs-code-inline">import '@desk/ui'</code> 一次，会同时引入全部样式。需要纯样式（如 iframe 扩展应用）时使用构建产物 <code className="docs-code-inline">@desk/ui/styles.css</code>。</li>
          <li>列表 / 文档类页面整体放进 <code className="docs-code-inline">Workspace</code>：它提供字体、底色、公共滚动条和容器查询上下文。</li>
          <li>组件库不依赖任何全局宿主对象，不发请求、不读写浏览器存储；宿主能力通过属性与回调注入。</li>
          <li>默认文案由 ConfigProvider 配置并支持嵌套继承；组件 labels 或显式文字属性优先。业务标题、数据选项与领域 labels 继续由宿主提供。</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">样式</h2>
      <Panel>
        <ul className="docs-list">
          <li>类名统一使用 <code className="docs-code-inline">ds-</code> 前缀，规则全部在 <code className="docs-code-inline">@layer ds</code> 中。注意：没有分层的原生 CSS 优先级高于任何分层规则，所以不要复用原生类名，也不要写会命中组件内部的裸元素选择器。</li>
          <li>不要用 <code className="docs-code-inline">!important</code> 或提高选择器权重覆盖组件；确有差异先扩展组件属性。</li>
          <li>所有可见文字不低于 12px；保留清晰的键盘焦点、禁用、加载和错误状态。</li>
          <li>窄窗口使用容器查询适配（800px、600px 断点沿用原生页面），不依赖视口宽度。</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">行为</h2>
      <Panel>
        <ul className="docs-list">
          <li>用户文本只经 React 默认转义渲染，不使用 <code className="docs-code-inline">dangerouslySetInnerHTML</code>。</li>
          <li>常规主操作流不使用侵入式模态弹窗，次级操作就地展开；确认用 ConfirmDialog，任意模态内容用 Modal。</li>
          <li>必要提示统一用 HelpTip 问号悬停，不堆叠说明小字。</li>
          <li>行为绑定用稳定的 <code className="docs-code-inline">data-*</code> 或 ID，不依赖样式类名。</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">新增组件</h2>
      <Panel>
        <ul className="docs-list">
          <li>组件按来源驱动或待办清单中的前瞻通用轨道准入；单页专用的业务视觉留在页面里。</li>
          <li>新增组件同时在 <code className="docs-code-inline">apps/docs/src/pages/components/</code> 增加文档页并登记到 <code className="docs-code-inline">registry.ts</code>，示例与属性表缺一不可。</li>
          <li>原生应用迁移并完成独立验收后，按迁移计划清理旧实现；组件库孵化阶段保留现有运行时。</li>
        </ul>
      </Panel>
    </div>
  );
}
