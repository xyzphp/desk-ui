import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { Field, Input } from '../primitives/Field';
import { Select } from '../primitives/Select';
import { DesktopIconGrid } from '../shell/DesktopIconGrid';
import { WidgetLayout } from '../shell/WidgetLayout';
import { DockWorkspace } from '../shell/DockWorkspace';
import { RangeSlider } from '../primitives/RangeSlider';
import { OTPInput } from '../primitives/OTPInput';
import { Rating } from '../primitives/Rating';
import { AppCard, AppCardGrid } from '../domain/AppCard';
import { DetailLayout, DetailSection } from '../layout/DetailLayout';

afterEach(cleanup);
async function expectAccessible(container: HTMLElement) {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    // jsdom 不提供真实排版与绘制；颜色对比须由验收方在真实浏览器独立检查。
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
}
describe('axe semantic contracts', () => {
  it('表单命名、必填、范围端点与只读评分', async () => {
    const { container } = render(
      <main>
        <Field label="名称">
          <Input required />
        </Field>
        <Select aria-label="状态" defaultValue="a">
          <option value="a">可用</option>
        </Select>
        <RangeSlider label="范围" />
        <OTPInput aria-label="验证码" />
        <Rating label="评分" readOnly defaultValue={3} />
      </main>,
    );
    await expectAccessible(container);
    fireEvent.click(screen.getByRole('combobox', { name: '状态' }));
    await expectAccessible(container);
  });
  it('桌面选择、移动手柄与卡片内容不形成嵌套交互', async () => {
    const { container } = render(
      <main>
        <DesktopIconGrid label="桌面" items={[{ id: 'files', label: '文件' }]} columns={2} rows={2} />
        <WidgetLayout label="卡片" items={[{ id: 'note', title: '便签', content: <input aria-label="便签正文" /> }]} />
        <DockWorkspace label="应用栏" items={[{ id: 'files', label: '文件' }]} onActivateWindow={() => {}} />
      </main>,
    );
    await expectAccessible(container);
    fireEvent.click(screen.getByRole('button', { name: '调整应用顺序' }));
    await expectAccessible(container);
  });
  it('应用卡片的整卡链接与底栏按钮不嵌套，详情标题层级连续', async () => {
    const { container } = render(
      <main>
        <h1>应用</h1>
        <AppCardGrid aria-label="应用列表">
          <AppCard
            name="世界时钟"
            summary="多个时区并排显示"
            href="#/clock"
            headingLevel={2}
            actions={<button type="button">安装</button>}
          />
          <AppCard name="服务状态" onOpen={() => {}} meta="版本 1.0.0" headingLevel={2} />
        </AppCardGrid>
        <DetailLayout title="世界时钟" aside={<p>信息</p>}>
          <DetailSection title="介绍">正文</DetailSection>
        </DetailLayout>
      </main>,
    );
    await expectAccessible(container);
  });
});
