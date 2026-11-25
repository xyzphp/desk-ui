import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AIReferenceList } from './AIReferenceList';
import { AIResultPanel } from './AIResultPanel';
import { AIToolbar } from './AIToolbar';

const actions = [
  { id: 'polish', label: '润色' },
  { id: 'translate', label: '翻译' },
  { id: 'image', label: '生图', disabled: true },
];
const models = [
  { id: 'standard', label: '标准模型' },
  { id: 'compact', label: '轻量模型' },
];
const toolbarLabels = {
  actions: '动作',
  model: '模型',
  generate: '生成',
  generating: '生成中',
  stop: '停止',
  emptyModels: '暂无模型',
  unavailableModel: '模型不可用',
};
const resultLabels = {
  original: '原文',
  result: '结果',
  empty: '等待生成',
  generating: '正在生成',
  apply: '应用',
  append: '追加',
  discard: '舍弃',
  retry: '重试',
  stop: '停止',
};

describe('AIToolbar', () => {
  it('只切换动作和模型，点击生成才回调；按钮不提交外层表单', async () => {
    const user = userEvent.setup();
    const generate = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <AIToolbar label="工具" actions={actions} models={models} labels={toolbarLabels} onGenerate={generate} />
      </form>,
    );
    expect(screen.getByRole('button', { name: '润色' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '翻译' }));
    await user.click(screen.getByRole('button', { name: '模型：标准模型' }));
    await user.click(screen.getByRole('button', { name: '轻量模型' }));
    expect(screen.getByRole('button', { name: '模型：轻量模型' })).toBeInTheDocument();
    expect(generate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '生成' }));
    expect(generate).toHaveBeenCalledExactlyOnceWith({ action: 'translate', model: 'compact' });
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '生图' })).toBeDisabled();
  });

  it('受控选择由宿主维护；移除或停用当前模型后禁止生成，不悄悄替换', () => {
    const generate = vi.fn();
    const change = vi.fn();
    const { rerender } = render(
      <AIToolbar
        label="工具"
        actions={actions}
        models={models}
        value="polish"
        modelValue="standard"
        onValueChange={change}
        labels={toolbarLabels}
        onGenerate={generate}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '翻译' }));
    expect(change).toHaveBeenCalledWith('translate');
    expect(screen.getByRole('button', { name: '润色' })).toHaveAttribute('aria-pressed', 'true');
    rerender(
      <AIToolbar
        label="工具"
        actions={actions}
        models={[models[1]!]}
        value="polish"
        modelValue="standard"
        labels={toolbarLabels}
        onGenerate={generate}
      />,
    );
    expect(screen.getByRole('button', { name: '模型：模型不可用' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '生成' })).toBeDisabled();
    rerender(
      <AIToolbar
        label="工具"
        actions={actions}
        models={[{ ...models[0]!, disabled: true }]}
        value="polish"
        modelValue="standard"
        labels={toolbarLabels}
        onGenerate={generate}
      />,
    );
    expect(screen.getByRole('button', { name: '生成' })).toBeDisabled();
    expect(generate).not.toHaveBeenCalled();
  });

  it('忙碌冻结动作、模型和参数，保留停止；缺少模型或被禁用时不生成', () => {
    const stop = vi.fn();
    const generate = vi.fn();
    const { rerender } = render(
      <AIToolbar
        label="工具"
        actions={actions}
        models={models}
        labels={toolbarLabels}
        onGenerate={generate}
        onStop={stop}
        busy
        options={<input aria-label="参数" />}
      />,
    );
    expect(screen.getByRole('region', { name: '工具' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '润色' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^模型/ })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: '参数' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(stop).toHaveBeenCalledTimes(1);
    rerender(<AIToolbar label="工具" actions={actions} models={[]} labels={toolbarLabels} onGenerate={generate} />);
    expect(screen.getByRole('button', { name: '模型：暂无模型' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '生成' })).toBeDisabled();
    expect(generate).not.toHaveBeenCalled();
  });

  it('失败保留所选项，可显式重试；没有停止回调时不伪造可用操作', () => {
    const generate = vi.fn();
    const { rerender } = render(
      <AIToolbar
        label="工具"
        actions={actions}
        models={models}
        labels={toolbarLabels}
        onGenerate={generate}
        value="translate"
        modelValue="compact"
        error="生成失败"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('生成失败');
    fireEvent.click(screen.getByRole('button', { name: '生成' }));
    expect(generate).toHaveBeenLastCalledWith({ action: 'translate', model: 'compact' });
    rerender(
      <AIToolbar label="工具" actions={actions} models={models} labels={toolbarLabels} onGenerate={generate} busy />,
    );
    expect(screen.getByRole('button', { name: '生成中' })).toBeDisabled();
  });

  it('模型列表标记当前项，Esc 关闭并归还焦点；忙碌结束不重新展开旧列表', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AIToolbar label="工具" actions={actions} models={models} labels={toolbarLabels} onGenerate={vi.fn()} />,
    );
    const selector = screen.getByRole('button', { name: '模型：标准模型' });
    await user.click(selector);
    expect(selector).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '标准模型' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '轻量模型' })).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard('{Escape}');
    expect(selector).toHaveAttribute('aria-expanded', 'false');
    expect(selector).toHaveFocus();
    await user.click(selector);
    rerender(
      <AIToolbar label="工具" actions={actions} models={models} labels={toolbarLabels} onGenerate={vi.fn()} busy />,
    );
    rerender(<AIToolbar label="工具" actions={actions} models={models} labels={toolbarLabels} onGenerate={vi.fn()} />);
    expect(screen.queryByRole('dialog', { name: '模型' })).not.toBeInTheDocument();
  });

  it('补充要求、标题栏关闭与内容区：输入回传宿主，忙碌时冻结，关闭只回调', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const change = vi.fn();
    const instruction = { value: '', onValueChange: change, label: '补充要求', placeholder: '补充要求（可选）' };
    const { rerender } = render(
      <AIToolbar
        label="工具"
        onClose={close}
        actions={actions}
        models={models}
        labels={toolbarLabels}
        onGenerate={vi.fn()}
        instruction={instruction}
      >
        <p>内容区</p>
      </AIToolbar>,
    );
    expect(screen.getByText('内容区')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: '补充要求' }), '更正式');
    expect(change).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '关闭窗口' }));
    expect(close).toHaveBeenCalledTimes(1);
    rerender(
      <AIToolbar
        label="工具"
        onClose={close}
        actions={actions}
        models={models}
        labels={toolbarLabels}
        onGenerate={vi.fn()}
        instruction={instruction}
        busy
      />,
    );
    expect(screen.getByRole('textbox', { name: '补充要求' })).toBeDisabled();
  });
});

describe('AIReferenceList', () => {
  const items = [
    { id: 'title', label: '标题', content: '<script>example</script>' },
    { id: 'history', label: '历史', disabled: true },
  ];
  const labels = { empty: '暂无参考', preview: (item: { label: string }) => `查看${item.label}` };

  it('默认不选择参考，内容转义；禁用项无法修改', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(<AIReferenceList label="参考" items={items} labels={labels} onValueChange={change} />);
    expect(screen.getByRole('checkbox', { name: '标题' })).not.toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: '标题' }));
    expect(change).toHaveBeenCalledWith(['title']);
    expect(screen.getByRole('checkbox', { name: '历史' })).toBeDisabled();
    expect(container.querySelector('script')).toBeNull();
    fireEvent.click(screen.getByText('查看标题'));
    expect(screen.getByText('<script>example</script>')).toBeInTheDocument();
  });

  it('只读仍可展开预览；回调剔除未展示值但保留宿主受控状态，空列表有文案', () => {
    const change = vi.fn();
    const { rerender } = render(
      <AIReferenceList label="参考" items={items} labels={labels} value={['hidden', 'title']} onValueChange={change} />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: '标题' }));
    expect(change).toHaveBeenCalledWith([]);
    expect(screen.getByRole('checkbox', { name: '标题' })).toBeChecked();
    rerender(
      <AIReferenceList label="参考" items={items} labels={labels} value={['title']} readOnly onValueChange={change} />,
    );
    expect(screen.getByRole('checkbox', { name: '标题' })).toBeDisabled();
    expect(screen.getByText('查看标题')).toBeInTheDocument();
    rerender(<AIReferenceList label="参考" items={[]} labels={labels} />);
    expect(screen.getByText('暂无参考')).toBeInTheDocument();
  });
});

describe('AIResultPanel', () => {
  it('应用和追加使用用户编辑后的完整草稿，动作本身不清空或修改原文', () => {
    const apply = vi.fn();
    const append = vi.fn();
    render(
      <AIResultPanel
        label="预览"
        original="原来的文字"
        defaultValue="建议"
        labels={resultLabels}
        state="ready"
        onApply={apply}
        onAppend={append}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: '结果' }), { target: { value: '  编辑后\n' } });
    fireEvent.click(screen.getByRole('button', { name: '应用' }));
    fireEvent.click(screen.getByRole('button', { name: '追加' }));
    expect(apply).toHaveBeenCalledExactlyOnceWith('  编辑后\n');
    expect(append).toHaveBeenCalledExactlyOnceWith('  编辑后\n');
    expect(screen.getByRole('textbox')).toHaveValue('  编辑后\n');
    expect(screen.getByText('原来的文字')).toBeInTheDocument();
  });

  it('生成中、失败、只读、空白与超长都阻止应用，结果始终保留', () => {
    const apply = vi.fn();
    const props = { label: '预览', original: '原文', labels: resultLabels, onApply: apply };
    const { rerender } = render(<AIResultPanel {...props} value="部分结果" state="generating" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    rerender(<AIResultPanel {...props} value="部分结果" state="error" error="失败" />);
    expect(screen.getByRole('textbox')).toHaveValue('部分结果');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('失败');
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    rerender(<AIResultPanel {...props} value="部分结果" state="ready" readOnly />);
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    rerender(<AIResultPanel {...props} value="   " state="ready" />);
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    rerender(<AIResultPanel {...props} value="超长草稿" state="ready" maxLength={2} />);
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveValue('超长草稿');
    rerender(<AIResultPanel {...props} value="草稿" state="ready" error="原修订已失效" />);
    expect(screen.getByRole('button', { name: '应用' })).toBeDisabled();
    expect(apply).not.toHaveBeenCalled();
  });

  it('停止、重试和舍弃只回调；流式受控更新不执行应用，文本不会解析为 HTML', () => {
    const apply = vi.fn();
    const stop = vi.fn();
    const retry = vi.fn();
    const discard = vi.fn();
    const props = {
      label: '预览',
      original: '<b>原文</b>',
      labels: resultLabels,
      onApply: apply,
      onStop: stop,
      onRetry: retry,
      onDiscard: discard,
    };
    const { rerender, container } = render(<AIResultPanel {...props} state="generating" value="片段一" />);
    rerender(<AIResultPanel {...props} state="generating" value="片段一、片段二" />);
    expect(screen.getByRole('textbox')).toHaveValue('片段一、片段二');
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(stop).toHaveBeenCalledTimes(1);
    rerender(<AIResultPanel {...props} state="error" value="片段一、片段二" />);
    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    fireEvent.click(screen.getByRole('button', { name: '舍弃' }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(discard).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toHaveValue('片段一、片段二');
    expect(container.querySelector('b')).toBeNull();
    expect(apply).not.toHaveBeenCalled();
  });
});
