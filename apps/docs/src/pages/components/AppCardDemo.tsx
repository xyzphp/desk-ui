import { useState } from 'react';
import { AppCard, AppCardGrid, appGradients, Button, IconButton, Notice, Tag } from '@xyzos/desk-ui';

const apps = [
  {
    id: 'articles',
    name: '文章',
    summary: '文章写作与公开阅读，支持三级分类与标签、封面裁剪与内容整理。',
    icon: 'file-text',
    color: appGradients.blue,
    category: '内容',
  },
  {
    id: 'monitor',
    name: '服务监控',
    summary: '多节点运行状态与用量监控，桌面卡片支持独立切换观测目标。',
    icon: 'chart-line',
    color: appGradients.purple,
    category: '监控',
  },
  {
    id: 'reader',
    name: 'Markdown 阅读器',
    summary: '纯净的文档预览与目录导航，支持代码高亮和快速定位。',
    icon: 'book-open',
    color: appGradients.teal,
    category: '文档',
  },
  {
    id: 'todo',
    name: '待办协作',
    summary: '团队共享待办看板，支持应用内权限分工与个人置顶。',
    icon: 'check-square',
    color: appGradients.orange,
    category: '协作',
  },
] as const;

export function AppCardGridDemo() {
  const [opened, setOpened] = useState('');
  const [installed, setInstalled] = useState<string[]>(['articles', 'monitor']);
  return (
    <>
      {opened && <Notice>已打开「{opened}」的详情</Notice>}
      <AppCardGrid aria-label="示例应用">
        {apps.map((app) => {
          const done = installed.includes(app.id);
          return (
            <AppCard
              key={app.id}
              tintSeed={app.id}
              revealActions={!done}
              name={app.name}
              summary={app.summary}
              icon={{ icon: app.icon, color: app.color }}
              tags={
                <Tag shape="pill" color="blue">
                  {app.category}
                </Tag>
              }
              onOpen={() => setOpened(app.name)}
              actions={
                done ? (
                  <Button size="sm" disabled>
                    已安装
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={() => setInstalled([...installed, app.id])}>
                    安装
                  </Button>
                )
              }
            />
          );
        })}
      </AppCardGrid>
    </>
  );
}

export function AppCardStatesDemo() {
  const [notice, setNotice] = useState('');
  return (
    <>
      {notice && <Notice>{notice}</Notice>}
      <AppCardGrid aria-label="状态与渐变示例">
        <AppCard
          name="链接卡片"
          summary="提供 href 时整卡是一个链接，适合静态商店站点的目录页。"
          tint="blue"
          tags={
            <Tag shape="pill" color="blue">
              工具
            </Tag>
          }
          href="#/app-card"
        />
        <AppCard
          name="带操作卡片"
          summary="通过 headerAction 放置快捷图标按钮，常显底栏按钮用于已安装管理场景。"
          tint="rose"
          headerAction={
            <IconButton icon="ellipsis" label="更多操作" onClick={() => setNotice('触发了右上角快捷操作')} />
          }
          tags={
            <>
              <Tag tone="success" shape="pill" dot>
                已启用
              </Tag>
              <Tag shape="pill" color="purple">
                混合
              </Tag>
            </>
          }
          onOpen={() => setNotice('打开了详情')}
          actions={
            <>
              <Button size="sm" variant="primary" onClick={() => setNotice('打开应用')}>
                打开
              </Button>
              <Button size="sm" variant="quiet" onClick={() => setNotice('管理应用')}>
                管理
              </Button>
            </>
          }
        />
        <AppCard
          name="暖杏渐变"
          summary="可通过 tint 显式指定渐变方向，或保持 auto 由页面随机混合。"
          tint="amber"
          tags={
            <Tag tone="info" shape="pill" dot>
              有更新
            </Tag>
          }
        />
        <AppCard
          name="中性仅展示"
          summary="指定 tint='neutral' 为珍珠浅底；无 href / onOpen 时仅展示内容，名称首字作为图标。"
          tint="neutral"
          tags={
            <Tag tone="muted" shape="pill" dot>
              已下架
            </Tag>
          }
          meta="demo-app"
        />
      </AppCardGrid>
    </>
  );
}
