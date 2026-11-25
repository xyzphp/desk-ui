import { useRef, useState } from 'react';
import { AnchorPopover, Button, DesktopNote, EmptyState, IconButton, SearchField, Stack } from '@desk/ui';

/** 图库浮层与正文分开，不请求或上传真实图片。 */
export function DesktopNoteGalleryDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const anchor = useRef<HTMLButtonElement>(null);
  return <div style={{ width: 'min(100%, 282px)', margin: 20 }}>
    <DesktopNote title="便签" defaultValue="写点什么，或添加图片…"
      leadingTools={<IconButton ref={anchor} icon="plus" variant="quiet" label="添加图片"
        aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} />}
      tools={<Button icon="sparkles" variant="quiet" size="sm">AI 优化</Button>} />
    <AnchorPopover open={open} anchor={anchor} onClose={() => setOpen(false)} role="dialog" aria-label="便签图库示例"
      style={{ width: 'min(560px, calc(100vw - 24px))' }}>
      <Stack gap="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ marginRight: 'auto' }}>便签图库（本地示例）</strong>
          <IconButton icon="x" variant="quiet" label="关闭图库" onClick={() => setOpen(false)} />
        </div>
        <SearchField label="搜索图片" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        <EmptyState>{query ? '没有匹配的图片' : '暂无可选图片'}</EmptyState>
      </Stack>
    </AnchorPopover>
  </div>;
}
