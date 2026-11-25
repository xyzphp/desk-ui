import { useEffect, useState } from 'react';
import { Button, LockCountdown, Stack } from '@xyzos/desk-ui';

export function LockCountdownDemo() {
  const [seconds, setSeconds] = useState(0);
  const running = seconds > 0;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return (
    <Stack gap="sm">
      <Button disabled={running} onClick={() => setSeconds(30)}>
        开始演示
      </Button>
      {running && <LockCountdown seconds={seconds} onCancel={() => setSeconds(0)} />}
    </Stack>
  );
}
