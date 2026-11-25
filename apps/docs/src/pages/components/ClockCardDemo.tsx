import { useEffect, useState } from 'react';
import { ClockCard, DesktopCardToolbar, Button, Field, Select, Switch, clockZoneInfo } from '@xyzos/desk-ui';

export function ClockCardDemo() {
  const [now, setNow] = useState(() => Date.now());
  const [zone, setZone] = useState('Asia/Shanghai');
  const [seconds, setSeconds] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible') setNow(Date.now()); }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 12, padding: 20, width: 'min(100%, 390px)' }}>
    <Field label="时区"><Select value={zone} onChange={(event) => setZone(event.currentTarget.value)}>
      <option value="Asia/Shanghai">上海</option><option value="Europe/London">伦敦</option><option value="America/New_York">纽约</option>
    </Select></Field>
    <Switch checked={seconds} onCheckedChange={setSeconds}>显示秒钟</Switch>
    <DesktopCardToolbar title="桌面卡片"><Button size="sm">全部折叠</Button><Button size="sm" icon="panel-right-close">收起</Button></DesktopCardToolbar>
    <ClockCard title={clockZoneInfo(zone, new Date(now)).label} now={now} timeZone={zone} showSeconds={seconds} />
  </div>;
}
