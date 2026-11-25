/** 落在这些元素上的指针属于界面操作，壁纸不响应（不散光点、不起涟漪、鱼不躲避）。 */
export const interactiveSelector = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  'iframe',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="listbox"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="slider"]',
  '[data-desktop-interactive]',
  '.ds-window',
  '.ds-menubar',
  '.ds-dock-wrap',
  '.ds-dock-edge-trigger',
  '.ds-desktop-icon',
].join(', ');

/** 壁纸交互生效的范围：桌面，或宿主用 data-wallpaper-scope 标出的区域（如登录页）。 */
export const wallpaperScopeSelector = '.ds-desktop, [data-wallpaper-scope]';

/** 指针是否落在壁纸范围内的空白处（不在窗口、图标、菜单、Dock、登录卡片等界面元素上）。 */
export function onWallpaperBlank(scene: Element, target: EventTarget | null) {
  const element = target as Element | null;
  if (!element || typeof element.closest !== 'function' || element.closest(interactiveSelector)) return false;
  return !!scene.closest(wallpaperScopeSelector)?.contains(element);
}
