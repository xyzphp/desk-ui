import { useEffect, useId, useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { Button, IconButton } from '../primitives/Button';
import { Notice } from '../primitives/Feedback';

export type UploadRejectionReason = 'type' | 'size' | 'count' | 'duplicate' | 'directory';

export interface UploadRejection {
  file: File;
  reason: UploadRejectionReason;
}

export interface UploadZoneLabels {
  fileList: string;
  remove: (file: File) => string;
  clear: string;
  busy: string;
  rejected: (rejection: UploadRejection) => string;
}

export interface UploadZoneProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  description?: ReactNode;
  icon?: IconName;
  files?: readonly File[];
  defaultFiles?: readonly File[];
  onFilesChange?: (files: File[]) => void;
  onReject?: (rejections: UploadRejection[]) => void;
  /** 与原生 accept 一致：扩展名、MIME 或 image/* 等类型。仅作客户端提示。 */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  /** 每个文件的最大字节数。 */
  maxFileSize?: number;
  disabled?: boolean;
  busy?: boolean;
  error?: ReactNode;
  labels: UploadZoneLabels;
}

function matchesAccept(file: File, accept: string) {
  const patterns = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase(),
    type = file.type.toLowerCase();
  return (
    !patterns.length ||
    patterns.some((pattern) => {
      if (pattern.startsWith('.')) return name.endsWith(pattern);
      if (pattern === '*/*') return true;
      if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
      return type === pattern;
    })
  );
}

function sameFile(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.type === b.type && a.lastModified === b.lastModified;
}

/** 选择与校验临时文件；上传、内容复核、预览 URL 与持久化由宿主负责。 */
export function UploadZone({
  label,
  description,
  icon = 'upload',
  files,
  defaultFiles = [],
  onFilesChange,
  onReject,
  accept = '',
  multiple = false,
  maxFiles,
  maxFileSize,
  disabled = false,
  busy = false,
  error,
  labels,
  className,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  ...rest
}: UploadZoneProps) {
  const [selected, setSelected] = useControllable<readonly File[]>(files, defaultFiles, (next) =>
    onFilesChange?.([...next]),
  );
  const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const choose = useRef<HTMLButtonElement>(null);
  const dragDepth = useRef(0);
  const initialFiles = useRef(defaultFiles);
  const id = useId();
  const blocked = disabled || busy;
  const describedBy =
    [rest['aria-describedby'], description ? id + '-hint' : '', error || rejections.length ? id + '-error' : '']
      .filter(Boolean)
      .join(' ') || undefined;

  useFormReset(input, () => {
    if (files === undefined) setSelected([...initialFiles.current]);
    setRejections([]);
    setDragging(false);
    dragDepth.current = 0;
  });
  useEffect(() => {
    if (blocked) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }, [blocked]);

  const receive = (incoming: readonly File[], directories = new Set<string>()) => {
    if (blocked || !incoming.length) return;
    const capacity =
      maxFiles === undefined || !Number.isFinite(maxFiles) ? Infinity : Math.max(0, Math.floor(maxFiles));
    const limit = multiple ? capacity : Math.min(1, capacity);
    const next = multiple ? [...selected] : [];
    const rejected: UploadRejection[] = [];
    for (const file of incoming) {
      let reason: UploadRejectionReason | undefined;
      if (directories.has(file.name)) reason = 'directory';
      else if (!matchesAccept(file, accept)) reason = 'type';
      else if (maxFileSize !== undefined && file.size > Math.max(0, maxFileSize)) reason = 'size';
      else if (selected.some((item) => sameFile(item, file)) || next.some((item) => sameFile(item, file)))
        reason = 'duplicate';
      else if (next.length >= limit) reason = 'count';
      if (reason) rejected.push({ file, reason });
      else next.push(file);
    }
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (next.length && (!multiple || next.length !== selected.length)) setSelected(next);
  };

  const update = (next: File[]) => {
    if (blocked) return;
    const focused = document.activeElement;
    setSelected(next);
    setRejections([]);
    queueMicrotask(() => {
      if (focused && !focused.isConnected) choose.current?.focus();
    });
  };
  const isFileDrag = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

  return (
    <div
      className={cx('ds-upload-zone', dragging && !blocked && 'is-dragging', className)}
      aria-busy={busy || undefined}
      {...rest}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        if (!event.defaultPrevented && isFileDrag(event) && !blocked) {
          dragDepth.current++;
          setDragging(true);
        }
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (event.defaultPrevented || !isFileDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = blocked ? 'none' : 'copy';
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDrop={(event) => {
        onDrop?.(event);
        setDragging(false);
        dragDepth.current = 0;
        if (event.defaultPrevented) return;
        event.preventDefault();
        const directories = new Set<string>();
        for (const item of Array.from(event.dataTransfer.items ?? [])) {
          try {
            const entry = item.webkitGetAsEntry?.();
            if (entry?.isDirectory) directories.add(entry.name);
          } catch {
            /* 浏览器不提供目录元数据时，仍由宿主复核内容。 */
          }
        }
        receive(Array.from(event.dataTransfer.files), directories);
      }}
    >
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={blocked}
        onChange={(event) => {
          try {
            receive(Array.from(event.currentTarget.files ?? []));
          } finally {
            event.currentTarget.value = '';
          }
        }}
      />
      <button
        ref={choose}
        type="button"
        className="ds-upload-zone-target"
        disabled={blocked}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error || rejections.length) || undefined}
        onClick={() => input.current?.click()}
      >
        <Icon name={icon} size={28} />
        <strong>{label}</strong>
        {description && <span id={id + '-hint'}>{description}</span>}
      </button>
      {selected.length > 0 && (
        <>
          <ul className="ds-upload-zone-files" aria-label={labels.fileList}>
            {selected.map((file, index) => (
              <li
                key={JSON.stringify([file.name, file.size, file.type, file.lastModified])}
                className="ds-upload-zone-file"
              >
                <Icon name="file-text" />
                <span className="ds-upload-zone-name" title={file.name}>
                  {file.name}
                </span>
                <IconButton
                  icon="x"
                  variant="quiet"
                  label={labels.remove(file)}
                  disabled={blocked}
                  onClick={() => update(selected.filter((_, i) => i !== index))}
                />
              </li>
            ))}
          </ul>
          <Button size="sm" variant="quiet" disabled={blocked} onClick={() => update([])}>
            {labels.clear}
          </Button>
        </>
      )}
      {busy && (
        <span className="ds-upload-zone-status" role="status">
          {labels.busy}
        </span>
      )}
      {(error || rejections.length > 0) && (
        <Notice id={id + '-error'} tone="error">
          {error || (
            <ul className="ds-upload-zone-errors">
              {rejections.map((rejection, index) => (
                <li key={index}>{labels.rejected(rejection)}</li>
              ))}
            </ul>
          )}
        </Notice>
      )}
    </div>
  );
}
