import { useState } from 'react';
import { Button, Field, Inline, ResizeHandle, ResizableSplit, Select, Stack, Textarea, Title } from '@xyzos/desk-ui';

export function ResizableSplitDemo() {
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [size, setSize] = useState(220);
  return <Stack gap="sm" style={{ height: '100%', minHeight: 0 }}>
    <Inline>
      <Select aria-label="排列方向" value={direction} onChange={(event) => setDirection(event.currentTarget.value as typeof direction)}>
        <option value="horizontal">左右分栏</option><option value="vertical">上下分栏</option>
      </Select>
      <Button onClick={() => setSize(220)}>恢复尺寸</Button><span>偏好尺寸：{Math.round(size)}px</span>
    </Inline>
    <div style={{ flex: 1, minHeight: 0 }}>
      <ResizableSplit
        direction={direction} size={size} onSizeChange={setSize} minSize={100} maxSize={420} minSecondarySize={120}
        primary={<Stack gap="md" style={{ padding: 16 }}><strong>资料目录</strong><Button>文档</Button><Button>图片</Button></Stack>}
      >
        <Stack gap="md" style={{ padding: 20 }}>
          <Title>内容区域</Title>
          <Field label="草稿"><Textarea defaultValue="调整分栏后，输入内容仍然保留。" /></Field>
        </Stack>
      </ResizableSplit>
    </div>
  </Stack>;
}

export function ResizeHandleDemo() {
  const [width, setWidth] = useState(160);
  return <Stack>
    <span>第一块宽度：{width}px；聚焦分隔条后使用方向键、Home / End。</span>
    <Inline wrap={false} align="stretch" style={{ height: 120 }}>
      <div style={{ width, flexShrink: 0, padding: 12, background: 'var(--hover)' }}>可调整区域</div>
      <ResizeHandle value={width} min={80} max={280} onValueChange={setWidth} />
      <div style={{ padding: 12, minWidth: 0 }}>拖动分隔条，按 Esc 取消当前拖动。</div>
    </Inline>
  </Stack>;
}
