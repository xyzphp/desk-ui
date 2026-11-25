export type MarkdownFormat = 'bold' | 'italic' | 'heading' | 'quote' | 'code' | 'list-ul' | 'list-ol' | 'table' | 'hr' | 'link';
export interface MarkdownSelection { source: string; start: number; end: number; key?: string | number }
export interface MarkdownSnapshot extends MarkdownSelection {}
export interface MarkdownSamples { bold: string; italic: string; heading: string; quote: string; code: string; list: string; table: string; link: string }

/** 对齐 markdown-editor.js 的源码插入规则；不解析 Markdown 或构造 HTML。 */
export function markdownFormat(format: MarkdownFormat, selected: string, samples: MarkdownSamples) {
  switch (format) {
    case 'bold': return '**' + (selected || samples.bold) + '**';
    case 'italic': return '*' + (selected || samples.italic) + '*';
    case 'heading': return '\n## ' + (selected || samples.heading) + '\n';
    case 'quote': return '\n' + (selected || samples.quote).split('\n').map((line) => '> ' + line).join('\n') + '\n';
    case 'code': return selected.includes('\n') ? '\n```\n' + selected + '\n```\n' : '`' + (selected || samples.code) + '`';
    case 'list-ul': return '\n' + (selected || samples.list).split('\n').map((line) => '- ' + line).join('\n') + '\n';
    case 'list-ol': return '\n' + (selected || samples.list).split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n') + '\n';
    case 'table': return '\n' + samples.table + '\n';
    case 'hr': return '\n---\n';
    case 'link': return '[' + (selected || samples.link) + '](https://example.com)';
  }
}

/** 移植 createHistory：最多 60 个源码 / 选区快照，新的编辑丢弃 redo 分支。 */
export function createMarkdownHistory(source: string) {
  return {
    stack: [{ source, start: 0, end: 0 }] as MarkdownSnapshot[], index: 0,
    init(value: string) { this.stack = [{ source: value, start: 0, end: 0 }]; this.index = 0; },
    record(snapshot: MarkdownSnapshot) {
      if (this.stack[this.index]?.source === snapshot.source) { this.stack[this.index] = snapshot; return; }
      this.stack = this.stack.slice(0, this.index + 1); this.stack.push(snapshot);
      if (this.stack.length > 60) this.stack.shift();
      this.index = this.stack.length - 1;
    },
    canUndo(value: string) { return this.index > 0 || this.stack[this.index]?.source !== value; },
    canRedo(value: string) { return this.index < this.stack.length - 1 && this.stack[this.index]?.source === value; },
  };
}
