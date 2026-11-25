import { useState } from 'react';
import { Button, Field, Input, InputGroup, InputGroupAddon, Select, Stack } from '@xyzos/desk-ui';

function randomCode() {
  const text = Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, '0');
  return `${text.slice(0, 4)}-${text.slice(4)}`;
}

export function InputGroupDemo() {
  const [inviteCode, setInviteCode] = useState('A1B2-C3D4');
  const [protocol, setProtocol] = useState('https');
  const [host, setHost] = useState('portal.example.com');
  const [status, setStatus] = useState('');

  return (
    <Stack gap="lg">
      <Field label="邀请码" hint={status || undefined}>
        <InputGroup>
          <Input
            value={inviteCode}
            aria-label="邀请码"
            onChange={(event) => {
              setInviteCode(event.currentTarget.value);
              setStatus('');
            }}
          />
          <Button
            type="button"
            icon="refresh-cw"
            onClick={() => {
              setInviteCode(randomCode());
              setStatus('已生成新的邀请码');
            }}
          >
            重新生成
          </Button>
          <Button type="button" icon="save" variant="primary" onClick={() => setStatus(`已应用：${inviteCode}`)}>
            应用
          </Button>
        </InputGroup>
      </Field>

      <Field label="自定义子域名">
        <InputGroup>
          <InputGroupAddon>https://</InputGroupAddon>
          <Input aria-label="子域名" defaultValue="docs" />
          <InputGroupAddon>.example.com</InputGroupAddon>
        </InputGroup>
      </Field>

      <Field label="服务地址">
        <InputGroup>
          <Select aria-label="协议" value={protocol} onChange={(event) => setProtocol(event.currentTarget.value)}>
            <option value="https">https://</option>
            <option value="http">http://</option>
          </Select>
          <Input aria-label="主机地址" value={host} onChange={(event) => setHost(event.currentTarget.value)} />
          <Button type="button" onClick={() => setStatus(`测试目标：${protocol}://${host}`)}>
            测试连接
          </Button>
        </InputGroup>
      </Field>
    </Stack>
  );
}
