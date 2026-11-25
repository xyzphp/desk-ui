import { useState } from 'react';
import { DropdownMenu, MenuItem, MenuSeparator, Stack, Text } from '@xyzos/desk-ui';

export function DropdownMenuDemo() {
  const [action, setAction] = useState('尚未执行');
  return <Stack gap="lg" align="start">
    <DropdownMenu label="更多操作" icon="settings">
      <MenuItem icon="pencil" onClick={() => setAction('重命名')}>重命名</MenuItem>
      <MenuItem icon="copy" onClick={() => setAction('复制副本')}>复制副本</MenuItem>
      <MenuItem disabled>移动到归档</MenuItem>
      <MenuSeparator />
      <MenuItem onClick={(event) => { event.preventDefault(); setAction('已刷新，菜单保持打开'); }}>刷新并保留菜单</MenuItem>
    </DropdownMenu>
    <Text tone="muted" role="status">操作：{action}</Text>
    <DropdownMenu label="禁用操作" disabled><MenuItem>不可执行</MenuItem></DropdownMenu>
  </Stack>;
}
