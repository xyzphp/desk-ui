import { Icon, Lead, Panel, Title, iconNames } from '@xyzos/desk-ui';
import { Demo } from '../../blocks/Demo';
import { PropsTable } from '../../blocks/PropsTable';

/** 图标页是图库，不走通用组件页模板。 */
export function IconPage() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <p className="docs-eyebrow">原生来源 · <span className="docs-code-inline">OS.icons.markup(name)</span> / <span className="docs-code-inline">data-lucide</span></p>
        <Title>图标</Title>
        <Lead>基于 lucide 的装饰性图标，名称与原生页面的 data-lucide 一一对应，迁移时无需改名。图标按需注册，只有列在下面的名称可用；缺少的名称在 foundation/Icon.tsx 中补充。</Lead>
      </header>

      <h2 className="docs-section-title">示例</h2>
      <Demo
        title="尺寸与颜色"
        description="图标默认 1em，在按钮、列表等容器内由容器 CSS 限定尺寸；颜色继承文字色。"
        code={`<Icon name="settings" />
<Icon name="settings" size={20} />
<Icon name="settings" size={28} style={{ color: 'var(--accent)' }} />`}
        render={() => (
          <>
            <Icon name="settings" />
            <Icon name="settings" size={20} />
            <Icon name="settings" size={28} style={{ color: 'var(--accent)' }} />
          </>
        )}
      />

      <h2 className="docs-section-title">图库（{iconNames.length}）</h2>
      <Panel>
        <div className="docs-icons">
          {iconNames.map((name) => (
            <div key={name} className="docs-icon-cell">
              <Icon name={name} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </Panel>

      <h2 className="docs-section-title">组件属性</h2>
      <PropsTable
        component="Icon"
        props={[
          { name: 'name', type: 'IconName', description: '必填，图标名称。' },
          { name: 'size', type: 'number', description: '像素尺寸；缺省为 1em。' },
          { name: 'strokeWidth', type: 'number', default: '1.8', description: '线宽，与原生 .xyz-icon 一致。' },
        ]}
      />

      <h2 className="docs-section-title">无障碍与规范</h2>
      <Panel>
        <ul className="docs-list">
          <li>默认 aria-hidden，不可聚焦；图标单独表达含义时用外层控件的文字或 aria-label。</li>
          <li>不使用 emoji 或文字符号充当图标。</li>
        </ul>
      </Panel>
    </div>
  );
}
