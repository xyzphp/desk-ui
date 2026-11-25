import { zhCN } from '../foundation/locale';

export interface MarkdownMedia {
  url: string;
  image: boolean;
}

export interface MarkdownRenderOptions {
  media?: Readonly<Record<string, MarkdownMedia>>;
  editable?: boolean;
  /** 任务列表标记的可访问名称，默认使用基准语言。 */
  taskLabels?: { done: string; pending: string };
}

const escape = (value: string) =>
  String(value).replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );

function safeLink(value: string) {
  if (!/^(https?:\/\/|\/(?!\/)|#)/i.test(value) || /[\s\\\u0000-\u001f]/.test(value)) return '';
  try {
    const url = new URL(value, 'https://markdown.example/');
    return ['http:', 'https:'].includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
}

/** Render the original restricted Markdown subset to inert, escaped markup. */
export function renderMarkdown(value: string, options: MarkdownRenderOptions = {}) {
  const taskLabels = options.taskLabels ?? zhCN.markdownView.task;
  function inline(source: string, depth = 0): string {
    let result = '';
    for (let index = 0; index < source.length;) {
      const rest = source.slice(index);
      if (rest[0] === '\\' && /^[\\`*_~\[\]<>!#()+.|{}-]/.test(rest[1] || '')) {
        result += escape(rest[1]!);
        index += 2;
        continue;
      }
      if (rest[0] === '`') {
        const marker = rest.match(/^`+/)![0];
        const end = source.indexOf(marker, index + marker.length);
        if (end >= 0) {
          result += '<code>' + escape(source.slice(index + marker.length, end)) + '</code>';
          index = end + marker.length;
          continue;
        }
      }
      const link = rest.match(
        /^(!?)\[([^\]\r\n]+)\]\(([^\s)]+)(?:[ \t]+"([^"\r\n]*)")?(?:[ \t]+=(\d{2,4}))?(?:[ \t]+row=([1-4]))?\)/,
      );
      if (link) {
        const media = options.media && Object.hasOwn(options.media, link[3]!) ? options.media[link[3]!] : null;
        const mediaURL = media && /^\/(?!\/)/.test(media.url) ? safeLink(media.url) : '';
        if (link[1] && mediaURL && media?.image) {
          const size = Number(link[5]) >= 80 && Number(link[5]) <= 1200 ? Number(link[5]) : 0;
          const columns = Number(link[6]) || 1;
          const width = size ? ' width="' + size + '"' : '';
          const title = link[4] ? ' title="' + escape(link[4]) + '"' : '';
          const img =
            '<img src="' +
            escape(mediaURL) +
            '" alt="' +
            escape(link[2]!) +
            '" data-md-file="' +
            escape(link[3]!) +
            '" data-md-columns="' +
            columns +
            '"' +
            width +
            title +
            ' loading="lazy" decoding="async">';
          result +=
            '<span class="markdown-image" data-md-image="' +
            escape(link[3]!) +
            '" data-md-columns="' +
            columns +
            '"' +
            (size ? ' style="width:' + size + 'px"' : '') +
            '>' +
            img +
            '</span>';
          index += link[0].length;
          continue;
        }
        const url = mediaURL || safeLink(link[3]!);
        const label = depth < 4 ? inline(link[2]!, depth + 1) : escape(link[2]!);
        // Unbound and external images remain links; only authorized media can load inline.
        result += url
          ? '<a href="' +
            escape(url) +
            '" target="_blank" rel="noopener noreferrer"' +
            (mediaURL ? ' data-md-file="' + escape(link[3]!) + '"' : '') +
            (link[4] ? ' title="' + escape(link[4]) + '"' : '') +
            '>' +
            label +
            '</a>'
          : label;
        index += link[0].length;
        continue;
      }
      let formatted = false;
      if (depth < 4) {
        for (const [marker, tag] of [
          ['**', 'strong'],
          ['__', 'strong'],
          ['~~', 'del'],
          ['*', 'em'],
          ['_', 'em'],
        ] as const) {
          if (!rest.startsWith(marker)) continue;
          const end = source.indexOf(marker, index + marker.length);
          if (end > index + marker.length) {
            result += '<' + tag + '>' + inline(source.slice(index + marker.length, end), depth + 1) + '</' + tag + '>';
            index = end + marker.length;
            formatted = true;
            break;
          }
        }
      }
      if (!formatted) {
        result += escape(source[index]!);
        index++;
      }
    }
    return result;
  }

  const listItem = (line: string) => line.match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
  const tableCells = (line: string) => {
    const source = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    const cells: string[] = [];
    let cell = '';
    for (let index = 0; index < source.length; index++) {
      if (source[index] === '\\' && source[index + 1] === '|') {
        cell += '\\|';
        index++;
      } else if (source[index] === '|') {
        cells.push(cell.trim());
        cell = '';
      } else cell += source[index];
    }
    cells.push(cell.trim());
    return cells;
  };
  const isTable = (lines: string[], index: number) =>
    lines[index]?.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1] || '');
  const blockStart = (lines: string[], index: number) =>
    /^\s*$|^#{1,6}\s|^\s{0,3}(`{3,}|~{3,})|^>\s?|^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(lines[index] || '') ||
    listItem(lines[index] || '') ||
    isTable(lines, index);

  const imageRowsPattern = new RegExp(
    '<span class="markdown-image" data-md-image="[^"]+" ' +
      'data-md-columns="([2-4])"[^>]*><img[^>]*><\\/span>' +
      '(?:(?:<br>|\\s)*<span class="markdown-image" data-md-image="[^"]+" ' +
      'data-md-columns="\\1"[^>]*><img[^>]*><\\/span>)*',
    'g',
  );
  function imageRows(html: string) {
    return html.replace(
      imageRowsPattern,
      (images, columns) =>
        '<span class="markdown-image-row" data-md-columns="' + columns + '">' + images.replace(/<br>/g, '') + '</span>',
    );
  }

  function blocks(lines: string[], depth = 0) {
    let result = '';
    const offsets = [0];
    for (const line of lines) offsets.push(offsets[offsets.length - 1]! + line.length + 1);
    for (let index = 0; index < lines.length;) {
      const start = index;
      const append = (html: string) => {
        if (options.editable && depth === 0)
          html = html.replace(
            /^<([a-z][a-z0-9]*)/,
            '<$1 data-md-start="' + offsets[start] + '" data-md-end="' + (offsets[index]! - 1) + '"',
          );
        result += html;
      };
      const line = lines[index]!;
      if (!line.trim()) {
        index++;
        continue;
      }
      const fence = line.match(/^\s{0,3}(`{3,}|~{3,})\s*([\w+-]*)\s*$/);
      if (fence) {
        const content: string[] = [];
        index++;
        while (
          index < lines.length &&
          !new RegExp('^\\s{0,3}' + fence[1]![0] + '{' + fence[1]!.length + ',}\\s*$').test(lines[index]!)
        )
          content.push(lines[index++]!);
        if (index < lines.length) index++;
        append(
          '<pre><code' +
            (fence[2] ? ' class="language-' + escape(fence[2]) + '"' : '') +
            '>' +
            escape(content.join('\n')) +
            '</code></pre>',
        );
        continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (heading) {
        index++;
        append('<h' + heading[1]!.length + '>' + inline(heading[2]!) + '</h' + heading[1]!.length + '>');
        continue;
      }
      if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        index++;
        append('<hr>');
        continue;
      }
      if (/^>/.test(line)) {
        const content: string[] = [];
        while (index < lines.length && /^>/.test(lines[index]!)) content.push(lines[index++]!.replace(/^>\s?/, ''));
        append(
          '<blockquote>' +
            (depth < 3 ? blocks(content, depth + 1) : '<p>' + inline(content.join(' ')) + '</p>') +
            '</blockquote>',
        );
        continue;
      }
      if (isTable(lines, index)) {
        const header = tableCells(line);
        index += 2;
        const rows: string[][] = [];
        while (index < lines.length && lines[index]!.trim() && lines[index]!.includes('|'))
          rows.push(tableCells(lines[index++]!));
        append(
          '<div class="markdown-table"><table><thead><tr>' +
            header.map((cell) => '<th>' + imageRows(inline(cell)) + '</th>').join('') +
            '</tr></thead><tbody>' +
            rows
              .map(
                (row) =>
                  '<tr>' +
                  header.map((_, column) => '<td>' + imageRows(inline(row[column] || '')) + '</td>').join('') +
                  '</tr>',
              )
              .join('') +
            '</tbody></table></div>',
        );
        continue;
      }
      const first = listItem(line);
      if (first) {
        const ordered = /^\d/.test(first[1]!);
        const items: string[] = [];
        while (index < lines.length) {
          const item = listItem(lines[index]!);
          if (!item || /^\d/.test(item[1]!) !== ordered) break;
          const task = item[2]!.match(/^\[([ xX])\]\s+(.+)$/);
          items.push(
            task
              ? '<li class="markdown-task"><span aria-label="' +
                  escape(task[1] === ' ' ? taskLabels.pending : taskLabels.done) +
                  '">' +
                  (task[1] === ' ' ? '○' : '✓') +
                  '</span>' +
                  imageRows(inline(task[2]!)) +
                  '</li>'
              : '<li>' + imageRows(inline(item[2]!)) + '</li>',
          );
          index++;
        }
        const tag = ordered ? 'ol' : 'ul';
        append('<' + tag + '>' + items.join('') + '</' + tag + '>');
        continue;
      }
      const paragraph = [line];
      index++;
      while (index < lines.length && !blockStart(lines, index)) paragraph.push(lines[index++]!);
      append('<p>' + imageRows(paragraph.map((text) => inline(text)).join('<br>')) + '</p>');
    }
    return result;
  }

  const source = String(value || '')
    .slice(0, 80_000)
    .replace(/\r\n?/g, '\n')
    .split('\n');
  return blocks(source);
}
