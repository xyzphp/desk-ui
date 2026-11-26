import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { isRenderable } from '../foundation/renderable';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
const HeadingLevelContext = createContext<HeadingLevel>(2);

export interface DetailLayoutProps extends Omit<ComponentProps<'article'>, 'title'> {
  title: ReactNode;
  /** 标题下的一句说明。 */
  description?: ReactNode;
  /** 标题左侧的图形，例如 AppIcon 或 Avatar。 */
  media?: ReactNode;
  /** 标题下方的标签行。 */
  meta?: ReactNode;
  /** 头部右侧的主要操作。 */
  actions?: ReactNode;
  /** 右侧信息栏，通常是若干 Panel；窄容器下排到正文之后。 */
  aside?: ReactNode;
  /** 标题级别；DetailSection 自动使用下一级。 */
  headingLevel?: 1 | 2 | 3;
}

/** 详情页布局：图形、标题、说明、标签与主操作组成头部，下方正文与信息栏两栏排布。 */
export function DetailLayout({
  title, description, media, meta, actions, aside, headingLevel = 2, className, children, ...rest
}: DetailLayoutProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <article {...rest} aria-labelledby={titleId} className={cx('ds-detail', className)}>
      <header className="ds-detail-head">
        {isRenderable(media) && <div className="ds-detail-media">{media}</div>}
        <div className="ds-detail-heading">
          <Heading id={titleId} className="ds-detail-title">{title}</Heading>
          {isRenderable(description) && <p className="ds-detail-description">{description}</p>}
          {isRenderable(meta) && <div className="ds-detail-meta">{meta}</div>}
        </div>
        {isRenderable(actions) && <div className="ds-detail-actions">{actions}</div>}
      </header>
      <HeadingLevelContext.Provider value={(headingLevel + 1) as HeadingLevel}>
        <div className={cx('ds-detail-body', isRenderable(aside) && 'has-aside')}>
          <div className="ds-detail-main">{children}</div>
          {isRenderable(aside) && <div className="ds-detail-aside">{aside}</div>}
        </div>
      </HeadingLevelContext.Provider>
    </article>
  );
}

export interface DetailSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: ReactNode;
}

/** 详情正文中的一节：标题级别随 DetailLayout 自动取下一级，不带边框与底色。 */
export function DetailSection({ title, className, children, ...rest }: DetailSectionProps) {
  const titleId = useId();
  const Heading = `h${useContext(HeadingLevelContext)}` as const;
  return (
    <section {...rest} aria-labelledby={titleId} className={cx('ds-detail-section', className)}>
      <Heading id={titleId} className="ds-detail-section-title">{title}</Heading>
      {children}
    </section>
  );
}
