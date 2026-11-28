import { Children, isValidElement, useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { isRenderable } from '../foundation/renderable';
import { safeImage } from '../foundation/safeImage';
import { AppIcon, type AppIconAppearance } from '../shell/AppIcon';

/** 卡片淡雅渐变方向；auto 会按页面加载生成的随机轮换顺序混合多种柔和彩色渐变。 */
export type AppCardTint = 'auto' | 'blue' | 'purple' | 'teal' | 'rose' | 'amber' | 'neutral';

type ResolvedAppCardTint = Exclude<AppCardTint, 'auto'>;

const tintPalette: readonly ResolvedAppCardTint[] = ['blue', 'purple', 'teal', 'rose', 'amber'];

function shuffleTints(source: readonly ResolvedAppCardTint[]): ResolvedAppCardTint[] {
  const next = [...source];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const picked = next[j];
    if (current !== undefined && picked !== undefined) {
      next[i] = picked;
      next[j] = current;
    }
  }
  return next;
}

// 每次页面加载打乱一次调色顺序，让相同列表中各卡片随机分布背景色，同时筛选与点击时不闪烁跳色。
const sessionTints = shuffleTints(tintPalette);

function resolveAutoTint(seed: string): ResolvedAppCardTint {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return sessionTints[(hash >>> 0) % sessionTints.length] ?? 'blue';
}

export interface AppCardProps extends Omit<ComponentProps<'article'>, 'title'> {
  /** 应用名称：卡片标题，也是打开动作的可访问名称。 */
  name: string;
  /** 一两句简介，超过两行截断。 */
  summary?: ReactNode;
  /** 图标外观，与 AppIcon 相同；没有可用图片或图形时显示名称首字。 */
  icon?: AppIconAppearance;
  /** 淡雅浅色渐变底色方向；默认 auto（随页面随机分配柔和渐变）。 */
  tint?: AppCardTint;
  /** tint="auto" 时用于随机选色的稳定标识种子（例如 slug）；默认使用 name。 */
  tintSeed?: string;
  /** 顶部右侧可选辅助操作（例如更多菜单按钮），独立于整卡点击区。 */
  headerAction?: ReactNode;
  /** 分类、状态等紧凑标签，通常是 Tag。 */
  tags?: ReactNode;
  /** 底栏左侧的次要信息，例如版本号与标识。 */
  meta?: ReactNode;
  /** 底栏右侧的操作按钮，独立于整卡的打开动作。 */
  actions?: ReactNode;
  /** 仅在悬停或键盘聚焦卡片时渐显底栏操作（触屏设备常显）。 */
  revealActions?: boolean;
  /** 打开详情的地址；与 onOpen 二选一，都不提供时卡片只展示。 */
  href?: string;
  onOpen?: () => void;
  /** 标题的标题级别，按所在页面的大纲选择。 */
  headingLevel?: 2 | 3 | 4;
}

function iconAppearance(name: string, icon: AppIconAppearance | undefined): AppIconAppearance {
  const image = safeImage(icon?.image);
  if (image) return { ...icon, image };
  if (icon?.icon || icon?.glyph) return { ...icon, image: undefined };
  return { ...icon, image: undefined, glyph: Array.from(name.trim())[0] ?? '?' };
}

/** 约 9:6 比例的应用目录卡片：淡雅随机渐变表面、图标与简介、紧凑标签与底栏操作；整卡点击打开详情。 */
export function AppCard({
  name,
  summary,
  icon,
  tint = 'auto',
  tintSeed,
  headerAction,
  tags,
  meta,
  actions,
  revealActions = false,
  href,
  onOpen,
  headingLevel = 3,
  className,
  ...rest
}: AppCardProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  const interactive = href !== undefined || onOpen !== undefined;
  const resolvedTint = tint === 'auto' ? resolveAutoTint(tintSeed ?? name) : tint;
  return (
    <article
      {...rest}
      aria-labelledby={titleId}
      data-tint={resolvedTint}
      data-reveal-actions={revealActions ? '' : undefined}
      className={cx('ds-app-card', interactive && 'is-interactive', className)}
    >
      <div className="ds-app-card-head">
        <AppIcon className="ds-app-card-icon" {...iconAppearance(name, icon)} size={44} />
        <div className="ds-app-card-heading">
          <Heading id={titleId} className="ds-app-card-title">
            {href !== undefined ? (
              <a className="ds-app-card-open" href={href}>
                {name}
              </a>
            ) : onOpen ? (
              <button type="button" className="ds-app-card-open" onClick={onOpen}>
                {name}
              </button>
            ) : (
              name
            )}
          </Heading>
          {isRenderable(summary) && <p className="ds-app-card-summary">{summary}</p>}
        </div>
        {isRenderable(headerAction) && <div className="ds-app-card-head-action">{headerAction}</div>}
      </div>
      {isRenderable(tags) && <div className="ds-app-card-tags">{tags}</div>}
      {(isRenderable(meta) || isRenderable(actions)) && (
        <div className="ds-app-card-foot">
          {isRenderable(meta) && <span className="ds-app-card-meta">{meta}</span>}
          {isRenderable(actions) && <div className="ds-app-card-actions">{actions}</div>}
        </div>
      )}
    </article>
  );
}

export type AppCardGridProps = ComponentProps<'ul'>;

/** 等宽卡片的自适应网格，保留列表语义；结果较少时卡片保持列宽，不拉伸到整行。 */
export function AppCardGrid({ className, children, ...rest }: AppCardGridProps) {
  return (
    <ul role="list" {...rest} className={cx('ds-app-card-grid', className)}>
      {Children.map(children, (child) => (isValidElement(child) ? <li>{child}</li> : null))}
    </ul>
  );
}
