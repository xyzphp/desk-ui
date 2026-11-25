import type { KeyboardEventHandler } from 'react';

/** 同名原生单选共享方向键处理，保持事件取消、禁用项和焦点规则一致。 */
export function useRadioKeyboard(name: string, onKeyDown?: KeyboardEventHandler<HTMLFieldSetElement>, readOnly = false) {
  return ((event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!backward && event.key !== 'ArrowRight' && event.key !== 'ArrowDown') return;
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
      .filter((input) => !input.matches(':disabled') && input.name === name);
    const current = options.indexOf(event.target as HTMLInputElement);
    if (current < 0 || !options.length) return;
    event.preventDefault();
    if (readOnly) return;
    const next = options[(current + (backward ? -1 : 1) + options.length) % options.length];
    next?.focus(); next?.click();
  }) satisfies KeyboardEventHandler<HTMLFieldSetElement>;
}
