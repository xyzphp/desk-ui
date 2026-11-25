import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopCardRail } from './DesktopCardRail';

afterEach(() => vi.restoreAllMocks());

describe('DesktopCardRail', () => {
  it('首次已有卡片时完成挂载，移除首项后保留其余时钟的节点和内容', () => {
    const memo = { id: 'memo', content: <section aria-label="待撤下的卡片">记录</section> };
    const clocks = [
      {
        id: 'clock:japan',
        content: (
          <section aria-label="日本标准时间">
            <time>23:06</time>
          </section>
        ),
      },
      {
        id: 'clock:china',
        content: (
          <section aria-label="中国标准时间">
            <time>22:06</time>
          </section>
        ),
      },
    ];
    const view = render(
      <StrictMode>
        <DesktopCardRail items={[memo, ...clocks]} />
      </StrictMode>,
    );
    const japan = screen.getByRole('region', { name: '日本标准时间' });
    const china = screen.getByRole('region', { name: '中国标准时间' });
    expect(japan).toHaveTextContent('23:06');
    view.rerender(
      <StrictMode>
        <DesktopCardRail items={clocks} />
      </StrictMode>,
    );
    expect(screen.queryByRole('region', { name: '待撤下的卡片' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '日本标准时间' })).toBe(japan);
    expect(screen.getByRole('region', { name: '中国标准时间' })).toBe(china);
    expect(japan.isConnected && china.isConnected).toBe(true);
  });
  it('窄导航工作区按原站改用横向卡片轨道并报告底部占位', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const rect = new DOMRect(0, 0, 280, 180);
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
      Object.assign([rect], { item: (index: number) => (index === 0 ? rect : null) }),
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
    const onOccupiedWidthChange = vi.fn();
    const onOccupiedHeightChange = vi.fn();
    const flush = () =>
      act(() => {
        while (frames.length) frames.shift()!(0);
      });
    const view = render(
      <div>
        <DesktopCardRail
          navigationMode
          items={[
            { id: 'one', content: <section>第一张</section> },
            { id: 'two', content: <section>第二张</section> },
          ]}
          onOccupiedWidthChange={onOccupiedWidthChange}
          onOccupiedHeightChange={onOccupiedHeightChange}
        />
      </div>,
    );
    flush();
    const columns = view.container.querySelector<HTMLElement>('.ds-desktop-card-columns');
    expect(columns).toHaveAttribute('data-layout', 'horizontal');
    expect(columns?.querySelector('[data-card-column]')).not.toBeInTheDocument();
    expect([...columns!.children].map((node) => (node as HTMLElement).dataset.cardRailItem)).toEqual(['one', 'two']);
    expect(onOccupiedWidthChange).toHaveBeenLastCalledWith(0);
    expect(onOccupiedHeightChange.mock.lastCall?.[0]).toBeGreaterThan(0);
    view.unmount();
  });
  it('顺序变化保留输入、iframe 节点和焦点，隐藏时释放占位', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1100);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
    const rect = new DOMRect(0, 0, 300, 180);
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
      Object.assign([rect], { item: (index: number) => (index === 0 ? rect : null) }),
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 300,
      bottom: 180,
      width: 300,
      height: 180,
      toJSON: () => ({}),
    });
    const report = vi.fn();
    const draft = { id: 'draft', content: <input aria-label="草稿" defaultValue="" /> };
    const frame = { id: 'frame', content: <iframe title="扩展卡片" /> };
    const flush = () =>
      act(() => {
        while (frames.length) frames.shift()!(0);
      });
    const view = render(
      <div>
        <DesktopCardRail items={[draft, frame]} onOccupiedWidthChange={report} />
      </div>,
    );
    flush();
    const input = screen.getByRole('textbox', { name: '草稿' });
    const iframe = screen.getByTitle('扩展卡片');
    fireEvent.change(input, { target: { value: '保留这份草稿' } });
    input.focus();
    view.rerender(
      <div>
        <DesktopCardRail items={[frame, draft]} onOccupiedWidthChange={report} />
      </div>,
    );
    flush();
    expect(screen.getByRole('textbox', { name: '草稿' })).toBe(input);
    expect(input).toHaveValue('保留这份草稿');
    expect(input).toHaveFocus();
    expect(screen.getByTitle('扩展卡片')).toBe(iframe);
    expect(
      view.container.querySelector('[data-card-column]')?.firstElementChild?.getAttribute('data-card-rail-item'),
    ).toBe('frame');
    view.rerender(
      <div>
        <DesktopCardRail hidden items={[frame, draft]} onOccupiedWidthChange={report} />
      </div>,
    );
    flush();
    expect(report).toHaveBeenLastCalledWith(0);
    view.unmount();
  });

  it('卡片顺序与标识未变化时，重复渲染不触发多余的分列重排', () => {
    const frames: FrameRequestCallback[] = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const flush = () =>
      act(() => {
        while (frames.length) frames.shift()!(0);
      });
    const view = render(
      <DesktopCardRail
        items={[
          { id: 'clock:local', content: <section>时钟</section> },
          { id: 'builtin:todo', content: <section>待办</section> },
        ]}
      />,
    );
    flush();
    const initialCalls = raf.mock.calls.length;
    view.rerender(
      <DesktopCardRail
        items={[
          { id: 'clock:local', content: <section>时钟 更新</section> },
          { id: 'builtin:todo', content: <section>待办</section> },
        ]}
      />,
    );
    expect(raf).toHaveBeenCalledTimes(initialCalls);
    view.rerender(
      <DesktopCardRail
        items={[
          { id: 'builtin:todo', content: <section>待办</section> },
          { id: 'clock:local', content: <section>时钟 更新</section> },
        ]}
      />,
    );
    expect(raf.mock.calls.length).toBeGreaterThan(initialCalls);
    view.unmount();
  });
});
