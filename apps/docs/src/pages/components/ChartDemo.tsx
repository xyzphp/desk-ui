import { useState } from 'react';
import { Chart, Grid, Inline, Panel, Switch, type ChartType } from '@xyzos/desk-ui';

const data = [
  { key: 'jan', label: '一月', value: 42, displayValue: '42' },
  { key: 'feb', label: '二月', value: 58, displayValue: '58' },
  { key: 'mar', label: '三月', value: 36, displayValue: '36' },
  { key: 'apr', label: '四月', value: 72, displayValue: '72' },
  { key: 'may', label: '五月', value: 64, displayValue: '64' },
];

const types: ChartType[] = ['bar', 'line', 'pie', 'number'];

export function ChartDemo() {
  const [labels, setLabels] = useState(true);
  const [selected, setSelected] = useState('');
  return (
    <div className="ds-chart-demo">
      <Inline>
        <Switch checked={labels} onCheckedChange={setLabels}>
          显示数据标签
        </Switch>
        {selected && <span role="status">已选中：{selected}</span>}
      </Inline>
      <Grid minItemWidth={280}>
        {types.map((type) => (
          <Panel key={type}>
            <Chart
              type={type}
              title={{ bar: '柱状图', line: '折线图', pie: '饼图', number: '指标卡' }[type]}
              metricLabel="访问次数"
              data={type === 'number' ? [{ ...data[0]!, displayValue: '1,248 次' }] : data}
              labels={labels}
              palette={type === 'pie' ? 'blue' : 'theme'}
              onSelect={(point) => setSelected(point.label)}
            />
          </Panel>
        ))}
      </Grid>
    </div>
  );
}
