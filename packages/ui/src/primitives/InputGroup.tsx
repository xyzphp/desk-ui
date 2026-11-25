import { type ComponentProps } from 'react';
import { cx } from '../foundation/cx';

export interface InputGroupProps extends ComponentProps<'div'> {
  /** 是否默认撑满父容器整行宽度，关闭后按内容宽度收缩。 */
  block?: boolean;
  /** 窄容器下是否自动换行并恢复各子项独立圆角，默认开启。 */
  responsive?: boolean;
}

/** 紧贴式表单组：把输入控件、前缀/后缀文本与操作按钮拼成一整行，输入控件自动撑满剩余宽度。 */
export function InputGroup({ block = true, responsive = true, className, ...rest }: InputGroupProps) {
  return (
    <div className={cx('ds-input-group', !block && 'is-inline', responsive && 'is-responsive', className)} {...rest} />
  );
}

export type InputGroupAddonProps = ComponentProps<'span'>;

/** 紧贴式表单组中的静态前缀或后缀文本槽（如协议前缀、域名后缀、单位）。 */
export function InputGroupAddon({ className, ...rest }: InputGroupAddonProps) {
  return <span className={cx('ds-input-group-addon', className)} {...rest} />;
}
