import { useState } from 'react';
import { Button, Field, Input, InputGroup, InputGroupAddon, Select, Stack } from '@xyzos/desk-ui';

export function InputGroupDemo() {
  const [entryPath, setEntryPath] = useState('/_entry/a1b2c3d4e5');
  const [protocol, setProtocol] = useState('https');
  const [host, setHost] = useState('portal.example.com');
  const [status, setStatus] = useState('');

  return (
    <Stack gap="lg">
      <Field label="访问入口路径" hint={status || undefined}>
        <InputGroup>
          <Input
            value={entryPath}
            aria-label="访问入口路径"
            onChange={(event) => {
              setEntryPath(event.currentTarget.value);
              setStatus('');
            }}
          />
          <Button
            type="button"
            icon="refresh-cw"
            onClick={() => {
              const suffix = Math.random().toString(16).slice(2, 12);
              setEntryPath(`/_entry/${suffix}`);
              setStatus('已生成新的随机路径');
            }}
          >
            随机生成
          </Button>
          <Button type="button" icon="save" variant="primary" onClick={() => setStatus(`已保存：${entryPath}`)}>
            保存入口
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
