import { useState } from 'react';
import { Button, CheckboxGroup, FormActions, Stack, Text, type CheckboxOption } from '@desk/ui';

const options: readonly CheckboxOption[] = [
  { value: 'mail', label: '邮件通知' }, { value: 'site', label: '站内通知' },
  { value: 'legacy', label: '旧渠道（停用）', disabled: true },
];
export function CheckboxGroupDemo() {
  const [result, setResult] = useState('尚未读取');
  return <Stack gap="lg">
    <form onSubmit={(event) => {
      event.preventDefault(); setResult(new FormData(event.currentTarget).getAll('channels').join('、'));
    }}>
      <Stack gap="lg">
        <CheckboxGroup label="通知渠道" name="channels" options={options} defaultValue={['mail', 'legacy']} required
          hint="至少选择一个可用渠道，停用项按原生表单规则排除。" />
        <FormActions><Button type="reset">重置</Button><Button type="submit" variant="primary">读取表单</Button></FormActions>
        <Text tone="muted" role="status">已提交：{result}</Text>
      </Stack>
    </form>
    <CheckboxGroup label="只读渠道" options={options} value={['site']} readOnly direction="vertical" />
    <CheckboxGroup label="汇总状态" options={[{ value: 'summary', label: '部分完成', indeterminate: true }]} value={[]} readOnly
      hint="半选仅由宿主提供，不自动计算父子关系。" />
    <CheckboxGroup label="空目录" options={[]} />
  </Stack>;
}
