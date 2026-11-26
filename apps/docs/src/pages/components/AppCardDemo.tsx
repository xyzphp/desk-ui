import { useState } from 'react';
import { AppCard, AppCardGrid, appGradients, Button, Notice, Tag } from '@xyzos/desk-ui';

const apps = [
  { id: 'clock', name: '世界时钟', summary: '在一张卡片里并排显示多个时区的当前时间。', icon: 'clock-3', color: appGradients.blue },
  { id: 'weather', name: '天气速览', summary: '按城市查看今天和未来三天的天气。', icon: 'sun', color: appGradients.orange },
  { id: 'translate', name: '划词翻译', summary: '选中文字后翻译成常用语言，支持复制结果。', icon: 'languages', color: appGradients.teal },
] as const;

export function AppCardGridDemo() {
  const [opened, setOpened] = useState('');
  const [installed, setInstalled] = useState<string[]>(['weather']);
  return (
    <>
      {opened && <Notice>已打开「{opened}」的详情</Notice>}
      <AppCardGrid aria-label="示例应用">
        {apps.map((app) => {
          const done = installed.includes(app.id);
          return (
            <AppCard
              key={app.id}
              name={app.name}
              summary={app.summary}
              icon={{ icon: app.icon, color: app.color }}
              tags={<>
                <Tag color="blue">工具</Tag>
                {done && <Tag tone="success">已安装</Tag>}
              </>}
              meta="版本 1.2.0"
              onOpen={() => setOpened(app.name)}
              actions={!done && (
                <Button size="sm" variant="primary" onClick={() => setInstalled([...installed, app.id])}>安装</Button>
              )}
            />
          );
        })}
      </AppCardGrid>
    </>
  );
}

export function AppCardStatesDemo() {
  return (
    <AppCardGrid aria-label="状态示例">
      <AppCard name="链接卡片" summary="提供 href 时整卡是一个链接，适合静态站点的路由。" href="#/app-card" />
      <AppCard
        name="仅展示"
        summary="不提供 href 和 onOpen 时卡片只展示内容，名称首字作为图标。"
        tags={<Tag tone="muted">已下架</Tag>}
        meta="版本 0.9.0"
      />
    </AppCardGrid>
  );
}
