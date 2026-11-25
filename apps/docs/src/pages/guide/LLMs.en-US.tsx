import { CodeBlock, Lead, Link, Panel, Title } from '@xyzos/desk-ui';

export function LLMsEn() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>LLMs documentation</Title>
        <Lead>
          Quick-start instructions, categorized indexes, complete reference bundles, and per-component Markdown
          generated directly from the component docs and registry.
        </Lead>
      </header>

      <h2 className="docs-section-title">Available documents</h2>
      <Panel>
        <ul className="docs-list">
          <li>
            <code className="docs-code-inline">llms.en-US.txt</code>: concise English index with setup instructions,
            style import rules, theming/i18n notes, and categorized component links —{' '}
            <Link href="./llms.en-US.txt" target="_blank" rel="noopener noreferrer">
              open English index
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms-full.en-US.txt</code>: complete bundle with localized English titles
            (detailed usage notes follow their ComponentDoc source language) —{' '}
            <Link href="./llms-full.en-US.txt" target="_blank" rel="noopener noreferrer">
              open English full reference
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms.txt</code> &amp;{' '}
            <code className="docs-code-inline">llms-full.txt</code>: Chinese index and complete Chinese component
            reference —{' '}
            <Link href="./llms.txt" target="_blank" rel="noopener noreferrer">
              open Chinese index
            </Link>
            {' / '}
            <Link href="./llms-full.txt" target="_blank" rel="noopener noreferrer">
              open Chinese full reference
            </Link>
          </li>
          <li>
            <code className="docs-code-inline">llms/en-US/&lt;page id&gt;.md</code> &amp;{' '}
            <code className="docs-code-inline">llms/zh-CN/&lt;page id&gt;.md</code>: individual component Markdown pages
            for focused context, such as{' '}
            <Link href="./llms/en-US/button.md" target="_blank" rel="noopener noreferrer">
              Button (button.md)
            </Link>
            {' and '}
            <Link href="./llms/en-US/icon.md" target="_blank" rel="noopener noreferrer">
              Icons &amp; full icon list (icon.md)
            </Link>
            .
          </li>
        </ul>
      </Panel>

      <h2 className="docs-section-title">Prompt for AI tools</h2>
      <CodeBlock
        label="Prompt template"
        language="text"
        code={
          'Read llms.en-US.txt first for setup, stylesheet imports, and category links, then fetch only the needed llms/en-US/<page id>.md files.\n' +
          'Import components from @xyzos/desk-ui and import @xyzos/desk-ui/styles.css once in the app entry when using the published npm package.\n' +
          'Follow the documented component names, props, defaults, icon names, keyboard behavior, and accessibility notes; do not infer undocumented APIs.'
        }
      />

      <h2 className="docs-section-title">Source and recommendations</h2>
      <Panel>
        <ul className="docs-list">
          <li>
            All files are regenerated automatically during dev requests and production builds from{' '}
            <code className="docs-code-inline">registry.ts</code>, every{' '}
            <code className="docs-code-inline">ComponentDoc</code>, the icon registry, and package metadata — no
            duplicate API documentation needs manual upkeep.
          </li>
          <li>
            Prefer reading the index followed by individual Markdown pages to keep context compact; use the full bundle
            for offline ingestion or broad multi-component work.
          </li>
          <li>
            Components stay host-decoupled (no network requests or storage writes); provide data, permissions, and
            callbacks from the consuming application.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
