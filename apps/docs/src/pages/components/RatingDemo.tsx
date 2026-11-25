import { useState } from 'react';
import { Button, FormActions, Rating, Stack, Text } from '@xyzos/desk-ui';

export function RatingDemo() {
  const [result, setResult] = useState('尚未评分');
  return <Stack gap="xl">
    <form onSubmit={(event) => {
      event.preventDefault(); setResult(`已读取 ${new FormData(event.currentTarget).get('rating')} 分`);
    }}>
      <Stack gap="lg">
        <Rating label="体验评分" name="rating" required hint="选择分数后可用方向键切换，也可以清空后重新选择。" />
        <FormActions><Button type="reset">重置</Button><Button type="submit" variant="primary">读取评分</Button></FormActions>
        <Text tone="muted" role="status">{result}</Text>
      </Stack>
    </form>
    <Rating label="只读评分" value={4} readOnly />
    <Rating label="禁用评分" defaultValue={2} disabled />
  </Stack>;
}
