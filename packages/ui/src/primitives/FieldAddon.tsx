import { type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';

export interface FieldAddonProps extends ComponentProps<'div'> {
  /** 尾部附件：通常为 Checkbox / Switch 等库控件，或 span 包裹的短文本。 */
  addon?: ReactNode;
  /** 主控件：自带边框的库控件（Select / Input 等）外壳由组合表面抹平。 */
  children?: ReactNode;
}

/** 主控件与尾部附件的组合表面：统一边框、悬停与焦点态，附件带分隔线。 */
export function FieldAddon({ addon, children, className, ...rest }: FieldAddonProps) {
  return (
    <div className={cx('ds-field-addon', className)} {...rest}>
      <div className="ds-field-addon-main">{children}</div>
      {addon != null && addon !== false && <div className="ds-field-addon-item">{addon}</div>}
    </div>
  );
}
