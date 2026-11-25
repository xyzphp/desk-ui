import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useLatest } from '../foundation/useLatest';
import { cropGeometry, defaultCrop, normalizeCrop, validCropSize, type CropValue } from './cropGeometry';
import { exportCrop } from './cropImage';
import { useCropImage } from './useCropImage';
import type { ImageCropperProps } from './ImageCropper';

interface Drag { pointer: number; x: number; y: number; start: CropValue; scale: number }
export function useImageCropper(props: ImageCropperProps) {
  const output = props.outputSize ?? { width: 512, height: 512 };
  const valid = validCropSize(output);
  const resource = useCropImage(props.source);
  const [raw, setRaw] = useControllable(props.value, props.defaultValue ?? defaultCrop, props.onValueChange);
  const value = normalizeCrop(raw);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const exporting = useRef<AbortController | null>(null);
  const latest = useLatest(props);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const geometry = resource.image && valid ? cropGeometry(resource.image, output, value) : undefined;
  const blocked = !!props.disabled || busy || !geometry;
  const update = (next: CropValue) => { if (!blocked) { setRaw(normalizeCrop(next)); setFailed(false); } };
  const stop = (restore = false) => {
    const active = drag.current;
    drag.current = null; setDragging(false);
    if (active) {
      if (restore) setRaw(active.start);
      if (viewport.current?.hasPointerCapture?.(active.pointer)) viewport.current.releasePointerCapture(active.pointer);
    }
  };
  const stopRef = useLatest(stop);
  useLayoutEffect(() => {
    exporting.current?.abort(); exporting.current = null; drag.current = null;
    setBusy(false); setFailed(false); setDragging(false);
    return () => { exporting.current?.abort(); };
  }, [props.source, output.width, output.height]);
  useLayoutEffect(() => {
    if (props.disabled) { stopRef.current(); exporting.current?.abort(); exporting.current = null; setBusy(false); }
  }, [props.disabled, stopRef]);
  useEffect(() => { if (resource.error) latest.current.onError?.(resource.error); }, [resource.error, latest]);
  const confirm = async () => {
    if (blocked || !resource.image || exporting.current) return;
    const controller = new AbortController();
    exporting.current = controller; setBusy(true); setFailed(false);
    const quality = Number.isFinite(props.quality) ? Math.max(0, Math.min(1, props.quality!)) : .92;
    try {
      const result = await exportCrop(resource.image, output, value, props.mimeType ?? 'image/png', quality, controller.signal);
      if (!controller.signal.aborted) latest.current.onConfirm?.(result);
    } catch (error) {
      if (!controller.signal.aborted) { setFailed(true); latest.current.onError?.(error as Error); }
    } finally {
      if (exporting.current === controller) { exporting.current = null; if (!controller.signal.aborted) setBusy(false); }
    }
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (blocked || event.button !== 0 || !geometry) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, start: value, scale: output.width / rect.width };
    event.currentTarget.focus(); event.currentTarget.setPointerCapture?.(event.pointerId); setDragging(true); event.preventDefault();
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId || blocked || !geometry) return;
    update({ ...active.start,
      x: geometry.maxX ? active.start.x + (event.clientX - active.x) * active.scale / geometry.maxX : 0,
      y: geometry.maxY ? active.start.y + (event.clientY - active.y) * active.scale / geometry.maxY : 0,
    });
  };
  const up = (event: PointerEvent<HTMLDivElement>, restore = false) => { if (drag.current?.pointer === event.pointerId) stop(restore); };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing || blocked || !geometry || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && drag.current) { event.preventDefault(); event.stopPropagation(); stop(true); return; }
    const delta = event.shiftKey ? 24 : 8;
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault(); update({ ...value,
      x: geometry.maxX ? value.x + direction[0] * delta / geometry.maxX : 0,
      y: geometry.maxY ? value.y + direction[1] * delta / geometry.maxY : 0,
    });
  };
  const cancel = () => { stop(true); exporting.current?.abort(); exporting.current = null; setBusy(false); props.onCancel?.(); };
  return { output, valid, resource, value, viewport, geometry, blocked, busy, failed, dragging, update, stop, down, move, up, key, confirm, cancel };
}
