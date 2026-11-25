import { useState } from 'react';
import { Button, Divider, IconButton, Inline, PasswordInput, Select, SettingsRow, Stack, Switch } from '@desk/ui';

export function LockSettingsDemo() {
  const [enabled, setEnabled] = useState(true);
  const [minutes, setMinutes] = useState('15');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState('');
  return (
    <SettingsRow
      label="锁屏设置"
      layout="stacked"
      actions={
        <>
          <IconButton
            icon="rotate-ccw"
            label="重置示例"
            onClick={() => {
              setEnabled(true);
              setMinutes('15');
              setPassword('');
              setSaved('');
            }}
          />
          <Button
            icon="save"
            variant="primary"
            size="sm"
            onClick={() =>
              setSaved(enabled ? (minutes === '0' ? '仅手动锁屏' : `${minutes} 分钟未操作后锁屏`) : '已关闭锁屏')
            }
          >
            保存示例
          </Button>
        </>
      }
    >
      <Stack gap="sm">
        <Divider />
        <Inline justify="between">
          <span>启用锁屏</span>
          <Switch aria-label="启用锁屏" checked={enabled} onCheckedChange={setEnabled}>
            {null}
          </Switch>
        </Inline>
        {enabled && (
          <>
            <Divider />
            <Inline>
              <span style={{ width: 112 }}>自动锁屏</span>
              <div style={{ flex: '1 1 170px', minWidth: 0 }}>
                <Select
                  aria-label="自动锁屏"
                  value={minutes}
                  onChange={(event) => setMinutes(event.currentTarget.value)}
                >
                  <option value="0">从不</option>
                  {[1, 5, 10, 15, 30, 60].map((value) => (
                    <option key={value} value={value}>
                      {value} 分钟未操作
                    </option>
                  ))}
                </Select>
              </div>
            </Inline>
            <Divider />
            <Inline>
              <span style={{ width: 112 }}>锁屏密码</span>
              <PasswordInput
                aria-label="锁屏密码"
                placeholder="可选，点击解锁"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                style={{ flex: '1 1 170px' }}
              />
            </Inline>
          </>
        )}
        {saved && <span role="status">{saved}</span>}
      </Stack>
    </SettingsRow>
  );
}
