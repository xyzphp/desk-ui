import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field, Textarea } from './Field';

describe('Textarea', () => {
  it('在 Field 中通过标签命名，并关联提示说明', () => {
    render(
      <Field label="备注" hint="最多 200 字">
        <Textarea />
      </Field>,
    );
    const area = screen.getByLabelText('备注');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAccessibleDescription('最多 200 字');
    expect(area).not.toHaveAttribute('aria-invalid');
  });

  it('Field 有错误时标记无效，并以错误替换提示', () => {
    render(
      <Field label="备注" hint="最多 200 字" error="不能为空">
        <Textarea />
      </Field>,
    );
    const area = screen.getByLabelText('备注');
    expect(area).toHaveAttribute('aria-invalid', 'true');
    expect(area).toHaveAccessibleDescription('不能为空');
    expect(screen.getByRole('alert')).toHaveTextContent('不能为空');
  });

  it('受控输入触发 onChange，自带 id 与 aria 属性优先于 Field 提供的值', async () => {
    const onChange = vi.fn();
    render(
      <Field label="备注" hint="提示">
        <Textarea id="own-id" aria-describedby="own-note" value="初始" onChange={onChange} />
      </Field>,
    );
    const area = screen.getByRole('textbox');
    expect(area).toHaveAttribute('id', 'own-id');
    expect(area).toHaveAttribute('aria-describedby', 'own-note');
    await userEvent.type(area, 'a');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('独立使用时保留原生属性与自定义 className', () => {
    render(<Textarea aria-label="正文" rows={5} className="custom" readOnly />);
    const area = screen.getByRole('textbox', { name: '正文' });
    expect(area).toHaveClass('ds-field', 'custom');
    expect(area).toHaveAttribute('rows', '5');
    expect(area).toHaveAttribute('readonly');
  });
});
