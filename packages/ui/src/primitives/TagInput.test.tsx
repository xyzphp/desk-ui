import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TagInput } from './TagInput';
import { Chip } from './Chip';
import { Field } from './Field';

describe('Chip / TagInput', () => {
  it('回车与逗号添加，重复 / 长度 / 数量拒绝，表单只提交已确认标签', async () => {
    const rejected = vi.fn();
    const { container } = render(
      <form>
        <Field label="标签">
          <TagInput name="tags" defaultValue={['已有']} maxTags={2} maxTagLength={4} onReject={rejected} />
        </Field>
      </form>,
    );
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: '标签' });
    await user.type(input, '新增,');
    expect(new FormData(container.querySelector('form')!).getAll('tags')).toEqual(['已有', '新增']);
    await user.type(input, '已有{Enter}');
    expect(rejected).toHaveBeenLastCalledWith([{ value: '已有', reason: 'duplicate' }]);
    await user.clear(input);
    await user.type(input, '很长的内容{Enter}');
    expect(rejected).toHaveBeenLastCalledWith([{ value: '很长的内容', reason: 'length' }]);
    await user.clear(input);
    await user.type(input, '第三{Enter}');
    expect(rejected).toHaveBeenLastCalledWith([{ value: '第三', reason: 'limit' }]);
    expect(input).toHaveValue('第三');
  });
  it('粘贴批次保留有效项，空草稿退格移除，点击移除后回到输入', async () => {
    render(<TagInput aria-label="标签" maxTags={3} defaultValue={['A']} />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.paste(input, { clipboardData: { getData: () => 'B，A\nC' } });
    expect(screen.getByRole('button', { name: '移除标签：B' })).toBeInTheDocument();
    expect(input).toHaveValue('A');
    await userEvent.clear(input);
    await userEvent.keyboard('{Backspace}');
    expect(screen.queryByRole('button', { name: '移除标签：C' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '移除标签：B' }));
    expect(input).toHaveFocus();
  });
  it('输入法确认不添加或提交；required 校验已确认值，重置恢复标签和草稿', async () => {
    const ref = createRef<HTMLInputElement>();
    const submit = vi.fn((event) => event.preventDefault());
    const { container } = render(
      <form onSubmit={submit}>
        <TagInput ref={ref} aria-label="标签" required defaultInputValue="草稿" />
      </form>,
    );
    fireEvent.compositionStart(ref.current!);
    fireEvent.keyDown(ref.current!, { key: 'Enter' });
    fireEvent.compositionEnd(ref.current!);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(ref.current?.checkValidity()).toBe(false);
    fireEvent.keyDown(ref.current!, { key: 'Enter' });
    expect(ref.current?.checkValidity()).toBe(true);
    expect(submit).not.toHaveBeenCalled();
    await act(async () => container.querySelector('form')!.reset());
    expect(ref.current).toHaveValue('草稿');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('只读不展示移除动作，独立 Chip 的禁用移除不可触发', async () => {
    const remove = vi.fn();
    render(
      <>
        <TagInput aria-label="标签" value={['只读']} readOnly />
        <Chip disabled onRemove={remove}>
          不可移除
        </Chip>
      </>,
    );
    expect(screen.queryByRole('button', { name: '移除标签：只读' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '移除标签：不可移除' }));
    expect(remove).not.toHaveBeenCalled();
  });

  it('提供 options 时支持点击预设标签切换多选并与已有上限校验联动', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Field label="翻译目标语言">
        <TagInput
          defaultValue={['简体中文']}
          options={['简体中文', 'English', '日本語']}
          maxTags={2}
          onValueChange={onChange}
        />
      </Field>,
    );
    const zh = screen.getByRole('button', { name: '简体中文' });
    const en = screen.getByRole('button', { name: 'English' });
    const ja = screen.getByRole('button', { name: '日本語' });
    expect(zh).toHaveAttribute('aria-pressed', 'true');
    expect(en).toHaveAttribute('aria-pressed', 'false');

    await user.click(en);
    expect(en).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(['简体中文', 'English']);

    await user.click(ja);
    expect(ja).toHaveAttribute('aria-pressed', 'false');

    await user.click(zh);
    expect(zh).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(['English']);
  });
});
