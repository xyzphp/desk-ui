import { createElement, useMemo, type ComponentProps, type ElementType, type ReactNode } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import type { MarkdownViewLabels } from '../foundation/locale';
import { renderMarkdown, type MarkdownMedia } from './markdownRender';

export interface MarkdownViewProps extends Omit<ComponentProps<'article'>, 'children'> {
  /** Preserve the native preview root tag without adding a wrapper. */
  as?: 'article' | 'div';
  value: string;
  /** React-rendered content appended inside the same root after Markdown blocks. */
  after?: ReactNode;
  /** Explicit media mappings; Markdown never loads an image URL supplied by the text. */
  media?: Readonly<Record<string, MarkdownMedia>>;
  /** Adds source offsets to top-level blocks for host-owned text selection tools. */
  editable?: boolean;
  /** Marks authorized Markdown image frames as non-editable and adds a keyboardable resize control. */
  visualEditable?: boolean;
}

const allowedTags = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]);
const mediaReference = /^(?:article|project)-file:[1-9]\d*$/;
const rootPath = /^\/(?!\/)[^\s\\\u0000-\u001f]*$/;
const safeClass = /^(?:markdown-table|markdown-task|markdown-image|markdown-image-row|language-[\w+-]+)$/;

function safeHref(value: string) {
  if (!/^(https?:\/\/|\/(?!\/)|#)/i.test(value) || /[\s\\\u0000-\u001f]/.test(value)) return '';
  try {
    const url = new URL(value, 'https://markdown.example/');
    return ['http:', 'https:'].includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
}

function dataNumber(element: Element, attribute: string) {
  const value = element.getAttribute(attribute);
  if (!value || !/^\d{1,5}$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= 80_000 ? number : undefined;
}

function toReact(node: Node, key: string, visualEditable: boolean, labels: MarkdownViewLabels): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as HTMLElement;
  const tag = element.tagName.toLocaleLowerCase();
  if (!allowedTags.has(tag))
    return Array.from(element.childNodes, (child, index) => toReact(child, `${key}.${index}`, visualEditable, labels));
  const props: Record<string, unknown> = { key };
  const className = element
    .getAttribute('class')
    ?.split(/\s+/)
    .filter((value) => safeClass.test(value))
    .join(' ');
  if (className) props.className = className;
  const title = element.getAttribute('title');
  if (title) props.title = title.slice(0, 500);
  const label = element.getAttribute('aria-label');
  if (label === labels.task.done || label === labels.task.pending) props['aria-label'] = label;
  const mediaFile = element.getAttribute('data-md-file');
  if (mediaFile && mediaReference.test(mediaFile)) props['data-md-file'] = mediaFile;
  const imageReference = element.getAttribute('data-md-image');
  if (imageReference && mediaReference.test(imageReference)) props['data-md-image'] = imageReference;
  const columns = Number(element.getAttribute('data-md-columns'));
  if (Number.isInteger(columns) && columns >= 1 && columns <= 4) props['data-md-columns'] = String(columns);
  const start = dataNumber(element, 'data-md-start');
  const end = dataNumber(element, 'data-md-end');
  if (start !== undefined && end !== undefined && end >= start) {
    props['data-md-start'] = start;
    props['data-md-end'] = end;
  }
  if (tag === 'a') {
    const href = safeHref(element.getAttribute('href') || '');
    if (!href)
      return Array.from(element.childNodes, (child, index) => toReact(child, `${key}.${index}`, visualEditable, labels));
    props.href = href;
    props.target = '_blank';
    props.rel = 'noopener noreferrer';
  }
  if (tag === 'img') {
    const src = element.getAttribute('src') || '';
    if (!rootPath.test(src) || !safeHref(src)) return null;
    props.src = src;
    props.alt = (element.getAttribute('alt') || '').slice(0, 1000);
    props.loading = 'lazy';
    props.decoding = 'async';
    const width = Number(element.getAttribute('width'));
    if (Number.isInteger(width) && width >= 80 && width <= 1200) props.width = width;
  }
  if (tag === 'span') {
    const width = element.style.width;
    if (/^(?:[8-9]\d|[1-9]\d{2}|1[01]\d{2}|1200)px$/.test(width)) props.style = { width };
    if (visualEditable && className?.split(/\s+/).includes('markdown-image')) {
      const image = element.querySelector('img');
      props.contentEditable = false;
      props.tabIndex = 0;
      props['aria-label'] = labels.imageHint(image?.getAttribute('alt') || labels.image);
    }
  }
  const children = Array.from(element.childNodes, (child, index) => toReact(child, `${key}.${index}`, visualEditable, labels));
  if (visualEditable && tag === 'span' && className?.split(/\s+/).includes('markdown-image')) {
    const imageWidth = Number(element.querySelector('img')?.getAttribute('width'));
    children.push(
      createElement('button', {
        key: `${key}.resize`,
        type: 'button',
        className: 'md-editor-image-resize',
        'data-md-image-resize': '',
        'data-md-editor-ui': '',
        role: 'slider',
        tabIndex: 0,
        'aria-label': labels.resizeImage,
        'aria-valuemin': 80,
        'aria-valuemax': 1200,
        'aria-valuenow': Number.isInteger(imageWidth) && imageWidth >= 80 && imageWidth <= 1200 ? imageWidth : 320,
      }),
    );
  }
  return createElement(tag, props, ...children);
}

/** Safe subset of the native Markdown renderer, represented as React nodes (never raw HTML). */
export function MarkdownView({
  as = 'article',
  value,
  media,
  editable = false,
  visualEditable = false,
  after,
  className,
  ...rest
}: MarkdownViewProps) {
  const labels = useLabels('markdownView');
  const content = useMemo(() => {
    const markup = renderMarkdown(value, { media, editable, taskLabels: labels.task });
    if (typeof DOMParser === 'undefined') return value.slice(0, 80_000);
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    return Array.from(parsed.body.childNodes, (node, index) => toReact(node, String(index), visualEditable, labels));
  }, [editable, labels, media, value, visualEditable]);
  const Root = as as ElementType;
  const children = typeof content === 'string' ? createElement('pre', null, content) : content;
  const props = { ...rest, suppressContentEditableWarning: visualEditable, className: cx('ds-markdown', className) };
  return after === undefined ? createElement(Root, props, children) : createElement(Root, props, children, after);
}
