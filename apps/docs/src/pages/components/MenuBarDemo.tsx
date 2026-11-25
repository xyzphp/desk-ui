import { useId, useRef, useState } from 'react';
import { AppIcon, MenuBar, MenuBarApp, MenuBarClock, MenuBarIconButton, MenuBarLogo, MenuItem, MenuSeparator, Popover } from '@desk/ui';
import avatar from '../../assets/preview-lake.svg';

/** 本地交互演示，不调用真实锁屏或退出。 */
export function MenuBarDemo() {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<'first' | 'last'>('first');
  const [action, setAction] = useState('桌面');
  const anchor = useRef<HTMLButtonElement>(null);
  const id = useId();
  return <>
    <MenuBar left={<>
      <MenuBarLogo ref={anchor} aria-label="系统菜单" aria-haspopup="menu" aria-expanded={open}
        aria-controls={open ? id : undefined} active={open} avatar={avatar}
        onClick={() => { setFocus('first'); setOpen(!open); }}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
          event.preventDefault(); setFocus(event.key === 'ArrowUp' ? 'last' : 'first'); setOpen(true);
        }}><AppIcon icon="component" /></MenuBarLogo>
      <MenuBarApp>{action}</MenuBarApp>
    </>} right={<>
      <MenuBarIconButton icon="moon" label="切换主题" />
      <MenuBarIconButton icon="sliders-horizontal" label="控制中心" />
      <MenuBarClock date="11月7日 周六" time="14:30" />
    </>} />
    <Popover id={id} anchor={anchor} open={open} variant="system" initialFocus={focus}
      aria-label="系统菜单" onClose={() => setOpen(false)}>
      <MenuItem onClick={() => setAction('关于示例桌面')}>关于示例桌面</MenuItem>
      <MenuSeparator />
      <MenuItem onClick={() => setAction('系统设置')}>系统设置…</MenuItem>
      <MenuItem onClick={() => setAction('模拟锁定屏幕')}>锁定屏幕</MenuItem>
      <MenuSeparator />
      <MenuItem onClick={() => setAction('模拟退出登录')}>退出登录</MenuItem>
    </Popover>
  </>;
}
