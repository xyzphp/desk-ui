import { Icon, type IconName } from '../foundation/Icon';
import { Button } from '../primitives/Button';
import { SegmentedControl } from '../shell/Pickers';
import type { MarkdownFormat } from './markdownEditing';
import type { MarkdownEditorLabels, MarkdownEditorMode } from './markdownTypes';

const formats: readonly { id: MarkdownFormat; icon: IconName }[] = [
  { id: 'bold', icon: 'bold' }, { id: 'italic', icon: 'italic' }, { id: 'heading', icon: 'heading' },
  { id: 'quote', icon: 'quote' }, { id: 'code', icon: 'code' }, { id: 'list-ul', icon: 'list' },
  { id: 'list-ol', icon: 'list-ordered' }, { id: 'table', icon: 'table' }, { id: 'hr', icon: 'minus' }, { id: 'link', icon: 'link' },
];
interface MarkdownToolbarProps {
  mode: MarkdownEditorMode;
  preview: boolean;
  blocked: boolean;
  canUndo: boolean;
  canRedo: boolean;
  readOnly?: boolean;
  modeDisabled?: boolean;
  labels: MarkdownEditorLabels;
  onMode: (mode: MarkdownEditorMode) => void;
  onFormat: (format: MarkdownFormat) => void;
  onUndo: () => void;
  onRedo: () => void;
  onAttachment?: () => void;
}
export function MarkdownToolbar(props: MarkdownToolbarProps) {
  const { labels } = props;
  const options = ([{ value: 'edit', label: labels.edit }, { value: 'split', label: labels.split },
    { value: 'preview', label: labels.preview }] as const).filter((option) => props.preview || option.value === 'edit');
  return <div className="ds-markdown-toolbar ds-scrollable" role="group" aria-label={labels.toolbar}>
    <fieldset className="ds-markdown-modes" disabled={props.modeDisabled}>
      <SegmentedControl options={options} value={props.mode} onChange={props.onMode} aria-label={labels.toolbar} />
    </fieldset>
    {!props.readOnly && <div className="ds-markdown-tools" onPointerDown={(event) => {
      if ((event.target as Element).closest('button')) event.preventDefault();
    }}>
      <div className="ds-markdown-history">
        <Button variant="quiet" size="sm" aria-label={labels.undo} title={labels.undo}
          disabled={props.blocked || !props.canUndo} onClick={props.onUndo}><Icon name="undo-2" /></Button>
        <Button variant="quiet" size="sm" aria-label={labels.redo} title={labels.redo}
          disabled={props.blocked || !props.canRedo} onClick={props.onRedo}><Icon name="redo-2" /></Button>
      </div>
      {formats.map((format) => <Button key={format.id} variant="quiet" size="sm"
        aria-label={labels.formats[format.id]} title={labels.formats[format.id]}
        disabled={props.blocked} onClick={() => props.onFormat(format.id)}><Icon name={format.icon} /></Button>)}
      {props.onAttachment && <Button variant="quiet" size="sm" icon="paperclip" disabled={props.blocked}
        onClick={props.onAttachment}>{labels.attachment}</Button>}
    </div>}
  </div>;
}
