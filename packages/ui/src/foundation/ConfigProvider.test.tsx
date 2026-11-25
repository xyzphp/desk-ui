import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigProvider, useLabels } from './ConfigProvider';
import { mergeLabels, zhCN } from './locale';
import { InputNumber } from '../primitives/InputNumber';
import { PasswordInput } from '../primitives/PasswordInput';
import { Combobox, Select } from '../primitives/Select';
import { Chip } from '../primitives/Chip';
import { ResizeHandle } from '../layout/ResizeHandle';
import { Tree } from '../layout/Tree';
import { Popconfirm } from '../primitives/Popconfirm';
import { ImageCropper } from '../domain/ImageCropper';
import { MarkdownEditor } from '../domain/MarkdownEditor';
import { SortableList } from '../layout/SortableList';
import { CheckboxGroup } from '../primitives/CheckboxGroup';
import { ColorPicker } from '../primitives/ColorPicker';
import { FormActions } from '../layout/Form';
import { Timeline } from '../layout/Timeline';
import { AvatarGroup } from '../primitives/AvatarGroup';
import { Result } from '../primitives/Result';
import { LoadingOverlay } from '../primitives/LoadingOverlay';
import { RangeSlider } from '../primitives/RangeSlider';
import { OTPInput } from '../primitives/OTPInput';
import { Rating } from '../primitives/Rating';
import { MonthCalendar } from '../layout/MonthCalendar';
import { LockScreen } from '../shell/LockScreen';
import { CommandPalette } from '../shell/CommandPalette';
import { Launchpad } from '../shell/Launchpad';
import { NotificationCenter } from '../shell/NotificationCenter';
import { WindowSwitcher } from '../shell/WindowSwitcher';
import { DesktopIconGrid } from '../shell/DesktopIconGrid';
import { DockWorkspace } from '../shell/DockWorkspace';

describe('ConfigProvider', () => {
  it('第十批共用网格、框选和应用栏文案', () => {
    render(<ConfigProvider labels={{ selectionArea: { count: (count) => `Selected ${count}` },
      gridLayout: { instructions: 'Drag to move' }, dockWorkspace: { reorder: 'Reorder apps' } }}>
      <DesktopIconGrid label="desktop" items={[{ id: 'a', label: 'Alpha' }]} />
      <DockWorkspace label="dock" items={[]} onActivateWindow={() => {}} />
    </ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAccessibleDescription('Drag to move');
    expect(screen.getByText('Selected 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder apps' })).toBeInTheDocument();
  });
  it('第九批桌面内容视图消费集中配置', () => {
    render(<ConfigProvider labels={{ lockScreen: { unlock: 'Unlock' }, commandPalette: { search: 'Find commands' },
      launchpad: { empty: 'No apps' }, notificationCenter: { empty: 'No history' }, windowSwitcher: { empty: 'No windows' } }}>
      <LockScreen label="lock" name="Example" time="15:42" onUnlock={() => {}} />
      <CommandPalette label="commands" items={[]} onExecute={() => {}} />
      <Launchpad label="apps" items={[]} onLaunch={() => {}} />
      <NotificationCenter label="history" items={[]} onActivate={() => {}} />
      <WindowSwitcher label="windows" items={[]} onActivate={() => {}} />
    </ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Unlock' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Find commands' })).toBeInTheDocument();
    expect(screen.getByText('No apps')).toBeInTheDocument();
    expect(screen.getByText('No history')).toBeInTheDocument();
    expect(screen.getByText('No windows')).toBeInTheDocument();
  });
  it('第八批的端点、验证码、评分与整月日历读取集中配置', () => {
    render(<ConfigProvider labels={{ rangeSlider: { lower: 'From', upper: 'To' }, otpInput: { input: 'Code' },
      rating: { score: (value) => `Score ${value}` }, monthCalendar: { next: 'Next month' } }}>
      <RangeSlider label="range" /><OTPInput /><Rating label="rating" />
      <MonthCalendar label="calendar" today="2026-11-05" />
    </ConfigProvider>);
    expect(screen.getByRole('slider', { name: 'range From' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'range To' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Code' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Score 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
  });
  it('第七批读取分组配置，嵌套结果标题保留未覆盖项', () => {
    render(<ConfigProvider labels={{ checkboxGroup: { empty: 'No choices' }, colorPicker: { choose: 'Pick color' },
      form: { actions: 'Form actions' }, timeline: { empty: 'No events' }, avatarGroup: { more: (count) => `More ${count}` },
      result: { titles: { success: 'Done' } }, loadingOverlay: { loading: 'Working' } }}>
      <CheckboxGroup label="choices" options={[]} />
      <ColorPicker aria-label="color" />
      <FormActions />
      <Timeline label="events" items={[]} />
      <AvatarGroup label="members" items={[{ id: 'a', name: 'Alpha' }]} max={0} />
      <Result status="success" /><Result status="error" />
      <LoadingOverlay loading><span>Content</span></LoadingOverlay>
    </ConfigProvider>);
    expect(screen.getByText('No choices')).toBeInTheDocument();
    expect(screen.getByLabelText('Pick color')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Form actions' })).toBeInTheDocument();
    expect(screen.getByText('No events')).toBeInTheDocument();
    expect(screen.getByText('+1')).toHaveAccessibleName('More 1');
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '操作失败' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Working');
  });
  it('第六批裁剪、编辑器与排序消费配置，不需要业务适配器', () => {
    render(<ConfigProvider labels={{ imageCropper: { empty: 'Choose image' }, markdownEditor: { placeholder: 'Write here' },
      sortableList: { next: (label) => `Move ${label}` } }}>
      <ImageCropper label="crop" source={null} />
      <MarkdownEditor aria-label="editor" />
      <SortableList label="sort" items={[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]} onOrderChange={() => {}} />
    </ConfigProvider>);
    expect(screen.getByText('Choose image')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'editor' })).toHaveAttribute('placeholder', 'Write here');
    expect(screen.getByRole('button', { name: 'Move Alpha' })).toBeEnabled();
  });
  it('第五批搜索、通用树和气泡确认消费配置，局部覆盖仍优先', () => {
    render(<ConfigProvider labels={{ searchSelect: { open: 'Expand', clear: 'Clear' }, tree: { empty: 'No nodes' },
      popconfirm: { confirm: 'Remove', cancel: 'Keep' } }}>
      <Combobox aria-label="pick" defaultValue="a"><option value="a">Alpha</option></Combobox>
      <Tree label="tree" nodes={[]} />
      <Popconfirm label="action" title="Confirm?" open onOpenChange={() => {}} onConfirm={() => {}} labels={{ confirm: 'Delete' }} />
    </ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Expand：pick' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear：pick' })).toBeInTheDocument();
    expect(screen.getByText('No nodes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
  it('第四批的文本令牌和分隔条消费配置及函数文案', () => {
    render(<ConfigProvider labels={{ chip: { remove: (text) => `Remove ${text}` }, resizeHandle: { label: 'Resize' } }}>
      <Chip onRemove={() => {}}>Example</Chip><ResizeHandle value={200} onValueChange={() => {}} />
    </ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Remove Example' })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Resize' })).toHaveAttribute('aria-valuenow', '200');
  });
  it('嵌套按分组合并，组件覆盖优先，不修改默认对象', () => {
    render(<ConfigProvider labels={{ inputNumber: { increase: 'Increase' }, passwordInput: { show: 'Show' } }}>
      <ConfigProvider labels={{ inputNumber: { decrease: 'Decrease' } }}>
        <InputNumber aria-label="number" />
        <PasswordInput aria-label="secret" labels={{ show: '查看此项' }} />
      </ConfigProvider>
    </ConfigProvider>);
    expect(screen.getByLabelText('Increase')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument();
    expect(screen.getByLabelText('查看此项')).toBeInTheDocument();
    expect(zhCN.inputNumber.increase).toBe('增加数值');
  });
  it('数组与函数整体替换，嵌套颜色保留未覆盖的键', () => {
    const labels = mergeLabels<typeof zhCN>(zhCN, {
      dateTimePicker: { weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], year: (year) => String(year) },
      desktopNote: { colors: { blue: 'Blue' } },
    });
    expect(labels.dateTimePicker.year(2026)).toBe('2026');
    expect(labels.dateTimePicker.weekdays[0]).toBe('M');
    expect(labels.desktopNote.colors.yellow).toBe('浅黄');
    expect(labels.desktopNote.colors.blue).toBe('Blue');
  });
  it('已有选择器消费配置，显式占位文字最高优先，配置变化重新渲染', () => {
    function Probe() { return <span>{useLabels('modal').close}</span>; }
    const view = (placeholder?: string) => <ConfigProvider labels={{ select: { placeholder: 'Choose' }, modal: { close: 'Close' } }}>
      <Select aria-label="selection" placeholder={placeholder}><option value="" /></Select><Probe />
    </ConfigProvider>;
    const { rerender } = render(view());
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose');
    expect(screen.getByText('Close')).toBeInTheDocument();
    rerender(view('指定占位'));
    expect(screen.getByRole('combobox')).toHaveTextContent('指定占位');
  });
});
