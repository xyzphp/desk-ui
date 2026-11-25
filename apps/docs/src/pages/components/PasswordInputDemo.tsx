import { Button, Input, Panel, PasswordInput, Switch } from '@xyzos/desk-ui';
import { useState, type ReactNode } from 'react';

function PasswordRow({
  label,
  id,
  children,
  first = false,
}: {
  label: string;
  id: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '124px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 8,
        minHeight: 62,
        padding: '10px 12px',
        borderTop: first ? undefined : '1px solid var(--border)',
      }}
    >
      <label htmlFor={id} style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function PasswordInputDemo() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Panel muted style={{ gap: 14 }}>
        <strong>更新登录密码</strong>
        <div
          style={{
            overflow: 'hidden',
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'var(--bg-panel)',
          }}
        >
          <PasswordRow label="当前密码" id="password-demo-current" first>
            <PasswordInput
              id="password-demo-current"
              autoComplete="current-password"
              placeholder="输入当前密码"
              disabled={disabled}
            />
          </PasswordRow>
          <PasswordRow label="新密码" id="password-demo-new">
            <PasswordInput
              id="password-demo-new"
              autoComplete="new-password"
              placeholder="输入新密码（至少 8 位）"
              disabled={disabled}
            />
          </PasswordRow>
          <PasswordRow label="确认新密码" id="password-demo-confirm">
            <PasswordInput
              id="password-demo-confirm"
              autoComplete="new-password"
              placeholder="再次输入新密码"
              disabled={disabled}
            />
          </PasswordRow>
          <PasswordRow label="验证码" id="password-demo-captcha">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span
                aria-label="验证码示例：2 加 17 等于多少"
                style={{
                  display: 'grid',
                  flex: '0 0 184px',
                  height: 38,
                  placeItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--accent)',
                  fontFamily: 'serif',
                  fontSize: 20,
                }}
              >
                2 + 17 = ?
              </span>
              <Input
                id="password-demo-captcha"
                inputMode="numeric"
                placeholder="计算结果"
                disabled={disabled}
                style={{ flex: '1 1 auto', width: 0, minWidth: 110 }}
              />
            </div>
          </PasswordRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon="key-round" variant="primary" disabled={disabled}>
            保存新密码
          </Button>
        </div>
      </Panel>
      <Switch checked={disabled} onCheckedChange={setDisabled}>
        禁用密码输入
      </Switch>
      <PasswordInput aria-label="已有凭据" autoComplete="new-password" placeholder="留空保留已保存的内容" />
      <PasswordInput aria-label="禁止显隐" revealable={false} autoComplete="new-password" />
    </div>
  );
}
