import { useImperativeHandle } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldProps } from '../primitives/FieldContext';
import { MarkdownToolbar } from './MarkdownToolbar';
import { useMarkdownEditor } from './useMarkdownEditor';
import type { MarkdownEditorProps } from './markdownTypes';

export function MarkdownEditor(props: MarkdownEditorProps) {
  const {
    ref, value, defaultValue, onValueChange, mode, defaultMode, onModeChange, renderPreview, onPickAttachment, onFiles,
    attachments, actions, busy, historyKey, labels: overrides, className, style, onChange, onKeyDown, onBlur,
    onBeforeInput, onCompositionStart, onCompositionEnd, onPaste, onInvalid, placeholder, ...rest
  } = props;
  const labels = useLabels('markdownEditor', overrides);
  const { input, composing, replaying, ...state } = useMarkdownEditor(props, labels);
  const field = useFieldProps(props);
  const description = [field['aria-describedby'], state.error ? `${state.id}-error` : undefined].filter(Boolean).join(' ') || undefined;
  const point = () => state.selection();
  useImperativeHandle(ref, () => ({
    input: input.current, focus: () => { state.setForceSource(true); queueMicrotask(() => input.current?.focus()); },
    insert: state.insert, format: state.format, undo: () => state.moveHistory(-1), redo: () => state.moveHistory(1), selection: point,
    resetHistory: () => state.history.reset(state.value),
  }));
  return <div className={cx('ds-markdown', className)} style={style} aria-busy={busy || undefined}>
    <MarkdownToolbar labels={labels} mode={state.shownMode} preview={!!renderPreview}
      blocked={state.blocked || state.composition} readOnly={props.readOnly}
      modeDisabled={props.disabled || busy || state.composition}
      canUndo={state.history.canUndo} canRedo={state.history.canRedo}
      onMode={state.setMode} onFormat={state.format} onUndo={() => state.moveHistory(-1)} onRedo={() => state.moveHistory(1)}
      onAttachment={onPickAttachment ? () => { const selection = point(); if (selection) onPickAttachment(selection); } : undefined} />
    <div className={cx('ds-markdown-writing', `ds-markdown-writing--${state.shownMode}`)}>
      <textarea {...rest} {...field} ref={input} className="ds-control-input ds-markdown-input ds-scrollable"
        hidden={state.shownMode === 'preview'} value={state.value} placeholder={placeholder ?? labels.placeholder}
        disabled={props.disabled || busy} aria-describedby={description} aria-invalid={field['aria-invalid'] || !!state.error || undefined}
        onKeyDown={state.key} onChange={(event) => {
          state.setValue(event.currentTarget.value);
          if (composing.current) {
            state.history.expect(event.currentTarget.value);
          } else if (!replaying.current) state.history.changed(event.currentTarget.value);
          if (event.currentTarget.validity.valid) state.setError('');
          onChange?.(event);
        }} onBeforeInput={(event) => {
          onBeforeInput?.(event); if (event.defaultPrevented) return;
          if (composing.current) return;
          state.history.remember();
          const type = (event.nativeEvent as InputEvent).inputType;
          if (type === 'historyUndo' || type === 'historyRedo') { event.preventDefault(); state.moveHistory(type === 'historyUndo' ? -1 : 1); }
        }} onBlur={(event) => { state.history.flush(); onBlur?.(event); }}
        onCompositionStart={(event) => {
          state.history.flush(); composing.current = true; state.setComposition(true); onCompositionStart?.(event);
        }} onCompositionEnd={(event) => {
          composing.current = false; state.setComposition(false);
          state.history.changed(event.currentTarget.value); onCompositionEnd?.(event);
        }}
        onPaste={(event) => {
          onPaste?.(event); if (event.defaultPrevented) return;
          if (state.blocked) { event.preventDefault(); return; }
          let files = Array.from(event.clipboardData.files);
          if (!files.length) files = Array.from(event.clipboardData.items ?? []).flatMap((item) => {
            const file = item.kind === 'file' ? item.getAsFile() : null;
            return file ? [file] : [];
          });
          const selection = point();
          if (files.length && onFiles && selection && !composing.current) { event.preventDefault(); onFiles(files, selection); }
        }} onInvalid={(event) => {
          onInvalid?.(event); if (event.defaultPrevented) return;
          event.preventDefault(); state.setError(event.currentTarget.validationMessage); state.setForceSource(true);
          queueMicrotask(() => input.current?.focus());
        }} />
      {renderPreview && state.shownMode !== 'edit' && <div className="ds-markdown-preview ds-scrollable"
        role="region" aria-label={labels.preview} tabIndex={0}
      >{renderPreview(state.value)}</div>}
    </div>
    {state.error && <p className="ds-field-error" id={`${state.id}-error`} role="alert">{state.error}</p>}
    {(attachments || actions) && <div className="ds-markdown-footer">{attachments}{actions}</div>}
  </div>;
}
