import { useState } from 'react';
import { Button, ColorPicker, Field, FormActions, Grid, Stack, Text, type ColorPreset } from '@desk/ui';

const presets: readonly ColorPreset[] = [
  { value: '#0a84ff', label: '蓝色' }, { value: '#198455', label: '绿色' },
  { value: '#ae781d', label: '橙色' }, { value: '#d0444a', label: '红色' },
];
export function ColorPickerDemo() {
  const [result, setResult] = useState('尚未读取');
  return <Stack gap="lg">
    <form onSubmit={(event) => { event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('color'))); }}>
      <Stack gap="lg">
        <Field label="强调颜色" required hint="输入 #RGB 或 #RRGGBB，失焦后规范为六位小写 HEX。">
          <ColorPicker name="color" defaultValue="#0a84ff" presets={presets} required />
        </Field>
        <FormActions><Button type="reset">重置</Button><Button type="submit" variant="primary">读取颜色</Button></FormActions>
        <Text tone="muted" role="status">表单颜色：{result}</Text>
      </Stack>
    </form>
    <Grid columns={2}>
      <Field label="只读颜色"><ColorPicker value="#198455" readOnly presets={presets} /></Field>
      <Field label="禁用颜色"><ColorPicker value="#d0444a" disabled /></Field>
    </Grid>
  </Stack>;
}
