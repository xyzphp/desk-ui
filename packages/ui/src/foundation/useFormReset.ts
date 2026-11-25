import { useEffect, type RefObject } from 'react';
import { useLatest } from './useLatest';

/**
 * 监听所属表单的 reset。等原生重置完成后再回调，且被 preventDefault 的重置不处理。
 * formAttribute 传入元素的 form 属性，所属表单变化时重新绑定。
 */
export function useFormReset(
  owner: RefObject<{ form: HTMLFormElement | null } | null>,
  onReset: () => void,
  formAttribute?: string,
) {
  const latest = useLatest(onReset);
  useEffect(() => {
    const form = owner.current?.form;
    if (!form) return;
    let alive = true;
    const handle = (event: Event) => queueMicrotask(() => {
      if (alive && !event.defaultPrevented) latest.current();
    });
    form.addEventListener('reset', handle);
    return () => { alive = false; form.removeEventListener('reset', handle); };
  }, [owner, latest, formAttribute]);
}
