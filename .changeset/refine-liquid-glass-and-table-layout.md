---
"@xyzos/desk-ui": minor
---

Add an optional `minWidth` prop on `Table` so fixed-layout tables scroll horizontally inside `.ds-table-scroll` instead of crushing flexible columns in narrow panes, raise `DetailLayout`'s two-column collapse threshold from `600px` to `860px` so detail content stays spacious inside desktop windows, and refine `liquid` glass surfaces: slimmer `1px` Fresnel rims, balanced translucent tint/blur, high-contrast foreground and active-pill tokens (`--ds-liquid-glass-text`, `--ds-liquid-glass-text-2`, `--ds-liquid-glass-active-bg`, `--ds-liquid-glass-active-text`, `--ds-liquid-glass-track-bg`, `--ds-liquid-glass-chip-border`), and fluid CSS motion (popover/start-menu bloom, diagonal rim specular glide on hover/open, and tactile button press, all honoring `prefers-reduced-motion`).
