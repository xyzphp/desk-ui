import { useEffect, useRef, useState } from 'react';
import { Desktop, LockScreen, Stack, Text } from '@xyzos/desk-ui';

export function LockScreenDemo({ requiresPassword }: { requiresPassword: boolean }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [result, setResult] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined), attempts = useRef(0), screen = useRef<HTMLElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <Stack gap="lg">
    <Desktop wallpaper={requiresPassword ? 'sequoia' : 'aurora'} style={{ height: 640 }}>
      <LockScreen ref={screen} label="锁屏示例" name="示例用户" time="15:42" date="11月5日 星期四" dateTime="15:42"
        busy={busy} error={error} requiresPassword={requiresPassword}
        onUnlock={(event) => {
          event.currentTarget.reset(); setBusy(true); setError(''); setResult(''); attempts.current++;
          timer.current = setTimeout(() => {
            setBusy(false);
            if (requiresPassword && attempts.current === 1) setError('示例模拟验证失败，请再次尝试。');
            else setResult('已触发示例解锁回调');
          }, 700);
        }} onSignOut={() => {
          screen.current?.querySelector('form')?.reset(); setError(''); setResult('已触发示例退出回调');
        }} />
    </Desktop>
    {result && <Text tone="muted" role="status">{result}</Text>}
  </Stack>;
}
