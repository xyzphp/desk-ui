import { MarkdownView, Panel } from '@xyzos/desk-ui';

const sample = `# 项目说明

**目标**：安全显示常用 Markdown。

- [x] 任务清单
- [ ] 后续跟进

> 引用与说明

| 类型 | 处理方式 |
| --- | --- |
| 原始 HTML | 按文字显示 |
| 外部图片 | 显示为链接 |

\`\`\`ts
const title = '<script>按文字显示</script>';
\`\`\`

[安全网页链接](https://example.com/docs)

![外部图片不会自动加载](https://example.com/image.png)

<script>run()</script>`;

export function MarkdownViewDemo() {
  return (
    <Panel>
      <MarkdownView
        value={sample}
        after={
          <p>
            <a href="/files/content/file:1?download=1">项目附件.pdf</a>
          </p>
        }
      />
    </Panel>
  );
}
