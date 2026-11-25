import { useState } from 'react';
import { Button, Chip, Field, Inline, Stack, TagInput } from '@xyzos/desk-ui';

export function TagInputDemo() {
  const [result, setResult] = useState('尚未读取');
  return <Stack gap="lg">
    <form onSubmit={(event) => {
      event.preventDefault(); setResult(new FormData(event.currentTarget).getAll('tags').join('、'));
    }}>
      <Stack gap="md">
        <Field label="文章标签" hint="回车、逗号添加；可粘贴多项。最多 5 个，每项 12 个字符。">
          <TagInput name="tags" defaultValue={['组件库']} maxTags={5} maxTagLength={12} required />
        </Field>
        <Inline><Button type="submit">读取表单值</Button><Button type="reset">重置</Button></Inline>
        <span role="status">已确认值：{result}</span>
      </Stack>
    </form>
    <Field label="只读"><TagInput value={['界面', '组件']} readOnly /></Field>
    <Field label="禁用"><TagInput value={['不可编辑']} disabled /></Field>
  </Stack>;
}

export function ChipDemo() {
  const [items, setItems] = useState(['设计', '开发', '文档']);
  return <Stack gap="md">
    <Inline>{items.map((item) => <Chip key={item} onRemove={() => setItems(items.filter((value) => value !== item))}>{item}</Chip>)}
      <Chip disabled onRemove={() => {}}>禁用</Chip><Chip tone="success">只读状态</Chip>
    </Inline>
    <Button onClick={() => setItems(['设计', '开发', '文档'])}>恢复标签</Button>
  </Stack>;
}
