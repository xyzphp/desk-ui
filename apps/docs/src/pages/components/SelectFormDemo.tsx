import { useState } from 'react';
import { Button, Field, Notice, Select } from '@xyzos/desk-ui';

export function SelectFormDemo() {
  const [result, setResult] = useState('');
  return <form style={{ display: 'grid', gap: 12 }} onReset={() => setResult('')} onSubmit={(event) => {
    event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('language')));
  }}>
    <Field label="语言" required><Select name="language" defaultValue="" required>
      <option value="" disabled>请选择语言</option><option value="zh">中文</option><option value="en">英语</option>
    </Select></Field>
    <div style={{ display: 'flex', gap: 8 }}><Button type="submit" variant="primary">确认选择</Button><Button type="reset">重置</Button></div>
    {result && <Notice>已选择：{result}</Notice>}
  </form>;
}
