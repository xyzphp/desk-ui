import { useState } from 'react';
import {
  DesktopCard,
  DesktopCardToolbar,
  DesktopNote,
  SegmentedControl,
  Text,
  type DesktopCardStyle,
} from '@desk/ui';

export function DesktopCardStyleDemo() {
  const [cardStyle, setCardStyle] = useState<DesktopCardStyle>('liquid');
  return (
    <div style={{ position: 'relative', zIndex: 1, padding: 20, width: 'min(100%, 420px)', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <DesktopCardToolbar title="桌面卡片" cardStyle={cardStyle} />
        <SegmentedControl
          aria-label="卡片样式"
          options={[
            { value: 'frosted', label: '毛玻璃' },
            { value: 'liquid', label: '液态玻璃' },
          ]}
          value={cardStyle}
          onChange={setCardStyle}
        />
      </div>
      <DesktopCard
        title="卡片外观预览"
        icon="sparkles"
        cardStyle={cardStyle}
        meta={cardStyle === 'liquid' ? '液态玻璃' : '毛玻璃'}
        footer={<Text size="sm" tone="muted">切换上方选项对比高光边框与景深效果</Text>}
      >
        <Text size="sm">支持在系统设置与文档站控制中心统一切换毛玻璃与液态玻璃。</Text>
      </DesktopCard>
      <DesktopNote
        title="随手记"
        cardStyle={cardStyle}
        placement="card"
        defaultValue="卡片形态便签同步切换玻璃材质；纸张形态保留原色。"
        inputProps={{ rows: 2 }}
      />
    </div>
  );
}
