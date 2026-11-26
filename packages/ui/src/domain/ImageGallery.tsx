import { useState, type ComponentProps } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import type { LabelOverrides } from '../foundation/locale';
import { safeImage } from '../foundation/safeImage';
import { ImagePreview, type ImagePreviewItem, type ImagePreviewLabels } from './ImagePreview';

export interface ImageGalleryLabels {
  /** 缩略图按钮的可访问名称。 */
  open: (alt: string) => string;
}

export interface ImageGalleryProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /** 缩略图列表与放大预览共用的名称。 */
  label: string;
  items: readonly ImagePreviewItem[];
  labels?: LabelOverrides<ImageGalleryLabels>;
  /** 透传给 ImagePreview 的文案覆盖。 */
  previewLabels?: LabelOverrides<ImagePreviewLabels>;
}

/** 横向滚动的缩略图条，点击后用 ImagePreview 放大浏览；不可显示的地址会被跳过，没有图片时不渲染。 */
export function ImageGallery({ label, items, labels: overrides, previewLabels, className, ...rest }: ImageGalleryProps) {
  const labels = useLabels('imageGallery', overrides);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const shown = items.filter((item) => safeImage(item.src));
  if (shown.length === 0) return null;
  return (
    <>
      <ul role="list" aria-label={label} {...rest} className={cx('ds-image-gallery', className)}>
        {shown.map((item, position) => (
          <li key={`${position}:${item.src}`}>
            <button
              type="button"
              className="ds-image-gallery-item"
              aria-label={labels.open(item.alt)}
              onClick={() => {
                setIndex(position);
                setOpen(true);
              }}
            >
              <img src={item.src} alt="" loading="lazy" referrerPolicy="no-referrer" draggable={false} />
            </button>
          </li>
        ))}
      </ul>
      <ImagePreview
        open={open}
        label={label}
        items={shown}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setOpen(false)}
        labels={previewLabels}
        zoomable
      />
    </>
  );
}
