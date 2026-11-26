import { Children, isValidElement, useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { isRenderable } from '../foundation/renderable';
import { safeImage } from '../foundation/safeImage';
import { AppIcon, type AppIconAppearance } from '../shell/AppIcon';

export interface AppCardProps extends Omit<ComponentProps<'article'>, 'title'> {
  /** 应用名称：卡片标题，也是打开动作的可访问名称。 */
  name: string;
  /** 一两句简介，超过两行截断。 */
  summary?: ReactNode;
  /** 图标外观，与 AppIcon 相同；没有可用图片或图形时显示名称首字。 */
  icon?: AppIconAppearance;
  /** 分类、状态等标签，通常是 Tag。 */
  tags?: ReactNode;
  /** 底栏左侧的次要信息，例如版本与来源。 */
  meta?: ReactNode;
  /** 底栏右侧的操作按钮，独立于整卡的打开动作。 */
  actions?: ReactNode;
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

/** 应用目录卡片：图标、名称、简介、标签与底栏操作；整卡点击打开详情，底栏按钮保持各自的动作。 */
export function AppCard({
  name, summary, icon, tags, meta, actions, href, onOpen, headingLevel = 3, className, ...rest
}: AppCardProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  const interactive = href !== undefined || onOpen !== undefined;
  return (
    <article {...rest} aria-labelledby={titleId} className={cx('ds-app-card', interactive && 'is-interactive', className)}>
      <div className="ds-app-card-head">
        <AppIcon {...iconAppearance(name, icon)} size={44} />
        <div className="ds-app-card-heading">
          <Heading id={titleId} className="ds-app-card-title">
            {href !== undefined ? (
              <a className="ds-app-card-open" href={href}>{name}</a>
            ) : onOpen ? (
              <button type="button" className="ds-app-card-open" onClick={onOpen}>{name}</button>
            ) : (
              name
            )}
          </Heading>
          {isRenderable(summary) && <p className="ds-app-card-summary">{summary}</p>}
        </div>
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
