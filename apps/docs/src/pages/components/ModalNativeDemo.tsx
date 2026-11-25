import { useRef, useState } from 'react';
import { Button, Field, Inline, Input, Modal, Stack, WindowTitlebar } from '@xyzos/desk-ui';

export function ModalNativeDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('待审核');
  const field = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开原生结构表单</Button>
      <Modal
        open={open}
        title="状态设置"
        initialFocus={field}
        onCancel={() => setOpen(false)}
        className="ds-modal ds-modal--sm"
        renderNative={({ titleId, busy }) => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
            }}
          >
            <WindowTitlebar
              as="header"
              titleId={titleId}
              title="状态设置"
              controls={['close']}
              onClose={() => setOpen(false)}
            />
            <fieldset disabled={busy} style={{ border: 0, margin: 0, padding: 20 }}>
              <Stack gap="lg">
                <Field label="状态名称">
                  <Input ref={field} value={name} onChange={(event) => setName(event.currentTarget.value)} />
                </Field>
                <Inline gap="sm">
                  <Button type="button" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" variant="primary">
                    保存
                  </Button>
                </Inline>
              </Stack>
            </fieldset>
          </form>
        )}
      />
    </>
  );
}
