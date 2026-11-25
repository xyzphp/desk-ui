import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormActions, FormSection } from './Form';
import { Field, Input } from '../primitives/Field';
import { Button } from '../primitives/Button';

describe('表单分组与动作', () => {
  it('分组有名称和说明，原生禁用与动作 busy 不影响其他分组', () => {
    const { rerender } = render(<form aria-label="设置">
      <FormSection label="基本设置" description="分组说明"><Field label="名称"><Input name="name" defaultValue="draft" /></Field></FormSection>
      <FormActions busy status="正在保存"><Button type="submit">保存</Button></FormActions>
    </form>);
    expect(screen.getByRole('group', { name: '基本设置' })).toHaveAccessibleDescription('分组说明');
    expect(screen.getByRole('textbox', { name: '名称' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    expect(screen.getByRole('group', { name: '表单操作' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('正在保存');
    rerender(<form aria-label="设置"><FormSection label="基本设置" disabled><Input name="name" defaultValue="draft" /></FormSection></form>);
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('name')).toBeNull();
  });
  it('只保留原生 submit 入口，不额外调用宿主动作', () => {
    const submitted = vi.fn((event) => event.preventDefault());
    render(<form onSubmit={submitted}><FormActions><Button type="submit">保存</Button></FormActions></form>);
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(submitted).toHaveBeenCalledTimes(1);
  });
});
