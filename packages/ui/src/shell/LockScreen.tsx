import { useId, useImperativeHandle, useRef, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useBusyFocus } from '../foundation/useBusyFocus';
import { Avatar, type AvatarProps } from '../primitives/Display';
import { Button } from '../primitives/Button';
import { PasswordInput } from '../primitives/PasswordInput';

export interface LockScreenLabels {
  locked: string;
  unlock: string;
  busy: string;
  signOut: string;
  password: string;
  passwordPlaceholder: string;
}
export interface LockScreenProps extends Omit<ComponentProps<'section'>, 'children' | 'onSubmit'> {
  label: string;
  name: string;
  time: string;
  date?: string;
  dateTime?: string;
  avatar?: Pick<AvatarProps, 'src' | 'fallback' | 'icon' | 'tone' | 'onImageError'>;
  requiresPassword?: boolean;
  unlockFields?: ReactNode;
  onUnlock: (event: FormEvent<HTMLFormElement>) => void;
  onSignOut?: () => void;
  busy?: boolean;
  error?: ReactNode;
  labels?: Partial<LockScreenLabels>;
}
/** 壁纸上的锁屏界面；真实锁定、凭据验证及内容清理由宿主处理。 */
export function LockScreen({ label, name, time, date, dateTime, avatar, requiresPassword, unlockFields, onUnlock, onSignOut,
  busy, error, labels: overrides, className, ref, ...rest }: LockScreenProps) {
  const root = useRef<HTMLElement>(null), id = useId();
  const labels = useLabels('lockScreen', overrides);
  const description = [rest['aria-describedby'], `${id}-state`].filter(Boolean).join(' ');
  const fields = unlockFields ?? (requiresPassword ? <PasswordInput
    className="ds-lock-password" name="password" aria-label={labels.password} placeholder={labels.passwordPlaceholder}
    autoComplete="off" maxLength={72} required disabled={busy}
  /> : null);
  useImperativeHandle(ref, () => root.current!, []);
  useBusyFocus(root, true, !!busy, () => root.current?.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled)')?.focus());
  return <section {...rest} ref={root} tabIndex={rest.tabIndex ?? -1} className={cx('ds-lock-screen', className)}
    aria-label={label} aria-describedby={description}>
    <span id={`${id}-state`} className="ds-visually-hidden">{labels.locked}</span>
    <div className="ds-lock-panel">
      <header className="ds-lock-clock">{date && <p>{date}</p>}<time dateTime={dateTime}>{time}</time></header>
      <div className="ds-lock-account">
        <Avatar {...avatar} className="ds-lock-avatar" name={name} size={76} decorative />
        {name && <h2>{name}</h2>}
        <form aria-label={labels.unlock} aria-busy={busy || undefined} aria-describedby={error ? `${id}-error` : undefined}
          onSubmit={(event) => { event.preventDefault(); if (!busy) onUnlock(event); }}>
          <fieldset className="ds-lock-fields" disabled={busy}>
            {fields != null && <div className="ds-lock-fields-body" inert={busy || undefined}>{fields}</div>}
            <Button className="ds-lock-unlock" type="submit">{busy ? labels.busy : labels.unlock}</Button>
            <div className="ds-lock-status" id={`${id}-error`} role={error ? 'alert' : undefined}>{error}</div>
          </fieldset>
        </form>
        {onSignOut && <Button className="ds-lock-signout" disabled={busy} onClick={onSignOut}>{labels.signOut}</Button>}
      </div>
    </div>
  </section>;
}
