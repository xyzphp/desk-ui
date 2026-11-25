import { createContext, useContext } from 'react';

interface FieldContextValue { id: string; labelId: string; describedBy?: string; invalid: boolean }
export const FieldContext = createContext<FieldContextValue | null>(null);
export const useFieldContext = () => useContext(FieldContext);
export function useFieldProps(props: { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' }) {
  const ctx = useFieldContext();
  return {
    id: props.id ?? ctx?.id,
    'aria-describedby': props['aria-describedby'] ?? ctx?.describedBy,
    'aria-invalid': props['aria-invalid'] ?? (ctx?.invalid ? true : undefined),
  };
}
