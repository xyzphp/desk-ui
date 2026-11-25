/** 本地文本匹配：全角归一、忽略大小写，空白分隔的关键词全部命中。 */
export function matchesSearch(text: string, query: string) {
  const source = text.normalize('NFKC').toLocaleLowerCase();
  return query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean).every((word) => source.includes(word));
}
