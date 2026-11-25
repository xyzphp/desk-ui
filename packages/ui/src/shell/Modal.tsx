import type { ReactNode, Ref, RefObject } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { DialogSurface } from './DialogSurface';
export interface ModalLabels {
  close: string;
}

export interface ModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onCancel?: () => void;
  busy?: boolean;
  closeOnBackdrop?: boolean;
  closable?: boolean;
  /** 开启后可在系统标题栏上按住拖动移动弹层。 */
  draggable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  initialFocus?: RefObject<HTMLElement | null>;
  /** 特例内容可接管首次聚焦；不负责打开、关闭或焦点返回。 */
  onOpenFocus?: () => void;
  /** 保留原有 dialog 内部结构；调用方负责标题 ID、表单禁用与源样式。 */
  renderNative?: (context: { titleId: string; descriptionId: string; busy: boolean }) => ReactNode;
  role?: 'dialog' | 'alertdialog';
  labels?: Partial<ModalLabels>;
  className?: string;
  ref?: Ref<HTMLDialogElement>;
}

/** 通用模态内容，原生生命周期与 Drawer 共用 DialogSurface。 */
export function Modal({ labels: overrides, ...rest }: ModalProps) {
  const labels = useLabels('modal', overrides);
  return <DialogSurface {...rest} labels={labels} />;
}
