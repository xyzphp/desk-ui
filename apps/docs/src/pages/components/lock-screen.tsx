import type { ComponentDoc } from '../../blocks/types';
import { LockScreenDemo } from './LockScreenDemo';
import source from './LockScreenDemo.tsx?raw';
import { LockCountdownDemo } from './LockCountdownDemo';
import countdownSource from './LockCountdownDemo.tsx?raw';

export const lockScreenDoc: ComponentDoc = {
  name: { 'zh-CN': '锁屏', 'en-US': 'Lock screen' },
  summary: { 'zh-CN': '复用原系统的模糊壁纸、大时钟和账号验证布局。', 'en-US': 'Reuses the original blurred wallpaper, large clock, and account verification layout.' },
  usage: ['放入由宿主设定高度和壁纸的 Desktop，组件铺满容器。时间、日期、姓名和头像由宿主传入。',
    'requiresPassword 显示带可见性切换的必填密码框。自定义验证可通过 unlockFields 替换，onUnlock 接收原生表单提交事件。',
    'busy 禁用表单和退出操作，结束后恢复可操作入口。error 在解锁按钮下方展示验证反馈。',
    '放在 Desktop 内时，锁屏遮罩、密码输入胶囊与解锁按钮会跟随外层 Desktop 的 cardStyle 切换毛玻璃或液态玻璃效果。',
    '真实锁定、凭据校验、底层内容隔离及会话和工作区清理由宿主负责。提交后应重置表单，密码禁止写入恢复快照。'],
  demos: [
    { title: '需要锁屏密码', description: '输入任意示例文字试用。首次提交模拟验证失败。',
      layout: 'stack', code: source, render: () => <LockScreenDemo requiresPassword /> },
    { title: '免密解锁', description: '直接点击解锁。两个示例均在本页模拟回调。',
      layout: 'stack', code: source, render: () => <LockScreenDemo requiresPassword={false} /> },
  ],
  api: [{ component: 'LockScreen', props: [
    { name: 'label / name / time', type: 'string', description: '必填：区域名称、账号显示名和时间文字。' },
    { name: 'date / dateTime / avatar', type: 'string / string / Avatar 属性', description: '日期文字、time 的机器时间与安全头像配置。' },
    { name: 'requiresPassword', type: 'boolean', description: '是否显示内置密码框，默认关闭。字段名为 password，表单重置时恢复隐藏。' },
    { name: 'unlockFields', type: 'ReactNode', description: '自定义验证字段。提供时替换内置密码框。' },
    { name: 'onUnlock', type: '(event: FormEvent<HTMLFormElement>) => void', description: '必填提交回调，保留原生必填校验。' },
    { name: 'onSignOut', type: '() => void', description: '可选退出入口，只回调。' },
    { name: 'busy / error / labels', type: 'boolean / ReactNode / Partial<LockScreenLabels>', description: '宿主忙碌、错误和默认文案覆盖。' },
    { name: '…section 属性', type: 'ComponentProps<section>', description: 'ref、className、style、aria 和原生事件。' },
  ] }],
  a11y: ['区域有名称，表单与错误关联，验证字段保留自己的标签和原生校验。',
    '不自动抢焦点或设置独立模态陷阱；宿主锁屏层负责隔离背景并设置初始焦点。忙碌焦点处理复用 useBusyFocus。'],
};

export const lockCountdownDoc: ComponentDoc = {
  name: { 'zh-CN': '锁屏倒计时', 'en-US': 'Lock countdown' },
  summary: { 'zh-CN': '桌面闲置即将触发锁屏时，显示剩余秒数和取消入口。', 'en-US': 'Shows remaining seconds and a cancel entry when the desktop is about to lock after idling.' },
  usage: [
    '宿主在闲置期限内传入剩余秒数，到期或取消后卸载组件。系统锁定、活动计时和跨标签页同步由宿主处理。',
    'onCancel 发出取消请求，宿主可据此上报实际活动。组件不读取会话、浏览器存储或密码。',
    '当所在 Desktop 设 cardStyle="liquid" 时，倒计时胶囊同步继承液态玻璃底色、高光边框与模糊效果。',
  ],
  demos: [{ title: '闲置 30 秒提醒', layout: 'stack', code: countdownSource, render: () => <LockCountdownDemo /> }],
  api: [{ component: 'LockCountdown', props: [
    { name: 'seconds', type: 'number', description: '剩余秒数，由宿主维护。' },
    { name: 'onCancel', type: '() => void', description: '点击取消按钮时调用。' },
    { name: 'labels', type: 'Partial<LockCountdownLabels>', description: '覆盖提醒、秒数与按钮文案。' },
  ] }],
  a11y: ['状态提示播报即将锁屏，数字更新不会每秒打断读屏。取消按钮可用键盘操作。'],
};
