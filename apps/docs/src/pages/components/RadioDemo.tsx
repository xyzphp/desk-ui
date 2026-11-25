import { useState } from 'react';
import { Button, Radio, RadioGroup } from '@desk/ui';

export function RadioDemo() {
  const [result, setResult] = useState('尚未提交');
  return <form onSubmit={(event) => {
    event.preventDefault();
    setResult(String(new FormData(event.currentTarget).get('visibility')));
  }}>
    <Radio name="visibility" value="private" defaultChecked>私有</Radio>{' '}
    <Radio name="visibility" value="public">公开</Radio>{' '}
    <Radio name="visibility" value="restricted" disabled>受限（不可用）</Radio>
    <p><Button type="submit">读取表单值</Button>{' '}<Button type="reset">重置</Button></p>
    <p role="status">表单值：{result}</p>
  </form>;
}

export function RadioGroupDemo() {
  const [selected, setSelected] = useState('transfer');
  return <form>
    <RadioGroup label="处理方式" name="action" defaultValue="transfer" onValueChange={setSelected} direction="vertical">
      <Radio value="transfer">转移内容</Radio>
      <Radio value="keep">保留内容</Radio>
      <Radio value="delete" disabled>删除内容（当前不可用）</Radio>
    </RadioGroup>
    <p><Button type="reset">重置选择</Button></p>
    <p role="status">当前值：{selected}</p>
  </form>;
}
