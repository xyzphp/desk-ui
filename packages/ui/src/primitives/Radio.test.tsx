import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './Radio';

describe('Radio / RadioGroup', () => {
  it('独立单选按原生同名组提交值，不把未选项加入表单', async () => {
    const { container } = render(<form>
      <Radio name="mode" value="one" defaultChecked>单个</Radio>
      <Radio name="mode" value="many">多个</Radio>
    </form>);
    await userEvent.click(screen.getByText('多个'));
    expect(new FormData(container.querySelector('form')!).getAll('mode')).toEqual(['many']);
  });
  it('方向键跳过禁用并循环，受控回调返回值，关联组错误', async () => {
    const change = vi.fn();
    render(<RadioGroup label="模式" defaultValue="one" onValueChange={change} error="请选择" required>
      <Radio value="one">单个</Radio><Radio value="disabled" disabled>禁用</Radio><Radio value="many">多个</Radio>
    </RadioGroup>);
    screen.getByLabelText('单个').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByLabelText('多个')).toHaveFocus();
    expect(screen.getByLabelText('多个')).toBeChecked();
    expect(change).toHaveBeenLastCalledWith('many');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByLabelText('单个')).toBeChecked();
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('请选择');
  });
  it('外部表单 reset 恢复初值，受控值不被原生 reset 改写', async () => {
    const ref = createRef<HTMLFieldSetElement>();
    const content = (value?: string) => <>
      <form id="radio-form"><button type="reset">重置</button></form>
      <RadioGroup ref={ref} form="radio-form" label="模式" name="mode" defaultValue="one" value={value}>
        <Radio value="one">单个</Radio><Radio value="many">多个</Radio>
      </RadioGroup>
    </>;
    const { rerender } = render(content());
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    await userEvent.click(screen.getByText('多个'));
    await userEvent.click(screen.getByText('重置'));
    expect(screen.getByLabelText('单个')).toBeChecked();
    rerender(content('many'));
    fireEvent.reset(document.getElementById('radio-form')!);
    await Promise.resolve();
    expect(screen.getByLabelText('多个')).toBeChecked();
  });
});
