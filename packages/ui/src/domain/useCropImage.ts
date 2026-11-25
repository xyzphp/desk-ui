import { useEffect, useState } from 'react';
import { loadCropImage, type CropImageResource } from './cropImage';

export function useCropImage(source: Blob | null) {
  const [attempt, retry] = useState(0);
  const [state, setState] = useState<{ source: Blob | null; image?: CropImageResource; error?: Error }>({ source: null });
  useEffect(() => {
    const controller = new AbortController();
    let image: CropImageResource | undefined;
    setState({ source });
    if (source) void loadCropImage(source, controller.signal).then((loaded) => {
      if (controller.signal.aborted) { loaded.close(); return; }
      image = loaded; setState({ source, image });
    }, (error: Error) => { if (!controller.signal.aborted) setState({ source, error }); });
    return () => { controller.abort(); image?.close(); };
  }, [source, attempt]);
  return { ...(state.source === source ? state : { source }), retry: () => retry((value) => value + 1) };
}
