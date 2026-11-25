import { useEffect, useState } from 'react';
import { Field, ImageCropper, Inline, Select, Stack, Text, UploadZone, type ImageCropResult, type UploadZoneLabels } from '@xyzos/desk-ui';

const uploadLabels: UploadZoneLabels = {
  fileList: '待裁剪图片', remove: (file) => `移除 ${file.name}`, clear: '清空图片', busy: '处理中',
  rejected: ({ file }) => `无法使用 ${file.name}，请选择一张不超过 15 MB 的 PNG、JPEG 或 WebP 图片。`,
};

export function ImageCropperDemo() {
  const [files, setFiles] = useState<readonly File[]>([]);
  const [format, setFormat] = useState('square');
  const [result, setResult] = useState<ImageCropResult>();
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!result) { setUrl(''); return; }
    const next = URL.createObjectURL(result.blob); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [result]);
  const file = files[0] ?? null;
  return <Stack gap="lg">
    <UploadZone files={files} onFilesChange={(next) => { setFiles(next); setResult(undefined); }} multiple={false}
      accept="image/png,image/jpeg,image/webp" maxFileSize={15 * 1024 * 1024} labels={uploadLabels} label="选择一张本地图片进行裁剪" />
    <Field label="输出规格"><Select value={format} onChange={(event) => setFormat(event.currentTarget.value)}>
      <option value="square">方形 · 500 × 500</option><option value="banner">横幅 · 900 × 383</option>
    </Select></Field>
    <ImageCropper key={`${file?.name}-${file?.lastModified}-${format}`} label="图片裁剪区域" source={file}
      outputSize={format === 'square' ? { width: 500, height: 500 } : { width: 900, height: 383 }}
      mimeType="image/png" onConfirm={setResult} onCancel={() => setFiles([])} />
    {result && url && <Inline align="center">
      <img src={url} alt="裁剪结果" width={120} height={120} style={{ objectFit: 'contain' }} />
      <Text role="status">{result.width} × {result.height}，{Math.ceil(result.blob.size / 1024)} KB；结果只保存在本页内存。</Text>
    </Inline>}
  </Stack>;
}
