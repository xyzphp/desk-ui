import { matchesSearch } from '@xyzos/desk-ui';
import { docText } from '../blocks/docText';
import type { DocPage } from '../registry';

/** 索引双语标题与摘要，中文关键词在英文界面同样可命中。 */
export function pageSearchText(page: DocPage, locale: string) {
  const tags = [...new Set(['zh-CN', 'en-US', locale])];
  return [page.id,
    ...tags.flatMap((tag) => [docText(page.title, tag), docText(page.summary, tag)]),
    ...(page.keywords ?? []),
  ].join(' ');
}

/** 仅索引公开文档元数据；多个词按同时命中匹配，中文与 API 名称共用入口。 */
export function searchPages(pages: readonly DocPage[], query: string, locale: string) {
  return pages.filter((page) => matchesSearch(pageSearchText(page, locale), query));
}
