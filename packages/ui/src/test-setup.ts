import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 3000 });

/**
 * jsdom 30 没有 Popover API，却按浏览器规则把所有 `[popover]` 视为 display:none，
 * 导致锚点层（菜单、提示、选项列表）在 getByRole 中不可访问，隐藏后也不会归还焦点。
 * 这里补上最小实现：show / hide / toggle 维护 data-popover-open，:popover-open 可被 matches 识别，
 * 关闭时若焦点仍在浮层内，按规范把焦点还给打开前聚焦的元素。
 */
const OPEN = 'data-popover-open';
const proto = HTMLElement.prototype as HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
  togglePopover?: (force?: boolean) => boolean;
};

if (typeof proto.showPopover !== 'function') {
  const previous = new WeakMap<HTMLElement, Element | null>();
  const show = (node: HTMLElement) => {
    if (node.hasAttribute(OPEN)) return;
    previous.set(node, node.ownerDocument.activeElement);
    node.setAttribute(OPEN, '');
  };
  const hide = (node: HTMLElement) => {
    if (!node.hasAttribute(OPEN)) return;
    const focused = node.ownerDocument.activeElement;
    const target = previous.get(node);
    node.removeAttribute(OPEN);
    previous.delete(node);
    if (focused && node.contains(focused) && target instanceof HTMLElement && target.isConnected) target.focus();
  };
  proto.showPopover = function showPopover(this: HTMLElement) {
    show(this);
  };
  proto.hidePopover = function hidePopover(this: HTMLElement) {
    hide(this);
  };
  proto.togglePopover = function togglePopover(this: HTMLElement, force?: boolean) {
    const next = force ?? !this.hasAttribute(OPEN);
    if (next) show(this);
    else hide(this);
    return next;
  };

  const nativeMatches = Element.prototype.matches;
  Element.prototype.matches = function matches(this: Element, selector: string) {
    if (selector === ':popover-open') return this.hasAttribute(OPEN);
    return nativeMatches.call(this, selector);
  } as typeof Element.prototype.matches;

  const style = document.createElement('style');
  // jsdom 的默认样式表对 [popover] 的优先级高于普通作者规则，这里必须 !important（仅限测试环境）。
  style.textContent = `html body [popover][${OPEN}] { display: block !important; }`;
  document.head.append(style);
}

if (typeof HTMLDialogElement !== 'undefined') {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
      this.setAttribute('open', '');
    };
  }
  if (typeof HTMLDialogElement.prototype.close !== 'function') {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, returnValue?: string) {
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.open = false;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
}
