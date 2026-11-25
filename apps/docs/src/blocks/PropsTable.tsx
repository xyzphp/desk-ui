import { Panel, Table, useMessages, type TableColumn } from '@xyzos/desk-ui';
import type { ApiSpec, PropSpec } from './types';
import { docsMessages } from '../site/locale';

/** 属性表：直接使用库的 Table（wrap 模式）。 */
export function PropsTable({ component, props }: ApiSpec) {
  const t = useMessages(docsMessages).docs.blocks;
  const columns: TableColumn<PropSpec>[] = [
    { key: 'name', header: t.colName, width: '22%', render: (p) => <code className="docs-code-inline">{p.name}</code> },
    { key: 'type', header: t.colType, width: '30%', render: (p) => <code className="docs-code-inline">{p.type}</code> },
    { key: 'default', header: t.colDefault, width: '14%', render: (p) => (p.default ? <code className="docs-code-inline">{p.default}</code> : '—') },
    { key: 'description', header: t.colDescription },
  ];
  return (
    <Panel flush title={undefined}>
      <div className="docs-demo-head">
        <h3 className="docs-demo-title">{component}</h3>
      </div>
      <Table wrap caption={t.propsCaption(component)} columns={columns} rows={props} rowKey={(p) => p.name} />
    </Panel>
  );
}
