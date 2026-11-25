import { useState } from 'react';
import { Grid, Inline, Stack, StatCard, Statistic, Switch } from '@xyzos/desk-ui';

export function StatisticDemo() {
  return <Inline gap="xxl" align="start">
    <Statistic label="总量" value={1248} format={(value) => Number(value).toLocaleString('zh-CN')} suffix="条" />
    <Statistic label="余额" value={0} format={(value) => Number(value).toFixed(2)} prefix="¥" />
    <Statistic label="尚无数据" value={null} description="等待首次同步" />
  </Inline>;
}

export function StatCardDemo() {
  const [loading, setLoading] = useState(false);
  return <Stack>
    <Switch checked={loading} onCheckedChange={setLoading}>演示加载状态</Switch>
    <Grid minItemWidth={180}>
      <StatCard label="已完成" value={80} icon="circle-check" loading={loading} trend={{ direction: 'up', label: '较昨天增加 8 项', tone: 'success' }} />
      <StatCard label="待处理" value={12} icon="file-text" description="当前项目" trend={{ direction: 'down', label: '较昨天减少 2 项', tone: 'muted' }} />
      <StatCard label="处理中" value={0} icon="clock-3" description="当前没有正在处理的任务" />
    </Grid>
  </Stack>;
}
