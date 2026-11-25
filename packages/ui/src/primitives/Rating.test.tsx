import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Rating } from './Rating';

describe('Rating', () => {
  it('共用方向键切换、原生表单、必填、清空与重置', async () => {
    const { container } = render(<form><Rating label="评分" name="rating" required /></form>);
    const form = container.querySelector('form')!;
    act(() => { expect(form.checkValidity()).toBe(false); });
    expect(screen.getByRole('alert')).not.toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole('radio', { name: '2 分，满分 5 分' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '3 分，满分 5 分' })).toBeChecked();
    expect(new FormData(form).get('rating')).toBe('3');
    expect(form.checkValidity()).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: '清除评分' }));
    expect(new FormData(form).get('rating')).toBeNull();
    await userEvent.keyboard('{ArrowRight}');
    await act(async () => form.reset());
    expect(screen.getByRole('status')).toHaveTextContent('尚未评分');
  });
  it('只读仍提交，禁用排除，受控拒绝不更改 checked', async () => {
    const changed = vi.fn();
    const { rerender } = render(<form aria-label="表单"><Rating label="评分" name="rating" value={4} readOnly onValueChange={changed} /></form>);
    await userEvent.click(screen.getByRole('radio', { name: '4 分，满分 5 分' }));
    await userEvent.keyboard('{ArrowLeft}');
    expect(changed).not.toHaveBeenCalled();
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('rating')).toBe('4');
    rerender(<form aria-label="表单"><Rating label="评分" name="rating" value={4} disabled /></form>);
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('rating')).toBeNull();
    rerender(<Rating label="评分" value={2} onValueChange={changed} />);
    await userEvent.click(screen.getByRole('radio', { name: '5 分，满分 5 分' }));
    expect(changed).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole('radio', { name: '2 分，满分 5 分' })).toBeChecked();
  });
});
