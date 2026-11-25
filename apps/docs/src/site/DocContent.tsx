import { Component, Suspense, type ReactNode } from 'react';
import { Button, Result, Spinner, useMessages } from '@desk/ui';
import { docsMessages } from './locale';

class DocErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <DocLoadError /> : (
      this.props.children
    );
  }
}

function DocLoadError() {
  const t = useMessages(docsMessages).docs.loading;
  return (
    <Result
      status="error"
      title={t.failedTitle}
      description={t.failedHint}
      actions={<Button onClick={() => location.reload()}>{t.reload}</Button>}
    />
  );
}

export function DocContent({ children }: { children: ReactNode }) {
  const t = useMessages(docsMessages).docs.loading;
  return (
    <DocErrorBoundary>
      <Suspense
        fallback={
          <div className="docs-page-loading" role="status">
            <Spinner />
            {t.pending}
          </div>
        }
      >
        {children}
      </Suspense>
    </DocErrorBoundary>
  );
}
