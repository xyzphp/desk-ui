/*
 * 渐变预设的动态层，只由 Desktop 渲染，不单独导出；画作场景壁纸见 wallpapers/。
 * 所有运动都是 transform / opacity 的 CSS 动画，颜色来自 tokens.css 的壁纸光斑令牌。
 */

/** 渐变预设的流动层：三团会变形的光斑 + 两条缓慢摆动的色带。 */
export function WallpaperFlow() {
  return (
    <div className="ds-wallpaper-flow" aria-hidden="true">
      <span className="ds-wf-blob" />
      <span className="ds-wf-blob" />
      <span className="ds-wf-blob" />
      <span className="ds-wf-ribbon" />
      <span className="ds-wf-ribbon" />
    </div>
  );
}
