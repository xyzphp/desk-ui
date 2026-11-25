import type { ComponentProps, ReactNode, Ref } from 'react';
import type { MarkdownFormat, MarkdownSamples, MarkdownSelection } from './markdownEditing';

export type MarkdownEditorMode = 'edit' | 'split' | 'preview';
export interface MarkdownEditorLabels {
  edit: string; split: string; preview: string; toolbar: string; undo: string; redo: string; attachment: string;
  placeholder: string; tooLong: (limit: number) => string;
  formats: Record<MarkdownFormat, string>;
  samples: MarkdownSamples;
}
export interface MarkdownEditorHandle {
  input: HTMLTextAreaElement | null;
  focus: () => void;
  insert: (text: string, selection?: MarkdownSelection) => boolean;
  format: (format: MarkdownFormat) => boolean;
  undo: () => void;
  redo: () => void;
  selection: () => MarkdownSelection | null;
  resetHistory: () => void;
}
export interface MarkdownEditorProps extends Omit<ComponentProps<'textarea'>, 'ref' | 'value' | 'defaultValue' | 'children'> {
  ref?: Ref<MarkdownEditorHandle>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  mode?: MarkdownEditorMode;
  defaultMode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
  /** 使用宿主经过审查的 React 渲染器，不接收 HTML 字符串接口。 */
  renderPreview?: (markdown: string) => ReactNode;
  onPickAttachment?: (selection: MarkdownSelection) => void;
  onFiles?: (files: readonly File[], selection: MarkdownSelection) => void;
  attachments?: ReactNode;
  actions?: ReactNode;
  busy?: boolean;
  historyKey?: string | number;
  labels?: Partial<Omit<MarkdownEditorLabels, 'formats' | 'samples'>> & {
    formats?: Partial<MarkdownEditorLabels['formats']>; samples?: Partial<MarkdownSamples>;
  };
}
