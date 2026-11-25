import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';

/** 仅展示键帽，不注册快捷键。组合键由宿主按平台和实际行为提供。 */
export type KbdProps = ComponentProps<'kbd'>;
export function Kbd({ className, ...rest }: KbdProps) {
  return <kbd {...rest} className={cx('ds-kbd', className)} />;
}
