import { useState } from 'react';
import { Button, Field, InputNumber } from '@xyzos/desk-ui';

export function InputNumberDemo() {
  const [amount, setAmount] = useState<number | null>(0.25);
  const [result, setResult] = useState('尚未提交');
  return <div style={{ display: 'grid', gap: 16 }}>
    <Field label="小数步进" hint="0–10，步长 0.25，精度 2 位；清空与 0 分开。">
      <InputNumber value={amount} onValueChange={setAmount} min={0} max={10} step={0.25} precision={2} />
    </Field>
    <div><Button onClick={() => setAmount(null)}>清空</Button>{' '}当前值：{amount ?? '空'}</div>
    <form onSubmit={(event) => {
      event.preventDefault();
      setResult(String(new FormData(event.currentTarget).get('port')));
    }}>
      <Field label="端口" hint="原生 required、范围和表单重置。">
        <InputNumber name="port" defaultValue={587} min={1} max={65535} required />
      </Field>
      <p><Button type="submit">读取表单值</Button>{' '}<Button type="reset">重置端口</Button></p>
      <p role="status">表单值：{result}</p>
    </form>
    <Field label="只读"><InputNumber value={8} readOnly /></Field>
    <Field label="禁用"><InputNumber value={8} disabled /></Field>
  </div>;
}
