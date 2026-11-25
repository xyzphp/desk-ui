import { useState } from 'react';
import { Checkbox, FieldAddon, Input, Select, Stack } from '@xyzos/desk-ui';

export function FieldAddonDemo() {
  const [usage, setUsage] = useState('deleted-at');
  const [softDelete, setSoftDelete] = useState(true);
  return <Stack gap="lg">
    <FieldAddon
      addon={usage === 'deleted-at' && (
        <Checkbox checked={softDelete} onChange={(event) => setSoftDelete(event.currentTarget.checked)}>软删除</Checkbox>
      )}
    >
      <Select aria-label="系统用途" value={usage} onChange={(event) => {
        setUsage(event.currentTarget.value);
        if (event.currentTarget.value !== 'deleted-at') setSoftDelete(false);
      }}>
        <option value="">普通字段</option>
        <option value="created-at">创建时间</option>
        <option value="deleted-at">删除时间</option>
      </Select>
    </FieldAddon>
    <FieldAddon addon={<span>个字符</span>}>
      <Input type="number" min={0} aria-label="最多字符" defaultValue={255} />
    </FieldAddon>
  </Stack>;
}
