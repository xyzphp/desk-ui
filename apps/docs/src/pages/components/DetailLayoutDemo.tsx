import { useState } from 'react';
import {
  AppIcon, appGradients, Button, DetailLayout, DetailSection, ImageGallery, Notice, Panel, Property, PropertySheet, Tag, Timeline,
} from '@xyzos/desk-ui';
import lake from '../../assets/preview-lake.svg';
import coast from '../../assets/preview-coast.svg';

const versions = [
  { id: '1.2.0', title: '版本 1.2.0', time: '2026-11-20', content: '新增夏令时提示。' },
  { id: '1.1.0', title: '版本 1.1.0', time: '2026-10-08', content: '支持自定义城市名称。' },
];

export function DetailLayoutDemo() {
  const [installed, setInstalled] = useState(false);
  return (
    <DetailLayout
      media={<AppIcon icon="clock-3" color={appGradients.blue} size={72} />}
      title="世界时钟"
      description="在一张卡片里并排显示多个时区的当前时间。"
      meta={<><Tag color="blue">工具</Tag><Tag>时间</Tag></>}
      actions={installed
        ? <Tag tone="success">已安装</Tag>
        : <Button variant="primary" icon="download" onClick={() => setInstalled(true)}>安装</Button>}
      aside={<>
        <Panel title="权限">
          <span>只读取本地时间，不访问外部服务。</span>
        </Panel>
        <Panel title="信息">
          <PropertySheet density="compact">
            <Property label="标识"><code>world-clock</code></Property>
            <Property label="作者">示例作者</Property>
            <Property label="许可证">MIT</Property>
          </PropertySheet>
        </Panel>
      </>}
    >
      {installed && <Notice tone="success">已安装，可以在桌面添加卡片。</Notice>}
      <DetailSection title="介绍">
        <p>选择要关注的城市，卡片按顺序显示各地时间与日期差。</p>
      </DetailSection>
      <DetailSection title="截图">
        <ImageGallery label="世界时钟截图" items={[{ src: lake, alt: '卡片的浅色外观' }, { src: coast, alt: '卡片的深色外观' }]} />
      </DetailSection>
      <DetailSection title="版本">
        <Timeline label="版本记录" items={versions} />
      </DetailSection>
    </DetailLayout>
  );
}

export function DetailLayoutPlainDemo() {
  return (
    <DetailLayout title="没有信息栏的详情" description="不传 aside 时正文占满整行。" headingLevel={3}>
      <DetailSection title="说明">
        <p>小节标题自动使用下一级标题。</p>
      </DetailSection>
    </DetailLayout>
  );
}
