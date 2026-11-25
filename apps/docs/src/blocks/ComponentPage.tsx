import { Lead, Panel, Title, useMessages } from '@xyzos/desk-ui';
import { docText } from './docText';
import { Demo } from './Demo';
import { PropsTable } from './PropsTable';
import type { ComponentDoc } from './types';
import { docsMessages } from '../site/locale';
import { useLanguage } from '../site/LocaleProvider';

/** 组件文档页模板：概述 → 使用说明 → 示例 → 组件属性 → 无障碍。所有文档页共用，保证结构一致。 */
export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const t = useMessages(docsMessages).docs.blocks;
  const language = useLanguage();
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>{docText(doc.name, language.current)}</Title>
        <Lead>{docText(doc.summary, language.current)}</Lead>
      </header>

      <h2 className="docs-section-title">{t.usage}</h2>
      <Panel>
        <ul className="docs-list">{doc.usage.map((line) => <li key={line}>{line}</li>)}</ul>
      </Panel>

      <h2 className="docs-section-title">{t.demos}</h2>
      {doc.demos.map((demo) => <Demo key={demo.title} {...demo} />)}

      <h2 className="docs-section-title">{t.props}</h2>
      {doc.api.map((api) => <PropsTable key={api.component} {...api} />)}

      <h2 className="docs-section-title">{t.a11y}</h2>
      <Panel>
        <ul className="docs-list">{doc.a11y.map((line) => <li key={line}>{line}</li>)}</ul>
      </Panel>
    </div>
  );
}
