import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { Field, Input, Select } from './Field';
import { InputGroup, InputGroupAddon } from './InputGroup';

describe('InputGroup', () => {
  it('把输入控件与多个按钮组合在同一表单组内，保留 Field 标签关联与按钮交互', async () => {
    const user = userEvent.setup();
    const onRandom = vi.fn();
    const onSave = vi.fn();

    const { container } = render(
      <Field label="访问路径">
        <InputGroup data-testid="entry-group">
          <Input defaultValue="/_entry/a1b2c3d4e5" />
          <Button type="button" onClick={onRandom}>
            随机生成
          </Button>
          <Button type="button" variant="primary" onClick={onSave}>
            保存
          </Button>
        </InputGroup>
      </Field>,
    );

    const group = screen.getByTestId('entry-group');
    const input = screen.getByRole('textbox', { name: '访问路径' });
    const randomButton = screen.getByRole('button', { name: '随机生成' });
    const saveButton = screen.getByRole('button', { name: '保存' });

    expect(group).toHaveClass('ds-input-group', 'is-responsive');
    expect(group).not.toHaveClass('is-inline');
    expect(group).toContainElement(input);
    expect(group).toContainElement(randomButton);
    expect(group).toContainElement(saveButton);

    await user.click(randomButton);
    await user.click(saveButton);
    expect(onRandom).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);

    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it('支持前后缀、下拉组合及 block / responsive 属性开关', () => {
    render(
      <InputGroup block={false} responsive={false} data-testid="domain-group">
        <InputGroupAddon>https://</InputGroupAddon>
        <Select aria-label="子域类型" defaultValue="app">
          <option value="app">应用</option>
          <option value="api">接口</option>
        </Select>
        <Input aria-label="主机名" defaultValue="portal" />
        <InputGroupAddon>.example.com</InputGroupAddon>
      </InputGroup>,
    );

    const group = screen.getByTestId('domain-group');
    expect(group).toHaveClass('ds-input-group', 'is-inline');
    expect(group).not.toHaveClass('is-responsive');
    expect(screen.getByText('https://')).toHaveClass('ds-input-group-addon');
    expect(screen.getByText('.example.com')).toHaveClass('ds-input-group-addon');
    expect(screen.getByRole('textbox', { name: '主机名' })).toHaveValue('portal');
  });
});
