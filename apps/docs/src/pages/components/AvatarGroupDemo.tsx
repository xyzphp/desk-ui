import { useState } from 'react';
import { AvatarGroup, Field, Range, Stack, type AvatarGroupItem } from '@xyzos/desk-ui';
import coast from '../../assets/preview-coast.svg';

const items: readonly AvatarGroupItem[] = [
  { id: 'one', name: '林一', src: coast }, { id: 'two', name: '陈二' }, { id: 'three', name: '王三', tone: 'success' },
  { id: 'four', name: '李四' }, { id: 'five', name: '赵五', tone: 'warning' }, { id: 'six', name: '周六' },
];
export function AvatarGroupDemo() {
  const [max, setMax] = useState(3);
  return <Stack gap="lg">
    <Field label={`可见人数：${max}`}><Range min={0} max={6} step={1} value={max} onValueChange={setMax} /></Field>
    <AvatarGroup label="协作成员" items={items} max={max} />
    <AvatarGroup label="圆角头像" items={items.slice(0, 3)} shape="rounded" size="sm" />
    <AvatarGroup label="空成员" items={[]} />
  </Stack>;
}
