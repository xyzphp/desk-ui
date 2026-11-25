import { SelectControl } from './SelectControl';
import { SearchSelect } from './SearchSelect';
import type { SelectBaseProps } from './useSelectForm';

export interface SearchSelectLabels {
  search: string; open: string; clear: string; loading: string;
  count: (count: number) => string;
}
export interface SelectSearchOptions {
  searchable?: boolean;
  dropdown?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  maxVisibleTags?: number;
  loading?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  searchLabels?: Partial<SearchSelectLabels>;
}
export interface SelectProps extends SelectBaseProps, SelectSearchOptions {}

/** 基础选择和搜索 / 多选共用原生表单与选项模型，仅显示层按能力分开。 */
export function Select({
  searchable, dropdown, query, defaultQuery, onQueryChange, maxVisibleTags, loading, readOnly, clearable, searchLabels, ...props
}: SelectProps) {
  if (searchable || props.multiple && dropdown) return <SearchSelect
    {...props} query={query} defaultQuery={defaultQuery} onQueryChange={onQueryChange}
    maxVisibleTags={maxVisibleTags} loading={loading} readOnly={readOnly} clearable={clearable} searchLabels={searchLabels}
  />;
  return <SelectControl {...props} />;
}

export interface ComboboxProps extends Omit<SelectProps, 'multiple' | 'size' | 'searchable' | 'dropdown' | 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
export function Combobox({ onValueChange, onChange, ...props }: ComboboxProps) {
  return <Select {...props} searchable onChange={(event) => {
    onChange?.(event); onValueChange?.(event.currentTarget.value);
  }} />;
}
export interface MultiSelectProps extends Omit<SelectProps, 'multiple' | 'size' | 'searchable' | 'dropdown' | 'value' | 'defaultValue'> {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
}
export function MultiSelect({ onValueChange, onChange, ...props }: MultiSelectProps) {
  return <Select {...props} multiple dropdown searchable onChange={(event) => {
    onChange?.(event); onValueChange?.(Array.from(event.currentTarget.selectedOptions, (option) => option.value));
  }} />;
}
