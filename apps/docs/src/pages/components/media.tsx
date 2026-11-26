import { useState } from 'react';
import {
  Button, IconButton, ImagePreview, MessageComposer, Switch, Tag, UploadZone,
  type ImagePreviewLabels, type MessageComposerLabels, type UploadRejectionReason, type UploadZoneLabels,
} from '@xyzos/desk-ui';
import lake from '../../assets/preview-lake.svg';
import coast from '../../assets/preview-coast.svg';
import type { ComponentDoc } from '../../blocks/types';

const reasons: Record<UploadRejectionReason, string> = {
  type: '文件类型不支持', size: '文件过大', count: '超出文件数量', duplicate: '文件已选择', directory: '请选择文件，不能投放文件夹',
};
const uploadLabels: UploadZoneLabels = {
  fileList: '已选文件', remove: (file) => '移除 ' + file.name, clear: '清空文件', busy: '正在处理文件…',
  rejected: ({ file, reason }) => file.name + '：' + reasons[reason],
};
const uploadLabelsCode = `const reasons: Record<UploadRejectionReason, string> = {
  type: '文件类型不支持', size: '文件过大', count: '超出文件数量',
  duplicate: '文件已选择', directory: '请选择文件，不能投放文件夹',
};
const uploadLabels: UploadZoneLabels = {
  fileList: '已选文件', remove: (file) => '移除 ' + file.name,
  clear: '清空文件', busy: '正在处理文件…',
  rejected: ({ file, reason }) => file.name + '：' + reasons[reason],
};`;

function UploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  return <>
    <Switch checked={busy} onCheckedChange={setBusy}>演示处理中状态</Switch>
    <UploadZone label="选择或拖入图片" description="支持 PNG、JPEG、WebP，最多 3 张，每张不超过 2 MB。"
      accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" multiple maxFiles={3} maxFileSize={2 * 1024 * 1024}
      files={files} onFilesChange={setFiles} busy={busy} labels={uploadLabels} />
  </>;
}

export const uploadZoneDoc: ComponentDoc = {
  name: { 'zh-CN': '上传区', 'en-US': 'Upload zone' },
  summary: {
    'zh-CN': '选择或拖入临时文件，统一类型、大小、数量与重复检查，并显示文件列表和拒绝原因。',
    'en-US': 'Picks or drops temporary files with unified type, size, count, and duplicate checks, showing the file list and rejection reasons.',
  },
  usage: [
    '单选模式用有效新文件替换原选择；multiple 模式追加。混合批次接受有效部分，拒绝部分单独显示；整个批次无效时保留原选择。',
    '重复文件按名称、大小、类型和 lastModified 判断。accept 同时传扩展名与 MIME 可兼容没有 MIME 信息的文件。客户端检查不能替代宿主的内容、权限及服务端校验。',
    'files 与 onFilesChange 用于受控选择；defaultFiles 只初始化非受控状态。移除、清空和非受控表单重置会回调 onFilesChange，受控重置由宿主处理。',
    '组件不上传、不创建预览 URL，也不把文件同步进原生表单字段。宿主通过 files 构造上传数据，管理请求、取消与临时 URL；刷新恢复只保存可恢复的业务字段，未上传 File 不落盘。',
  ],
  demos: [
    {
      title: '图片多选与校验', description: '可混合投放不同文件，查看有效选择和逐项错误；切换开关可检查忙碌状态。', layout: 'stack',
      code: uploadLabelsCode + `
function UploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  return <>
    <Switch checked={busy} onCheckedChange={setBusy}>演示处理中状态</Switch>
    <UploadZone label="选择或拖入图片"
      description="支持 PNG、JPEG、WebP，最多 3 张，每张不超过 2 MB。"
      accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
      multiple maxFiles={3} maxFileSize={2 * 1024 * 1024}
      files={files} onFilesChange={setFiles} busy={busy} labels={uploadLabels} />
  </>;
}`, render: () => <UploadDemo />,
    },
    {
      title: '单文件与禁用', layout: 'stack', code: uploadLabelsCode + `
<UploadZone label="选择或拖入压缩包" description="只选择一个 ZIP 文件，最大 1 MB。"
  accept=".zip,application/zip" maxFileSize={1024 * 1024} labels={uploadLabels} />
<UploadZone label="当前不可选择文件" disabled labels={uploadLabels} />`,
      render: () => <>
        <UploadZone label="选择或拖入压缩包" description="只选择一个 ZIP 文件，最大 1 MB。" accept=".zip,application/zip" maxFileSize={1024 * 1024} labels={uploadLabels} />
        <UploadZone label="当前不可选择文件" disabled labels={uploadLabels} />
      </>,
    },
  ],
  api: [{ component: 'UploadZone', props: [
    { name: 'label / description / icon', type: 'string / ReactNode / IconName', description: 'label 必填，选择按钮名称；description 简短提示；icon 默认 upload。' },
    { name: 'files / defaultFiles', type: 'readonly File[]', default: '[]', description: '受控文件或非受控初值，初值由宿主预先校验。' },
    { name: 'onFilesChange', type: '(files: File[]) => void', description: '接受、移除或清空后的完整列表；输入框每次选择后清空，可再次选择同一文件。' },
    { name: 'accept / multiple', type: 'string / boolean', default: "'' / false", description: '原生 accept 格式与是否追加多选。' },
    { name: 'maxFiles / maxFileSize', type: 'number / number', description: '文件总数上限、每文件最大字节数；数量取非负整数。单选最多一个。' },
    { name: 'onReject', type: '(items: UploadRejection[]) => void', description: '逐项返回 file 和 reason：type、size、count、duplicate、directory。目录检查取决于浏览器提供的元数据。' },
    { name: 'disabled / busy', type: 'boolean', description: '冻结选择、移除、清空和投放；busy 另外显示状态。' },
    { name: 'error', type: 'ReactNode', description: '宿主错误，优先于当前批次拒绝信息显示。' },
    { name: 'labels', type: 'UploadZoneLabels', description: '必填：fileList、clear、busy、remove(file)、rejected({ file, reason })。' },
    { name: '…div 属性', type: "ComponentProps<'div'>", description: '透传 ref、className、aria 属性与拖拽事件；拖拽处理器 preventDefault 可接管内置处理。' },
  ] }],
  a11y: ['选择区是原生 button，支持 Tab、Enter、Space 打开原生文件选择器。', '提示和错误关联到选择按钮，拒绝信息使用 alert；移除按钮带文件名称，移除当前焦点项后返回选择区。', '禁用和忙碌使用原生 disabled，仍拦截文件投放的默认导航；长文件名省略但保留完整 title。'],
};

const previewLabels: ImagePreviewLabels = {
  close: '关闭图片预览', previous: '上一张图片', next: '下一张图片', loading: '正在载入图片…', error: '图片加载失败',
  retry: '重新加载', empty: '暂无可预览图片', count: (index, total) => index + ' / ' + total,
  zoomOut: '缩小图片', zoomIn: '放大图片', resetZoom: '适应窗口',
};
const previewLabelsCode = `const previewLabels: ImagePreviewLabels = {
  close: '关闭图片预览', previous: '上一张图片', next: '下一张图片',
  loading: '正在载入图片…', error: '图片加载失败', retry: '重新加载',
  empty: '暂无可预览图片', count: (index, total) => index + ' / ' + total,
  zoomOut: '缩小图片', zoomIn: '放大图片', resetZoom: '适应窗口',
};`;
const images = [
  { src: lake, alt: '群山环绕的蓝色湖泊', title: '山间湖泊', description: '1.2 MB · 1920 × 1080' },
  { src: coast, alt: '落日下的海岸', title: '海边日落', description: '860 KB · 1600 × 900' },
];

function GalleryDemo() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return <>
    {images.map((image, i) => <Button key={image.src} icon="image" onClick={() => { setIndex(i); setOpen(true); }}>{image.title}</Button>)}
    <ImagePreview open={open} label="示例图片预览" items={images} index={index} onIndexChange={setIndex} onClose={() => setOpen(false)} labels={previewLabels}
      zoomable toolbarActions={<Button size="sm" className="ds-image-preview-button" icon="download">下载示例</Button>} />
  </>;
}

function FailedImageDemo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>查看加载失败状态</Button>
    <ImagePreview open={open} label="失败状态示例" items={[{ src: 'data:image/png;base64,AA==', alt: '损坏的示例图片' }]} onClose={() => setOpen(false)} labels={previewLabels} />
  </>;
}

export const imagePreviewDoc: ComponentDoc = {
  name: { 'zh-CN': '图片预览', 'en-US': 'Image preview' },
  summary: {
    'zh-CN': '用原生对话框预览图片，支持首尾切图、加载状态、失败重试和焦点返回。',
    'en-US': 'Previews images in a native dialog with first / last navigation, loading state, failure retry, and focus restoration.',
  },
  usage: [
    'open 和 onClose 由宿主控制；关闭请求不直接修改 open。打开时把焦点放到关闭按钮，关闭或卸载后返回仍存在的触发器。',
    'items 包含 src、alt、可选 title 和 description。左右切图不循环；传 index / onIndexChange 可与外部缩略图同步，重新打开的位置由宿主选择。',
    '详情页的一组截图或示例图直接用 ImageGallery：它负责缩略图条并在点击时打开本组件。',
    '使用原生 dialog.showModal 顶层展示与焦点隔离；zoomable 启用 25%–500% 缩放、滚轮 / 快捷键和拖拽平移。宿主可通过 toolbarActions 放入下载等业务操作，组件不发起请求。',
    '仅接受相对路径、HTTP(S)、blob 和 base64 栅格图片 data URL；拒绝脚本、凭据 URL、HTML 与 SVG data URL。图片资源采用 no-referrer；宿主仍负责 URL 来源、资源授权和远端内容复核。',
    'File 的临时预览 URL 由宿主创建，在不再使用或页面卸载时 revokeObjectURL。组件切图或关闭会移除旧图片节点，不缓存 URL。',
  ],
  demos: [
    {
      title: '多图预览', description: '点击任一图片名称打开；可用左右方向键切换，Esc 或关闭按钮返回文档。',
      code: `import lake from '../../assets/preview-lake.svg';
import coast from '../../assets/preview-coast.svg';
` + previewLabelsCode + `
const images = [
  { src: lake, alt: '群山环绕的蓝色湖泊', title: '山间湖泊', description: '1.2 MB · 1920 × 1080' },
  { src: coast, alt: '落日下的海岸', title: '海边日落', description: '860 KB · 1600 × 900' },
];
function GalleryDemo() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return <>
    {images.map((image, i) => <Button key={image.src} icon="image"
      onClick={() => { setIndex(i); setOpen(true); }}>{image.title}</Button>)}
    <ImagePreview open={open} label="示例图片预览" items={images}
      index={index} onIndexChange={setIndex} onClose={() => setOpen(false)} labels={previewLabels} zoomable
      toolbarActions={<Button size="sm" className="ds-image-preview-button" icon="download">下载示例</Button>} />
  </>;
}`, render: () => <GalleryDemo />,
    },
    {
      title: '加载失败与重试', description: '使用本地构造的损坏图片数据展示失败，不请求外部服务。',
      code: previewLabelsCode + `
function FailedImageDemo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>查看加载失败状态</Button>
    <ImagePreview open={open} label="失败状态示例"
      items={[{ src: 'data:image/png;base64,AA==', alt: '损坏的示例图片' }]}
      onClose={() => setOpen(false)} labels={previewLabels} />
  </>;
}`, render: () => <FailedImageDemo />,
    },
  ],
  api: [{ component: 'ImagePreview', props: [
    { name: 'open / onClose', type: 'boolean / () => void', description: '必填，控制显示；关闭按钮、原生取消和背景点击只回调 onClose。' },
    { name: 'label', type: 'string', description: '必填，对话框名称；没有图片标题时也用作可见标题。' },
    { name: 'items', type: 'readonly ImagePreviewItem[]', description: '必填，{ src: string; alt: string; title?: string; description?: string }；空列表显示 labels.empty。' },
    { name: 'index / defaultIndex / onIndexChange', type: 'number / number / (index: number) => void', default: '0', description: '从 0 开始。受控更新等待宿主；越界值只在显示时夹紧，不回写。' },
    { name: 'toolbarActions', type: 'ReactNode', description: '可选，渲染在预览工具栏内；宿主操作由页面执行，组件不发请求。' },
    { name: 'zoomable', type: 'boolean', default: 'false', description: '启用缩放控制、滚轮缩放、键盘 +/-/0 与拖拽平移。' },
    { name: 'labels', type: 'Partial<ImagePreviewLabels>', default: 'ConfigProvider', description: '覆盖 close、previous、next、loading、error、retry、empty、count 与 zoomOut / zoomIn / resetZoom 文案；缺省取 ConfigProvider 的 imagePreview 分组。' },
    { name: 'className', type: 'string', description: '附加对话框类名；主体按原生预览使用深色衬底。' },
  ] }],
  a11y: ['使用有名称的原生 modal dialog，初始聚焦关闭按钮，浏览器负责焦点隔离和 Tab 循环；需要支持 showModal 的环境。', 'Esc 通过 cancel 请求关闭，左右方向键切换且首尾按钮禁用；从图片拖向背景不会误关闭。', '每张图片必须提供 alt；加载、错误及序号使用状态区域播报，切图和重试会重建图片，旧图回调不会更新新图状态。'],
};

const composerLabels: MessageComposerLabels = { send: '发送', sending: '正在发送…', stop: '停止发送' };
const composerLabelsCode = `const composerLabels = { send: '发送', sending: '正在发送…', stop: '停止发送' };`;

function ComposerDemo() {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [status, setStatus] = useState('');
  return <>
    <Switch checked={busy} onCheckedChange={setBusy}>演示发送中状态</Switch>
    <Switch checked={offline} onCheckedChange={setOffline}>暂停发送，保留草稿编辑</Switch>
    <MessageComposer label="消息内容" value={value} onValueChange={setValue} busy={busy} allowEmpty={attachment} sendDisabled={offline}
      inputProps={{ placeholder: '输入消息，Enter 发送，Shift + Enter 换行', maxLength: 2000 }}
      attachments={attachment && <Button size="sm" icon="x" onClick={() => setAttachment(false)}>移除示例图片</Button>}
      tools={<IconButton icon="image" variant="quiet" label="添加示例图片" onClick={() => setAttachment(true)} />}
      onSend={(text) => { setStatus('已演示发送：' + (text || '图片附件')); setValue(''); setAttachment(false); }}
      onStop={() => setBusy(false)} status={status} labels={composerLabels} />
  </>;
}

export const messageComposerDoc: ComponentDoc = {
  name: { 'zh-CN': '消息输入框', 'en-US': 'Message composer' },
  summary: {
    'zh-CN': '草稿、附件和工具区共用的消息输入容器，支持自动增高、快捷发送与忙碌状态。',
    'en-US': 'Shared message input container for drafts, attachments, and tool areas, with auto growth, quick send, and busy state.',
  },
  usage: [
    'value / onValueChange 控制草稿，也可用 defaultValue 初始化非受控草稿。onSend 收到原始文本；组件不自动清空，宿主在发送成功后清理，失败保留原文。',
    '默认 Enter 发送、Shift + Enter 换行；输入法组合期间及 229 键码不触发发送。sendOnEnter=false 时只由按钮发送，Ctrl / Meta / Alt 的组合键留给宿主。',
    'attachments 和 tools 是插槽；原生按钮和表单控件在 disabled、readOnly、busy 时统一禁用，自定义可点击组件仍需宿主响应这些状态。只发送附件时显式传 allowEmpty。',
    'onSend 由宿主同步设置 busy 再开始异步请求，并负责错误、取消及重复提交防护；可通过 onStop 提供停止操作。busy 时保留草稿且只读。',
    '聊天 AI 生成期间使用 sendDisabled 暂停发送并保留草稿编辑；宿主在应用前核对原文快照，用户编辑后重新生成。生成图片先上传为当前会话的私有附件，再由用户发送。',
    '不创建 form，也不提交外层表单；非受控草稿支持原生表单重置和取消重置。恢复、会话切换、锁屏及卸载清理由宿主处理，组件不读写存储。',
  ],
  demos: [
    {
      title: '草稿、附件与发送', description: '示例只在本页更新状态，演示输入、换行、附件单独发送和停止操作。', layout: 'stack',
      code: composerLabelsCode + `
function ComposerDemo() {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  return <>
    <Switch checked={busy} onCheckedChange={setBusy}>演示发送中状态</Switch>
    <MessageComposer label="消息内容" value={value} onValueChange={setValue}
      busy={busy} allowEmpty={attachment}
      inputProps={{ placeholder: '输入消息，Enter 发送，Shift + Enter 换行', maxLength: 2000 }}
      attachments={attachment && <Button size="sm" icon="x"
        onClick={() => setAttachment(false)}>移除示例图片</Button>}
      tools={<IconButton icon="image" variant="quiet" label="添加示例图片"
        onClick={() => setAttachment(true)} />}
      onSend={(text) => {
        setStatus('已演示发送：' + (text || '图片附件')); setValue(''); setAttachment(false);
      }}
      onStop={() => setBusy(false)} status={status} labels={composerLabels} />
  </>;
}`, render: () => <ComposerDemo />,
    },
    {
      title: '只读内容', layout: 'stack', code: composerLabelsCode + `
<MessageComposer label="历史草稿" value="这条草稿当前只读。" readOnly
  onSend={() => {}} tools={<Tag>只读</Tag>} labels={composerLabels} />`,
      render: () => <MessageComposer label="历史草稿" value="这条草稿当前只读。" readOnly onSend={() => {}} tools={<Tag>只读</Tag>} labels={composerLabels} />,
    },
  ],
  api: [{ component: 'MessageComposer', props: [
    { name: 'label / labels', type: 'string / MessageComposerLabels', description: '必填，输入框名称；labels 包含 send、sending、stop。' },
    { name: 'value / defaultValue / onValueChange', type: 'string / string / (value: string) => void', default: "''", description: '受控 / 非受控草稿与完整原文变化。' },
    { name: 'onSend / onStop', type: '(value: string) => void / () => void', description: 'onSend 必填，由宿主处理发送；busy 且有 onStop 时显示停止按钮。' },
    { name: 'disabled / readOnly / busy', type: 'boolean', default: 'false', description: '阻止编辑与发送；busy 或 readOnly 的文本仍可聚焦复制。disabled 同时禁用停止按钮。' },
    { name: 'allowEmpty / sendOnEnter', type: 'boolean / boolean', default: 'false / true', description: '允许空文本发送；是否使用 Enter 快捷发送。' },
    { name: 'sendDisabled', type: 'boolean', default: 'false', description: '只禁用发送按钮和 Enter 发送，保留文字与附件工具编辑，用于离线或结果待确认。' },
    { name: 'sendIcon', type: 'IconName | null', default: 'undefined', description: '发送按钮图标；默认无图标，传 null 或省略时不显示图标。' },
    { name: 'attachments / tools', type: 'ReactNode', description: '输入区上方的附件、下方的工具；宿主管理文件生命周期，原生控件继承 fieldset 禁用状态。' },
    { name: 'status / error', type: 'ReactNode', description: '状态使用 status，错误使用 alert，并与输入框关联。' },
    { name: 'inputProps', type: '原生 textarea 属性（受控属性除外）', description: 'placeholder、maxLength、name、form、ref、输入法 / 键盘事件等；onKeyDown.preventDefault 可接管快捷键。高度随内容在 32–96px 之间增长。' },
    { name: '…div 属性', type: "ComponentProps<'div'>", description: '透传外层 ref、className 和原生属性。' },
  ] }],
  a11y: ['原生 textarea 和 button，工具与附件使用 fieldset 统一原生禁用语义；中文输入法组合状态不会触发快捷发送。', '自动增长达到 96px 后使用公共滚动条；宽度不超过 380px 时操作区另起一行。', '输入区保留中性焦点提示，错误和状态关联到输入框；发送成功后清空或失败保留由宿主明确决定。'],
};
