import { Select } from './Select';

/** 内部模型选择适配；所有下拉共用公开 Select 的菜单、焦点与表单实现。 */
export function ChoiceSelect({ id, label, value, options, placeholder, disabled, onValueChange }: {
  id?: string; label: string; value: string; options: readonly { id: string; label: string; disabled?: boolean }[];
  placeholder: string; disabled?: boolean; onValueChange: (value: string) => void;
}) {
  return <Select id={id} aria-label={label} value={value} disabled={disabled} placeholder={placeholder}
    onChange={(event) => onValueChange(event.currentTarget.value)}>
    {!options.some((item) => item.id === value) && <option value={value} disabled>{placeholder}</option>}
    {options.map((item) => <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>)}
  </Select>;
}
