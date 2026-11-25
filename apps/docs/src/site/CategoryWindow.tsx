import { AppLayout, AppMain, NavSidebar, useMessages } from '@xyzos/desk-ui';
import { docText } from '../blocks/docText';
import { findPage, pagesOf, type DocCategory } from '../registry';
import { DocsSearch } from './DocsSearch';
import { DocContent } from './DocContent';
import { docsMessages } from './locale';
import { useLanguage } from './LocaleProvider';

export interface CategoryWindowProps {
  category: DocCategory;
  pageId: string;
  onSelectPage: (pageId: string) => void;
  onOpenPage: (pageId: string) => void;
}

/** 分类窗口内容：左侧列出该分类的页面（与系统设置同款导航），右侧是文档。 */
export function CategoryWindow({ category, pageId, onSelectPage, onOpenPage }: CategoryWindowProps) {
  const t = useMessages(docsMessages).docs.category;
  const language = useLanguage();
  const categoryName = docText(category.name, language.current);
  const pages = pagesOf(category.id);
  const current = findPage(pageId) ?? pages[0];
  return (
    <AppLayout>
      <NavSidebar title={categoryName} aria-label={t.pagesAria(categoryName)}>
        <DocsSearch categoryId={category.id} currentPageId={current?.id} onSelect={(id) => {
          if (findPage(id)?.category === category.id) onSelectPage(id); else onOpenPage(id);
        }} />
      </NavSidebar>
      <AppMain>
        <div className="docs-window-scroll ds-scrollable" key={current?.id}><DocContent>{current?.render()}</DocContent></div>
      </AppMain>
    </AppLayout>
  );
}
