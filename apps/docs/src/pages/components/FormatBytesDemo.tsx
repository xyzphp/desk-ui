import { useState } from 'react';
import { Field, formatBytes, Grid, InputNumber, Select, Stack, StatCard } from '@xyzos/desk-ui';

export function FormatBytesDemo() {
  const [bytes, setBytes] = useState<number | null>(2097152), [base, setBase] = useState<1000 | 1024>(1024);
  return <Stack gap="lg">
    <Grid columns={2}>
      <Field label="字节数"><InputNumber value={bytes} onValueChange={setBytes} min={0} step={1024} /></Field>
      <Field label="单位基数"><Select value={String(base)} onChange={(event) => setBase(Number(event.currentTarget.value) as 1000 | 1024)}>
        <option value="1024">1024（原系统）</option><option value="1000">1000（十进制）</option>
      </Select></Field>
    </Grid>
    <Grid columns={2}>
      <StatCard label="文件大小" value={formatBytes(bytes, { base, locale: 'zh-CN' })} />
      <StatCard label="自定义单位" value={formatBytes(bytes, { base: 1024, units: ['字节', 'KiB', 'MiB', 'GiB'], locale: 'zh-CN' })} />
    </Grid>
  </Stack>;
}
