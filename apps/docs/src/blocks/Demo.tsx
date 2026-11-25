import { useState } from 'react';
import { Button, Desktop, IconButton, Panel, Tag, Workspace, cx, useDesktop, useMessages } from '@desk/ui';
import type { DemoSpec } from './types';
import { docsMessages } from '../site/locale';

/** 示例块：标题与说明、实时预览、可展开的代码。预览用库组件本身渲染，所见即所得。 */
export function Demo({ title, description, code, render, layout = 'row', stage }: DemoSpec) {
  const t = useMessages(docsMessages).docs.blocks;
  const desktop = useDesktop();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel flush>
      <div className="docs-demo-head">
        <h3 className="docs-demo-title">{title}</h3>
        {description && <p className="docs-demo-note">{description}</p>}
      </div>
      <div className={cx('docs-preview', layout === 'stack' && 'docs-preview--stack', (layout === 'frame' || layout === 'stage') && 'docs-preview--frame')}>
        {layout === 'frame' && <Workspace className="docs-frame">{render()}</Workspace>}
        {layout === 'stage' && (
          <Desktop className="docs-frame" {...stage} cardStyle={stage?.cardStyle ?? desktop.cardStyle}>
            {render()}
          </Desktop>
        )}
        {layout !== 'frame' && layout !== 'stage' && render()}
      </div>
      <div className="docs-demo-foot">
        <Button variant="quiet" size="sm" icon="component" pressed={showCode} onClick={() => setShowCode((v) => !v)}>
          {showCode ? t.collapseCode : t.expandCode}
        </Button>
        {showCode && <IconButton icon={copied ? 'check' : 'copy'} label={copied ? t.copied : t.copyCode} variant="quiet" onClick={copy} />}
        {copied && <Tag tone="success">{t.copied}</Tag>}
      </div>
      {showCode && (
        <pre className="docs-code" tabIndex={0} aria-label={t.codeAria(title)}>
          <code>{code}</code>
        </pre>
      )}
    </Panel>
  );
}
