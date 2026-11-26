import { ImageGallery } from '@xyzos/desk-ui';
import lake from '../../assets/preview-lake.svg';
import coast from '../../assets/preview-coast.svg';

const images = [
  { src: lake, alt: '群山环绕的蓝色湖泊', title: '山间湖泊' },
  { src: coast, alt: '落日下的海岸', title: '海边日落' },
  { src: lake, alt: '湖泊的另一张示例图', title: '湖泊（二）' },
];

export function ImageGalleryDemo() {
  return <ImageGallery label="示例截图" items={images} />;
}
