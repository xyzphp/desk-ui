import { useCallback, useRef, useState } from 'react';
import type { WindowGeometry } from '@desk/ui';

export interface DocWindow {
  /** 一个分类对应一个窗口（单例）。 */
  id: string;
  pageId: string;
  geometry: WindowGeometry;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

const WIDTH = 1100;
const HEIGHT = 720;
const NARROW = 700;

function initialGeometry(count: number): WindowGeometry {
  const areaWidth = window.innerWidth;
  const areaHeight = window.innerHeight - 100;
  const width = Math.min(WIDTH, Math.max(360, areaWidth - 40));
  const height = Math.min(HEIGHT, Math.max(240, areaHeight - 40));
  const offset = (count % 6) * 26;
  return { x: Math.max(10, (areaWidth - width) / 2 + offset - 60), y: Math.max(10, (areaHeight - height) / 2 + offset - 30), width, height };
}

/** 当前焦点窗口 = 未最小化窗口中层级最高者；不单独保存，避免状态不一致。 */
export function activeWindowId(list: DocWindow[]): string | null {
  const visible = list.filter((w) => !w.minimized);
  return visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null;
}

/** 窗口管理：单例窗口、层级、最小化 / 最大化。窄屏下新窗口默认最大化。 */
export function useWindows() {
  const [windows, setWindows] = useState<DocWindow[]>([]);
  const top = useRef(0);

  const open = useCallback((id: string, pageId: string) => {
    const z = ++top.current;
    setWindows((current) => {
      const existing = current.find((w) => w.id === id);
      if (existing) return current.map((w) => (w.id === id ? { ...w, pageId, z, minimized: false } : w));
      return [...current, { id, pageId, geometry: initialGeometry(current.length), z, minimized: false, maximized: window.innerWidth < NARROW }];
    });
  }, []);

  const focus = useCallback((id: string) => {
    const z = ++top.current;
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, z } : w)));
  }, []);

  const close = useCallback((id: string) => setWindows((current) => current.filter((w) => w.id !== id)), []);

  const minimize = useCallback((id: string) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, minimized: true } : w))), []);

  const toggleMaximize = useCallback((id: string) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))), []);

  const move = useCallback((id: string, geometry: WindowGeometry) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, geometry } : w))), []);

  const setPage = useCallback((id: string, pageId: string) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, pageId } : w))), []);

  const closeAll = useCallback(() => setWindows([]), []);

  return { windows, activeId: activeWindowId(windows), open, focus, close, minimize, toggleMaximize, move, setPage, closeAll };
}
