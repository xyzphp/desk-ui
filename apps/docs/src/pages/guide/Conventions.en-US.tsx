import { Lead, Panel, Title } from '@xyzos/desk-ui';

export function ConventionsEn() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>Conventions</Title>
        <Lead>The library follows the existing desktop conventions. Pages only write business differences; never copy shared styles to tweak colors, spacing, radius, or selection states.</Lead>
      </header>

      <h2 className="docs-section-title">Getting started</h2>
      <Panel>
        <ul className="docs-list">
          <li>Import <code className="docs-code-inline">@xyzos/desk-ui</code> once at the app entry to bring in all styles. For style-only use (such as iframe extension apps), load the build output <code className="docs-code-inline">@xyzos/desk-ui/styles.css</code>.</li>
          <li>Put list / document pages inside <code className="docs-code-inline">Workspace</code>: it provides the font, background, shared scrollbars, and container query context.</li>
          <li>The library depends on no global host object, sends no requests, and never reads or writes browser storage; host capabilities are injected through props and callbacks.</li>
          <li>Default labels come from ConfigProvider with nested inheritance; component labels or explicit text props win. Business titles, data options, and domain labels stay host-owned.</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">Styles</h2>
      <Panel>
        <ul className="docs-list">
          <li>Class names use the <code className="docs-code-inline">ds-</code> prefix, and all rules live in <code className="docs-code-inline">@layer ds</code>. Note that unlayered native CSS beats any layered rule, so never reuse native class names or write bare element selectors that reach into components.</li>
          <li>Do not override components with <code className="docs-code-inline">!important</code> or higher selector weight; extend component props first when a difference is real.</li>
          <li>All visible text stays at 12px or larger; keep clear keyboard focus, disabled, loading, and error states.</li>
          <li>Narrow windows adapt with container queries (800px and 600px breakpoints match native pages), never viewport width.</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">Behavior</h2>
      <Panel>
        <ul className="docs-list">
          <li>User text renders through React default escaping only; no <code className="docs-code-inline">dangerouslySetInnerHTML</code>.</li>
          <li>Primary flows avoid intrusive modals; secondary actions expand in place. Confirm with ConfirmDialog, and use Modal for arbitrary modal content.</li>
          <li>Use HelpTip question marks for necessary hints instead of stacking fine-print descriptions.</li>
          <li>Bind behavior to stable <code className="docs-code-inline">data-*</code> attributes or IDs, never style class names.</li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">Adding components</h2>
      <Panel>
        <ul className="docs-list">
          <li>Components join through the source-driven track or the forward-looking track in the todo list; single-page business visuals stay in the page.</li>
          <li>Every new component adds a doc page under <code className="docs-code-inline">apps/docs/src/pages/components/</code> and registers in <code className="docs-code-inline">registry.ts</code>, with demos and a props table both required.</li>
          <li>Once a native app migration passes acceptance, clean up the old implementation per the migration plan; the library keeps its existing runtime during incubation.</li>
        </ul>
      </Panel>
    </div>
  );
}
