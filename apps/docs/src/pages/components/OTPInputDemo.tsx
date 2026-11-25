import { useState } from 'react';
import { Button, Field, FormActions, OTPInput, Stack, Text } from '@desk/ui';

export function OTPInputDemo() {
  const [result, setResult] = useState('尚未读取');
  return <Stack gap="xl">
    <form onSubmit={(event) => {
      event.preventDefault(); const code = String(new FormData(event.currentTarget).get('code') ?? '');
      setResult(`已读取 ${code.length} 位数字，示例不进行验证请求`);
    }}>
      <Stack gap="lg">
        <Field label="六位验证码" required hint="支持粘贴、数字自动填充、方向键定位和退格；不会自动提交。">
          <OTPInput name="code" required />
        </Field>
        <FormActions><Button type="reset">清空</Button><Button type="submit" variant="primary">读取验证码</Button></FormActions>
        <Text tone="muted" role="status">{result}</Text>
      </Stack>
    </form>
    <Field label="四位只读示例"><OTPInput length={4} value="1234" readOnly /></Field>
    <Field label="禁用输入"><OTPInput disabled /></Field>
  </Stack>;
}
