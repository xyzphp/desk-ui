import { useRef, useState } from 'react';
import { AnchorPopover, Button, Field, Input } from '@xyzos/desk-ui';

export function AnchorPopoverDemo() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button ref={anchor} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        编辑筛选
      </Button>
      <AnchorPopover
        as="section"
        open={open}
        anchor={anchor}
        role="dialog"
        aria-label="筛选条件"
        onClose={() => setOpen(false)}
      >
        <Field label="名称">
          <Input placeholder="输入关键词" />
        </Field>
        <Button onClick={() => setOpen(false)}>完成</Button>
      </AnchorPopover>
    </>
  );
}
