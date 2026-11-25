import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdownRender';

describe('受限 Markdown 渲染', () => {
  it('保留原站常用区块、行内格式、表格和任务项', () => {
    const html = renderMarkdown(
      '# 标题\n\n**加粗** *强调* ~~删除~~\n下一行\n\n- 一项\n- [x] 已完成\n- [ ] 待完成\n\n1. 第一步\n2. 第二步\n\n> 引用\n\n| 名称 | 值 |\n| --- | --- |\n| 站点 | 示例 |\n\n---',
    );
    expect(html).toContain('<h1>标题</h1>');
    expect(html).toContain('<strong>加粗</strong>');
    expect(html).toContain('<em>强调</em>');
    expect(html).toContain('<del>删除</del>');
    expect(html).toContain('<br>下一行');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<table>');
    expect(html).toContain('<li class="markdown-task"><span aria-label="未完成">○</span>待完成</li>');
    expect(html).toContain('<hr>');
    expect(html).not.toContain('<input');
  });

  it('把原始 HTML 与代码内容当作文本，并拒绝危险链接', () => {
    const html = renderMarkdown(
      '`<img src=x onerror=run()>`\n\n```html\n<script>run()</script>\n```\n\n<svg onload="run()">unsafe</svg>\n\n[x](javascript:alert(1))',
    );
    expect(html).toContain('&lt;img src=x onerror=run()&gt;');
    expect(html).toContain('&lt;script&gt;run()&lt;/script&gt;');
    expect(html).toContain('&lt;svg onload=&quot;run()&quot;&gt;unsafe&lt;/svg&gt;');
    expect(html).not.toMatch(/<(script|svg|img)\b/i);
    expect(html).not.toContain('<a href=');
  });

  it('允许安全网页链接但不自动加载远程图片', () => {
    const html = renderMarkdown('[站点](https://example.com/docs)\n\n![图片](https://example.com/image.png "图注")');
    expect(html).toContain('<a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">站点</a>');
    expect(html).toContain(
      '<a href="https://example.com/image.png" target="_blank" rel="noopener noreferrer" title="图注">图片</a>',
    );
    expect(html).not.toContain('<img');
  });

  it('只从显式媒体映射加载同源授权图片，并过滤不安全映射', () => {
    const html = renderMarkdown('![图片](article-file:7 =480)\n\n![外链](project-file:8)\n\n![未授权](article-file:9)', {
      media: {
        'article-file:7': { url: '/api/files/7', image: true },
        'project-file:8': { url: '/api/files/8', image: false },
        'article-file:9': { url: '//outside.example/image.png', image: true },
      },
    });
    expect(html).toContain(
      '<span class="markdown-image" data-md-image="article-file:7" data-md-columns="1" style="width:480px"><img src="/api/files/7" alt="图片" data-md-file="article-file:7" data-md-columns="1" width="480"',
    );
    expect(html).toContain(
      '<a href="/api/files/8" target="_blank" rel="noopener noreferrer" data-md-file="project-file:8">外链</a>',
    );
    expect(html).not.toContain('outside.example');
    expect(renderMarkdown('![无映射](article-file:1)')).not.toContain('<img');
  });

  it('限制输入和递归深度，同时给顶层可编辑块记录源偏移', () => {
    const html = renderMarkdown('## 标题\n\n正文', { editable: true });
    expect(html).toContain('<h2 data-md-start="0" data-md-end="5">标题</h2>');
    expect(html).toContain('<p data-md-start="7" data-md-end="9">正文</p>');
    expect((renderMarkdown('>'.repeat(500) + '文本').match(/<blockquote>/g) ?? []).length).toBeLessThanOrEqual(4);
    expect(renderMarkdown('a'.repeat(80_100)).length).toBe(80_000 + 7);
  });
});
