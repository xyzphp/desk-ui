import { useState } from 'react';
import { Combobox, Field, Grid, Stack, Text } from '@xyzos/desk-ui';

export function ComboboxDemo() {
  const [value, setValue] = useState('design');
  return <Stack gap="lg">
    <Field label="选择目录" hint="输入中文名称或英文关键字筛选，回车确认；输入草稿不会作为选中值提交。">
      <Combobox value={value} onValueChange={setValue}>
        <option value="" hidden />
        <optgroup label="工作目录">
          <option value="design" data-search-text="sheji design">设计资料</option>
          <option value="development" data-search-text="kaifa development">开发资料</option>
          <option value="documents" data-search-text="wendang docs">文档归档</option>
        </optgroup>
        <optgroup label="停用目录" disabled><option value="archive">旧版归档</option></optgroup>
      </Combobox>
    </Field>
    <Text tone="muted" role="status">已选值：{value || '未选择'}</Text>
    <Grid columns={2}>
      <Field label="加载中"><Combobox loading value="" onChange={() => {}}><option value="" hidden /></Combobox></Field>
      <Field label="空选项"><Combobox defaultValue=""><option value="" hidden /></Combobox></Field>
      <Field label="只读"><Combobox value="read" readOnly><option value="read">只读目录</option></Combobox></Field>
      <Field label="禁用"><Combobox value="off" disabled><option value="off">不可选择</option></Combobox></Field>
    </Grid>
  </Stack>;
}
