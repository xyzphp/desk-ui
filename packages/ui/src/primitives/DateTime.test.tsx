import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  DateRangePicker,
  DateRangeField,
  TimeRangePicker,
  NumberRangePicker,
} from './DateTime';
import { ConfigProvider } from '../foundation/ConfigProvider';
import { enUS } from '../foundation/localeEnUS';
import { localToday } from '../foundation/civilDate';
import { Field } from './Field';

const labels = { start: '开始', end: '结束', separator: '至', invalidOrder: '结束不能早于开始' };
const panelLabels = { rangeStartHint: '请挑开始日期', rangeEndHint: '开始已选，请挑结束日期' };

describe('日期与时间输入', () => {
  it('关联 Field 标签和错误，透传原生约束、ref 与标准日期回调', () => {
    const change = vi.fn();
    const ref = { current: null as HTMLInputElement | null };
    render(
      <Field label="计划日期" error="需要有效日期">
        <DatePicker ref={ref} min="2026-01-01" max="2026-12-31" required onValueChange={change} />
      </Field>,
    );
    const input = screen.getByLabelText('计划日期');
    expect(input).toBe(ref.current);
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('需要有效日期');
    fireEvent.change(input, { target: { value: '2026-11-04' } });
    expect(change).toHaveBeenCalledWith('2026-11-04');
  });

  it('保留秒级时间、墙上时间与原生表单重置，不进行时区转换', () => {
    render(
      <form aria-label="时间表单">
        <TimePicker aria-label="时间" name="time" step={1} defaultValue="09:30:15" />
        <DateTimePicker aria-label="日期时间" name="datetime" step={1} defaultValue="2026-11-04T09:30:15" />
      </form>,
    );
    const time = screen.getByLabelText('时间');
    fireEvent.change(time, { target: { value: '12:00:01' } });
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('datetime')).toBe('2026-11-04T09:30:15');
    act(() => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(time).toHaveValue('09:30:15');
  });
});

describe('主题选择面板', () => {
  it('打开不写值，日期选中通过真实原生事件更新并回调一次，保留边界与焦点返回', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const native = vi.fn();
    render(
      <DatePicker
        aria-label="日期"
        name="date"
        defaultValue="2026-11-04"
        min="2026-11-03"
        max="2026-11-06"
        onValueChange={change}
        onChange={native}
      />,
    );
    const trigger = screen.getByRole('button', { name: '打开选择面板' });
    await user.click(trigger);
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: '2026年11月02日' })).toBeDisabled();
    await user.click(screen.getByRole('gridcell', { name: '2026年11月05日' }));
    expect(screen.getByLabelText('日期')).toHaveValue('2026-11-05');
    expect(change).toHaveBeenCalledExactlyOnceWith('2026-11-05');
    expect(native).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('键盘移动日历但不自动提交，Esc 返回触发器且不触发外层窗口', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const outside = vi.fn();
    render(
      <div onKeyDown={outside}>
        <DatePicker aria-label="日期" defaultValue="2026-11-04" onValueChange={change} />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: '打开选择面板' });
    await user.click(trigger);
    fireEvent.keyDown(screen.getByRole('gridcell', { name: '2026年11月04日' }), { key: 'ArrowRight' });
    expect(screen.getByRole('gridcell', { name: '2026年11月05日' })).toHaveFocus();
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveAttribute('aria-selected', 'true');
    outside.mockClear();
    await user.keyboard('{Escape}');
    expect(outside).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it('时间列只编辑面板草稿，确认才写入，取消保留原值，步进失配时禁用确定', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <TimePicker aria-label="时间" defaultValue="09:30" min="08:00" max="18:00" step={900} onValueChange={change} />,
    );
    await user.click(screen.getByRole('button', { name: '打开选择面板' }));
    await user.click(within(screen.getByRole('listbox', { name: '时' })).getByRole('option', { name: '10' }));
    await user.click(within(screen.getByRole('listbox', { name: '分' })).getByRole('option', { name: '07' }));
    expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
    expect(screen.getByLabelText('时间')).toHaveValue('09:30');
    expect(change).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('listbox', { name: '分' })).getByRole('option', { name: '45' }));
    await user.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('10:45');
    await user.click(screen.getByRole('button', { name: '打开选择面板' }));
    await user.click(within(screen.getByRole('listbox', { name: '时' })).getByRole('option', { name: '11' }));
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.getByLabelText('时间')).toHaveValue('10:45');
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('日期范围在同一面板级联勾选：起点草稿高亮，悬停预览区间，第二次点击提交完整范围', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '2026-11-06']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[1]!);
    expect(screen.getByRole('status')).toHaveTextContent(panelLabels.rangeStartHint);
    expect(screen.getByRole('gridcell', { name: '2026年11月06日' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: '2026年11月05日' })).toHaveAttribute('data-in-range', 'true');
    await user.click(screen.getByRole('gridcell', { name: '2026年11月03日' }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '2026年11月03日' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(panelLabels.rangeEndHint);
    fireEvent.pointerEnter(screen.getByRole('gridcell', { name: '2026年11月05日' }));
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveAttribute('data-preview', 'true');
    fireEvent.pointerLeave(screen.getByRole('grid'));
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveAttribute('data-preview', 'false');
    await user.click(screen.getByRole('gridcell', { name: '2026年11月05日' }));
    expect(change).toHaveBeenLastCalledWith(['2026-11-03', '2026-11-05']);
    expect(screen.getByLabelText('开始')).toHaveValue('2026-11-03');
    expect(screen.getByLabelText('结束')).toHaveValue('2026-11-05');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('级联面板保留键盘操作：Enter 勾选起点，方向键移动后 Enter 提交', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '2026-11-06']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '2026年11月04日' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('gridcell', { name: '2026年11月04日' }), { key: 'ArrowRight' });
    expect(screen.getByRole('gridcell', { name: '2026年11月05日' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenLastCalledWith(['2026-11-04', '2026-11-05']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('级联第二次点击更早日期时重置起点，不产生反序提交', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '2026-11-06']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    await user.click(screen.getByRole('gridcell', { name: '2026年11月08日' }));
    await user.click(screen.getByRole('gridcell', { name: '2026年11月03日' }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '2026年11月03日' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: '2026年11月08日' })).toHaveAttribute('aria-selected', 'false');
    await user.click(screen.getByRole('gridcell', { name: '2026年11月05日' }));
    expect(change).toHaveBeenLastCalledWith(['2026-11-03', '2026-11-05']);
  });

  it('Esc 关闭面板丢弃级联草稿，重开后重新从起点开始', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '2026-11-06']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    await user.click(screen.getByRole('gridcell', { name: '2026年11月08日' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByLabelText('开始')).toHaveValue('2026-11-04');
    expect(screen.getByLabelText('结束')).toHaveValue('2026-11-06');
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    expect(screen.getByRole('status')).toHaveTextContent(panelLabels.rangeStartHint);
  });

  it('级联面板的今天按钮参与勾选，把当天作为终点提交', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-01-10', '2026-01-12']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    await user.click(screen.getByRole('gridcell', { name: '2026年01月08日' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '今天' }));
    expect(change).toHaveBeenLastCalledWith(['2026-01-08', localToday()]);
  });

  it('级联面板的清空按钮同时清除两端并关闭面板', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangePicker
        label="日期范围"
        labels={labels}
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '2026-11-06']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '清空' }));
    expect(change).toHaveBeenLastCalledWith(['', '']);
    expect(screen.getByLabelText('开始')).toHaveValue('');
    expect(screen.getByLabelText('结束')).toHaveValue('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('内联日期范围字段同样使用级联勾选', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <DateRangeField
        label="计划"
        pickerLabels={panelLabels}
        defaultValue={['2026-11-04', '']}
        onValueChange={change}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: '打开选择面板' })[0]!);
    await user.click(screen.getByRole('gridcell', { name: '2026年11月04日' }));
    await user.click(screen.getByRole('gridcell', { name: '2026年11月06日' }));
    expect(change).toHaveBeenLastCalledWith(['2026-11-04', '2026-11-06']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('日期时间范围在同一双月面板跨月选日期和两端时间，确认一次提交，Esc 放弃反序草稿', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <form aria-label="日期时间筛选">
        <DateRangeField
          label="日志时间"
          labels={labels}
          type="datetime-local"
          dateFormat="iso"
          startName="from"
          endName="to"
          required
          defaultValue={['2026-11-04T08:30', '2026-11-06T18:45']}
          onValueChange={change}
        />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: '开始: 2026-11-04 08:30' });
    await user.click(trigger);
    const panel = within(screen.getByRole('dialog'));
    const [november, december] = panel.getAllByRole('grid');
    await user.click(within(november!).getByRole('gridcell', { name: '2026年11月28日' }));
    expect(panel.getByRole('button', { name: '确定' })).toBeDisabled();
    await user.click(within(december!).getByRole('gridcell', { name: '2026年12月02日' }));
    const start = within(panel.getByRole('group', { name: '开始' }));
    const end = within(panel.getByRole('group', { name: '结束' }));
    await user.click(within(start.getByRole('listbox', { name: '时' })).getByRole('option', { name: '10' }));
    await user.click(within(end.getByRole('listbox', { name: '分' })).getByRole('option', { name: '15' }));
    expect(change).not.toHaveBeenCalled();
    await user.click(panel.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(['2026-11-28T10:30', '2026-12-02T18:15']);
    expect(trigger).toHaveFocus();
    const form = screen.getByRole('form') as HTMLFormElement;
    expect([...new FormData(form)]).toEqual([
      ['from', '2026-11-28T10:30'],
      ['to', '2026-12-02T18:15'],
    ]);

    await user.click(trigger);
    const reopened = within(screen.getByRole('dialog'));
    const day = within(reopened.getAllByRole('grid')[0]!).getByRole('gridcell', { name: '2026年11月28日' });
    await user.click(day);
    await user.click(day);
    const endTime = within(reopened.getByRole('group', { name: '结束' }));
    await user.click(within(endTime.getByRole('listbox', { name: '时' })).getByRole('option', { name: '09' }));
    expect(reopened.getByRole('button', { name: '确定' })).toBeDisabled();
    expect(reopened.getByRole('status')).toHaveTextContent(labels.invalidOrder);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(change).toHaveBeenCalledTimes(1);
    expect(new FormData(form).get('to')).toBe('2026-12-02T18:15');
  });

  it('只读和禁用不能展开；非受控重置关闭面板并恢复显示，不新增原生 change 回调', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <DatePicker aria-label="日期" readOnly defaultValue="2026-11-04" onValueChange={change} />,
    );
    expect(screen.getByRole('button', { name: '打开选择面板' })).toBeDisabled();
    rerender(
      <form aria-label="日期表单">
        <DatePicker aria-label="日期" defaultValue="2026-11-04" onValueChange={change} />
      </form>,
    );
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-11-05' } });
    await user.click(screen.getByRole('button', { name: '打开选择面板' }));
    change.mockClear();
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByLabelText('日期')).toHaveValue('2026-11-04');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
  });
});

describe('范围选择器', () => {
  it('原生结构入口保留调用方标签和字段层级，同时维护范围校验与表单字段', () => {
    const change = vi.fn();
    render(
      <form aria-label="项目资料">
        <DateRangePicker
          label="项目计划日期"
          labels={{ ...labels, start: '计划开始日期', end: '计划结束日期' }}
          startName="startAt"
          endName="dueAt"
          defaultValue={['2026-11-04', '2026-11-10']}
          onValueChange={change}
          renderNative={({ groupProps, start, end }) => (
            <div {...groupProps} className="todo-project-plan">
              <label>
                <span>开始</span>
                {start}
              </label>
              <label>
                <span>截止</span>
                {end}
              </label>
            </div>
          )}
        />
      </form>,
    );
    const start = screen.getByLabelText('计划开始日期');
    const end = screen.getByLabelText('计划结束日期');
    expect(start.closest('label')).toHaveTextContent('开始');
    expect(end.closest('label')).toHaveTextContent('截止');
    expect(start).toHaveAttribute('type', 'date');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('startAt')).toBe('2026-11-04');
    fireEvent.change(end, { target: { value: '2026-11-03' } });
    expect(change).toHaveBeenLastCalledWith(['2026-11-04', '2026-11-03']);
    expect(screen.getByRole('alert')).toHaveTextContent(labels.invalidOrder);
    expect((end as HTMLInputElement).validationMessage).toBe(labels.invalidOrder);
  });

  it('起止各自命名并提交两个字段，0 与未填写的数值区分', () => {
    const change = vi.fn();
    render(
      <form aria-label="筛选">
        <NumberRangePicker
          label="价格范围"
          labels={labels}
          defaultValue={[0, null]}
          startName="from"
          endName="to"
          onValueChange={change}
        />
      </form>,
    );
    expect(screen.getByRole('group', { name: '价格范围' })).toBeInTheDocument();
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(new FormData(form).get('from')).toBe('0');
    expect(new FormData(form).get('to')).toBe('');
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '12.5' } });
    expect(change).toHaveBeenLastCalledWith([0, 12.5]);
    fireEvent.change(screen.getByLabelText('开始'), { target: { value: '' } });
    expect(change).toHaveBeenLastCalledWith([null, 12.5]);
  });

  it('内联范围字段展示可见端点标签并保留范围校验与表单字段', () => {
    const change = vi.fn();
    render(
      <form aria-label="项目资料">
        <DateRangeField
          label="项目计划日期"
          labels={{ start: '计划开始日期', end: '计划结束日期', invalidOrder: labels.invalidOrder }}
          startName="startAt"
          endName="dueAt"
          defaultValue={['2026-11-04', '2026-11-10']}
          onValueChange={change}
        />
      </form>,
    );
    expect(screen.getByText('计划开始日期')).toBeInTheDocument();
    expect(screen.getByText('计划结束日期')).toBeInTheDocument();
    const start = screen.getByLabelText('计划开始日期');
    expect(start).toHaveAttribute('type', 'date');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('startAt')).toBe('2026-11-04');
    fireEvent.change(screen.getByLabelText('计划结束日期'), { target: { value: '2026-11-03' } });
    expect(change).toHaveBeenLastCalledWith(['2026-11-04', '2026-11-03']);
    expect(screen.getByRole('alert')).toHaveTextContent(labels.invalidOrder);
    expect((screen.getByLabelText('计划结束日期') as HTMLInputElement).validationMessage).toBe(labels.invalidOrder);
  });

  it('内联范围字段空态占位跟随组件库语言字典', () => {
    const { rerender } = render(<DateRangeField label="计划" />);
    expect(screen.getAllByText('请选择日期')).toHaveLength(2);
    rerender(
      <ConfigProvider labels={enUS} locale="en-US">
        <DateRangeField label="计划" />
      </ConfigProvider>,
    );
    expect(screen.getAllByText('Select date')).toHaveLength(2);
    expect(screen.queryByText('请选择日期')).not.toBeInTheDocument();
  });

  it('反序日期保留草稿、阻止表单并关联错误，修正后清除自定义错误', () => {
    render(
      <form aria-label="日期筛选">
        <DateRangePicker label="计划" labels={labels} defaultValue={['2026-11-10', '2026-11-04']} />
      </form>,
    );
    const end = screen.getByLabelText('结束') as HTMLInputElement;
    expect(screen.getByRole('alert')).toHaveTextContent(labels.invalidOrder);
    expect(end).toHaveAccessibleDescription(labels.invalidOrder);
    expect(end.validationMessage).toBe(labels.invalidOrder);
    expect((screen.getByRole('form') as HTMLFormElement).checkValidity()).toBe(false);
    expect(screen.getByLabelText('开始')).toHaveValue('2026-11-10');
    fireEvent.change(end, { target: { value: '2026-11-12' } });
    expect(end.validationMessage).toBe('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('只比较墙上时间，包含秒 / 小数秒；不将跨午夜推断为第二天', () => {
    const { rerender } = render(
      <TimeRangePicker label="时段" labels={labels} step="any" value={['09:30:15.2', '09:30:15.1']} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(labels.invalidOrder);
    rerender(<TimeRangePicker label="时段" labels={labels} step="any" value={['09:30:15.1', '09:30:15.2']} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(<TimeRangePicker label="时段" labels={labels} value={['23:00', '01:00']} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('未完成范围可保留，required 与原生 min / max 仍能阻止提交', () => {
    const { rerender } = render(
      <form aria-label="范围">
        <DateRangePicker label="日期" labels={labels} value={['2026-11-04', '']} />
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(form.checkValidity()).toBe(true);
    rerender(
      <form aria-label="范围">
        <DateRangePicker label="日期" labels={labels} required min="2026-11-05" value={['2026-11-04', '']} />
      </form>,
    );
    expect(form.checkValidity()).toBe(false);
    expect((screen.getByLabelText('开始') as HTMLInputElement).validity.rangeUnderflow).toBe(true);
    expect((screen.getByLabelText('结束') as HTMLInputElement).validity.valueMissing).toBe(true);
  });

  it('受控值由宿主更新；只读和禁用不回调或改写其他端点', () => {
    const change = vi.fn();
    const { rerender } = render(
      <DateRangePicker label="日期" labels={labels} value={['2026-11-04', '2026-11-10']} onValueChange={change} />,
    );
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '2026-11-11' } });
    expect(change).toHaveBeenLastCalledWith(['2026-11-04', '2026-11-11']);
    expect(screen.getByLabelText('结束')).toHaveValue('2026-11-10');
    change.mockClear();
    rerender(
      <DateRangePicker
        label="日期"
        labels={labels}
        readOnly
        value={['2026-11-04', '2026-11-10']}
        onValueChange={change}
      />,
    );
    fireEvent.change(screen.getByLabelText('开始'), { target: { value: '2026-11-05' } });
    expect(change).not.toHaveBeenCalled();
    rerender(
      <DateRangePicker
        label="日期"
        labels={labels}
        disabled
        value={['2026-11-04', '2026-11-10']}
        onValueChange={change}
      />,
    );
    expect(screen.getByLabelText('开始')).toBeDisabled();
    expect(screen.getByLabelText('结束')).toBeDisabled();
  });

  it('非受控外部表单重置恢复初始区间并清除反序，受控重置保留宿主值', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <>
        <form id="range-owner" aria-label="外部表单" />
        <TimeRangePicker
          form="range-owner"
          label="时段"
          labels={labels}
          defaultValue={['09:00', '18:00']}
          onValueChange={change}
        />
      </>,
    );
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '08:00' } });
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByLabelText('结束')).toHaveValue('18:00');
    expect(change).toHaveBeenLastCalledWith(['09:00', '18:00']);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(
      <>
        <form id="range-owner" aria-label="外部表单" />
        <TimeRangePicker
          form="range-owner"
          label="时段"
          labels={labels}
          value={['10:00', '19:00']}
          onValueChange={change}
        />
      </>,
    );
    change.mockClear();
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByLabelText('结束')).toHaveValue('19:00');
    expect(change).not.toHaveBeenCalled();
  });

  it('取消 reset 时保留草稿与错误', async () => {
    render(
      <form aria-label="表单" onReset={(event) => event.preventDefault()}>
        <NumberRangePicker label="范围" labels={labels} defaultValue={[1, 10]} />
      </form>,
    );
    fireEvent.change(screen.getByLabelText('结束'), { target: { value: '0' } });
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByLabelText('结束')).toHaveValue(0);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
