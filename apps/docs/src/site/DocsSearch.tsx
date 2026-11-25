import { useId, useRef, useState } from 'react';
import { NavItem, SearchField, Text, useMessages } from '@desk/ui';
import { docText } from '../blocks/docText';
import { findCategory, pages, pagesOf } from '../registry';
import { searchPages } from './docSearch';
import { docsMessages } from './locale';
import { useLanguage } from './LocaleProvider';

export interface DocsSearchProps {
  categoryId: string;
  currentPageId?: string;
  onSelect: (pageId: string) => void;
}

export function DocsSearch({ categoryId, currentPageId, onSelect }: DocsSearchProps) {
  const t = useMessages(docsMessages).docs.search;
  const language = useLanguage();
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const searching = !!query.trim();
  const matches = searching ? searchPages(pages, query, language.current) : pagesOf(categoryId);
  const select = (pageId: string) => { onSelect(pageId); setQuery(''); };
  return <div ref={root}>
    <div className="docs-sidebar-search">
      <SearchField label={t.label} placeholder={t.placeholder} value={query} aria-controls={id}
        onChange={(event) => setQuery(event.currentTarget.value)} onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'Enter' && searching && matches[0]) { event.preventDefault(); select(matches[0].id); }
          else if (event.key === 'ArrowDown') {
            event.preventDefault(); root.current?.querySelector<HTMLButtonElement>('[data-doc-result]')?.focus();
          } else if (event.key === 'Escape' && query) { event.preventDefault(); event.stopPropagation(); setQuery(''); }
        }} />
      {searching && <Text tone="muted" role="status">{matches.length ? t.foundCount(matches.length) : t.noResults}</Text>}
    </div>
    <div id={id}>
      {matches.map((page) => {
        const category = findCategory(page.category);
        return <NavItem key={page.id} data-doc-result="" icon={page.icon}
          current={page.id === currentPageId} onClick={() => select(page.id)}
        ><span className="docs-search-result"><span>{docText(page.title, language.current)}</span>
          {searching && category && <Text tone="muted">{docText(category.name, language.current)}</Text>}
        </span></NavItem>;
      })}
    </div>
  </div>;
}
