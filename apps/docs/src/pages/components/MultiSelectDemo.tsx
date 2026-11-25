import { useState } from 'react';
import { Button, Field, Inline, MultiSelect, Stack, Text } from '@desk/ui';

export function MultiSelectDemo() {
  const [result, setResult] = useState('尚未读取');
  return <form onSubmit={(event) => {
    event.preventDefault(); setResult(new FormData(event.currentTarget).getAll('topics').join('、') || '未选择');
  }}>
    <Stack gap="lg">
      <Field label="关注主题" hint="支持搜索，选中项留在面板中；停用的已选项不能移除。">
        <MultiSelect name="topics" defaultValue={['design', 'docs', 'fixed']} maxVisibleTags={2} required>
          <optgroup label="可选主题">
            <option value="design">界面设计</option><option value="development">组件开发</option>
            <option value="docs">文档维护</option><option value="accessibility">无障碍</option>
          </optgroup>
          <optgroup label="已停用" disabled><option value="fixed">历史主题</option></optgroup>
        </MultiSelect>
      </Field>
      <Inline><Button type="submit">读取表单值</Button><Button type="reset">重置选择</Button></Inline>
      <Text tone="muted" role="status">表单值：{result}</Text>
      <Field label="禁用多选"><MultiSelect value={['fixed']} disabled><option value="fixed">不可编辑</option></MultiSelect></Field>
    </Stack>
  </form>;
}
