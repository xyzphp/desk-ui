/** 用原生 setter 与事件提交，保留 React change 与受控回退。 */
export function commitInput(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  if (input.value === value) return;
  const view = input.ownerDocument.defaultView!;
  const prototype = input instanceof view.HTMLTextAreaElement ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new view.Event('input', { bubbles: true }));
  input.dispatchEvent(new view.Event('change', { bubbles: true }));
}
