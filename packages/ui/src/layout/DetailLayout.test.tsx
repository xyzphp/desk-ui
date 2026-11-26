import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailLayout, DetailSection } from './DetailLayout';
import { Panel, Property, PropertySheet } from './Layout';

describe('DetailLayout / DetailSection', () => {
  it('标题命名整页，正文小节自动使用下一级标题', () => {
    render(
      <DetailLayout
        title="世界时钟"
        description="多个时区并排显示"
        meta={<span>工具</span>}
        actions={<button type="button">安装</button>}
        headingLevel={1}
      >
        <DetailSection title="介绍">正文</DetailSection>
      </DetailLayout>,
    );
    expect(screen.getByRole('article', { name: '世界时钟' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '世界时钟' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '介绍' })).toHaveTextContent('正文');
    expect(screen.getByRole('heading', { level: 2, name: '介绍' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '安装' })).toBeInTheDocument();
  });

  it('默认二级标题；信息栏与紧凑属性表按顺序渲染名称和值', () => {
    render(
      <DetailLayout
        title="服务状态"
        aside={
          <Panel title="信息">
            <PropertySheet density="compact" data-testid="facts">
              <Property label="许可证">MIT</Property>
              <Property label="作者">示例作者</Property>
            </PropertySheet>
          </Panel>
        }
      >
        <DetailSection title="版本">1.0.0</DetailSection>
      </DetailLayout>,
    );
    expect(screen.getByRole('heading', { level: 2, name: '服务状态' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '版本' })).toBeInTheDocument();
    expect(screen.getByTestId('facts')).toHaveTextContent('许可证MIT作者示例作者');
  });
});
