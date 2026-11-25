import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Coachmark, Tour, type TourStep } from './Coachmark';

describe('Coachmark', () => {
  it('命名的非模态对话框，聚焦主按钮，「知道了」/ 关闭 / Esc 分别回调原因', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Coachmark open title="新功能" onClose={onClose}>
        说明文字
      </Coachmark>,
    );
    const dialog = screen.getByRole('dialog', { name: '新功能' });
    expect(dialog).toHaveAccessibleDescription('说明文字');
    const done = screen.getByRole('button', { name: '知道了' });
    expect(done).toHaveFocus();
    await user.click(done);
    expect(onClose).toHaveBeenLastCalledWith('done');
    await user.click(screen.getByRole('button', { name: '关闭引导' }));
    expect(onClose).toHaveBeenLastCalledWith('close');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenLastCalledWith('escape');
  });

  it('外部点击不会关闭；关闭状态不渲染', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <>
        <button>外部</button>
        <Coachmark open title="提示" onClose={onClose} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: '外部' }));
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Coachmark open={false} title="提示" onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('指向目标时标出所在一侧；聚光层对辅助技术隐藏', () => {
    const target = document.createElement('button');
    document.body.append(target);
    target.getBoundingClientRect = () => new DOMRect(100, 100, 40, 20);
    render(<Coachmark open title="提示" target={target} spotlight onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'bottom');
    expect(document.querySelector('.ds-coachmark-spot')).toHaveAttribute('aria-hidden', 'true');
    target.remove();
  });
});

const steps: TourStep[] = [
  { id: 'a', title: '第一步', description: '欢迎' },
  { id: 'b', title: '第二步', target: () => null },
  { id: 'c', title: '第三步' },
];

function ControlledTour({ onClose }: { onClose: (reason: string, index: number) => void }) {
  const [current, setCurrent] = useState(0);
  return <Tour open steps={steps} current={current} onCurrentChange={setCurrent} onClose={onClose} />;
}

describe('Tour', () => {
  it('上一步 / 下一步与步骤计数，最后一步显示完成', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ControlledTour onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: '第一步' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '上一步' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '下一步' }));
    expect(screen.getByRole('dialog', { name: '第二步' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '上一步' }));
    expect(screen.getByRole('dialog', { name: '第一步' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '下一步' }));
    await user.click(screen.getByRole('button', { name: '下一步' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '跳过' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '完成' }));
    expect(onClose).toHaveBeenCalledWith('finish', 2);
  });

  it('跳过、右上角关闭与 Esc 带回当前步骤', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tour open steps={steps} defaultCurrent={1} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '跳过' }));
    expect(onClose).toHaveBeenLastCalledWith('skip', 1);
    await user.click(screen.getByRole('button', { name: '关闭引导' }));
    expect(onClose).toHaveBeenLastCalledWith('skip', 1);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenLastCalledWith('escape', 1);
  });

  it('只有一步时主按钮为「知道了」，没有计数与跳过', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tour open steps={[{ title: '新功能' }]} onClose={onClose} />);
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '跳过' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '知道了' }));
    expect(onClose).toHaveBeenCalledWith('finish', 0);
  });

  it('空步骤或关闭时不渲染', () => {
    const { rerender } = render(<Tour open steps={[]} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Tour open={false} steps={steps} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
