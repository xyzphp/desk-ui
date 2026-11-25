import { useLabels } from '../foundation/ConfigProvider';
import { DialogSurface } from './DialogSurface';
import type { ModalProps } from './Modal';

export interface DrawerProps extends ModalProps { placement?: 'left' | 'right' | 'top' | 'bottom' }

/** 详情抽屉；默认点击背景可取消，忙碌时沿用模态层的禁止取消与原生控件禁用。 */
export function Drawer({ placement = 'right', labels: overrides, closeOnBackdrop = true, ...rest }: DrawerProps) {
  const labels = useLabels('drawer', overrides);
  return <DialogSurface {...rest} labels={labels} placement={placement} closeOnBackdrop={closeOnBackdrop} variant="drawer" />;
}
