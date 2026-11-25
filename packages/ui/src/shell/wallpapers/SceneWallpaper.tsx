import { lazy, Suspense } from 'react';
import type { SceneWallpaperName } from './names';

// 场景按需加载：选中时才下载对应的组件代码与画作，加载完成前由 .ds-wp-* 的底图显示同一张画。
const scenes = {
  aquarium: lazy(() => import('./AquariumScene').then(({ AquariumScene }) => ({ default: AquariumScene }))),
  forest: lazy(() => import('./ForestScene').then(({ ForestScene }) => ({ default: ForestScene }))),
  grassland: lazy(() => import('./GrasslandScene').then(({ GrasslandScene }) => ({ default: GrasslandScene }))),
  galaxy: lazy(() => import('./GalaxyScene').then(({ GalaxyScene }) => ({ default: GalaxyScene }))),
};

export function SceneWallpaper({ name, animated }: { name: SceneWallpaperName; animated: boolean }) {
  const Scene = scenes[name];
  return (
    <Suspense fallback={null}>
      <Scene animated={animated} />
    </Suspense>
  );
}
