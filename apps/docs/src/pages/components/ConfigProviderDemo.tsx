import { useState } from 'react';
import { ConfigProvider, CopyButton, Field, InputNumber, PasswordInput, Select, Switch } from '@desk/ui';
import { copyText } from './CopyDemo';

export function ConfigProviderDemo() {
  const [custom, setCustom] = useState(true);
  return <div style={{ display: 'grid', gap: 16 }}>
    <Switch checked={custom} onCheckedChange={setCustom}>使用自定义文案</Switch>
    <ConfigProvider labels={custom ? {
      select: { placeholder: 'Choose an option', empty: 'No options' },
      inputNumber: { increase: 'Increase', decrease: 'Decrease' },
      passwordInput: { show: 'Show', hide: 'Hide' },
      copyButton: { copy: 'Copy', copying: 'Copying…', copied: 'Copied', failed: 'Copy failed' },
    } : undefined}>
      <Field label="选择器"><Select><option value="" hidden /></Select></Field>
      <Field label="数字"><InputNumber defaultValue={2} /></Field>
      <Field label="显隐"><PasswordInput /></Field>
      <CopyButton text="example" onCopy={copyText} />
      <ConfigProvider labels={{ passwordInput: { show: '查看此项' } }}>
        <Field label="嵌套覆盖"><PasswordInput /></Field>
      </ConfigProvider>
      <Field label="组件覆盖"><PasswordInput labels={{ show: '本项显示', hide: '本项隐藏' }} /></Field>
    </ConfigProvider>
  </div>;
}
