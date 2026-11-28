import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './Button';
import { Checkbox } from './Feedback';
import { Field, Input } from './Field';

describe('Button', () => {
  it('默认 type 为 button，避免意外提交表单', () => {
    render(<Button>保存</Button>);
    expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('type', 'button');
  });

  it('variant 与 pressed 映射为类名和 aria-pressed', () => {
    render(
      <Button variant="primary" pressed>
        确定
      </Button>,
    );
    const button = screen.getByRole('button', { name: '确定' });
    expect(button).toHaveClass('ds-button', 'ds-button--primary');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('禁用时不触发点击', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        删除
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('以 label 作为无障碍名称', () => {
    render(<IconButton icon="plus" label="新增令牌" />);
    expect(screen.getByRole('button', { name: '新增令牌' })).toHaveClass('ds-button--icon');
  });
});

describe('Field', () => {
  it('关联标签与控件，错误优先于提示并标记 aria-invalid', () => {
    render(
      <Field label="令牌名称" hint="最多 80 字" error="名称不能为空">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('令牌名称');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('名称不能为空');
    expect(screen.queryByText('最多 80 字')).not.toBeInTheDocument();
  });

  it('通过 tip 在标签旁渲染问号悬停提示，不污染控件名称且保留点击聚焦关联', () => {
    const { container } = render(
      <Field label="翻译目标语言" tip="用逗号分隔的可选翻译语言，首项为默认语言">
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '翻译目标语言' });
    expect(
      container
        .querySelector('.ds-field-head label')
        ?.contains(screen.getByRole('img', { name: '用逗号分隔的可选翻译语言，首项为默认语言' })),
    ).toBe(false);
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

describe('Checkbox', () => {
  it('点击文字切换勾选', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>隐藏已完成</Checkbox>);
    await userEvent.click(screen.getByText('隐藏已完成'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('checkbox', { name: '隐藏已完成' })).toBeChecked();
  });
});
