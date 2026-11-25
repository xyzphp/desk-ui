import { Button, Grid, Inline, Panel, Stack, Text } from '@xyzos/desk-ui';

export function StackDemo() {
  return <Stack gap="lg"><Panel title="第一段"><Text>标题与正文按公共间距纵向排列。</Text></Panel>
    <Panel title="第二段"><Text>嵌套区域也可以单独选择间距。</Text></Panel></Stack>;
}
export function InlineDemo() {
  return <Inline gap="sm" justify="between"><Text>选择操作</Text>
    <Inline gap="sm"><Button variant="quiet">取消</Button><Button variant="primary">保存</Button></Inline>
  </Inline>;
}
export function GridDemo() {
  return <Stack gap="lg">
    <Grid columns={3}>{['第一列', '第二列', '第三列'].map((title) => <Panel key={title} title={title}>随容器宽度调整。</Panel>)}</Grid>
    <Grid minItemWidth={180} gap="sm">{['A', 'B', 'C', 'D'].map((title) => <Panel key={title} title={title}>按最小项宽自动分列。</Panel>)}</Grid>
  </Stack>;
}
