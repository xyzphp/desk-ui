import type { ComponentDoc } from '../../blocks/types';
import { LanguageSwitcherDemo } from './LanguageSwitcherDemo';
import source from './LanguageSwitcherDemo.tsx?raw';
import { LanguageMenuDemo } from './LanguageMenuDemo';
import menuSource from './LanguageMenuDemo.tsx?raw';

export const languageSwitcherDoc: ComponentDoc = {
  name: { 'zh-CN': '语言切换', 'en-US': 'Language switcher' },
  summary: {
    'zh-CN': '菜单栏上的语言入口：无边框显示当前语言短码，点一下换成另一种语言；多于两种语言时点开单选菜单。',
    'en-US': 'Menu-bar language entry: shows the current language short code without a border and toggles with one click; with more than two languages it opens a radio menu.',
  },
  usage: [
    '只有两种语言时点击入口直接互切，不弹菜单；语言多于两种时才弹出单选菜单，菜单里可选“跟随系统”。未手动切换前默认跟随系统。',
    '语言来自登记表 locales（当前为简体中文、English）；新增语言只在登记表加一项并补齐字典，入口与切换逻辑不变。',
    'choice 是偏好（SYSTEM_LOCALE 或语言标签），current 是实际生效的语言；跟随系统时由宿主用 resolveLocale(choice, navigator.languages) 解析。',
    '组件只回调选择：偏好的保存、根元素 lang 与页面标题由宿主负责；把解析结果交给根部的 ConfigProvider（locale 与 labels）后界面即时切换，不刷新页面。',
    '菜单栏与任务栏用 menubar 变体，后台顶栏、登录页等普通工具区用 plain 变体；一个界面只放一个入口。',
    '应用自己的文案用 defineMessages 登记、useMessages 读取；日期、数字与排序格式化用 useLocale 取语言标签，不写死 zh-CN。',
    '语言名称始终用该语言自己的写法（简体中文 / English），不随界面语言翻译。',
  ],
  demos: [
    { title: '两种语言直接互切', layout: 'stack', code: source, render: () => <LanguageSwitcherDemo /> },
    { title: '多于两种语言时弹出菜单', code: menuSource, render: () => <LanguageMenuDemo /> },
  ],
  api: [
    {
      component: 'LanguageSwitcher',
      props: [
        { name: 'choice', type: 'string', description: '语言偏好：SYSTEM_LOCALE（跟随系统）或某个语言标签。' },
        { name: 'current', type: 'string', description: '实际生效的语言标签，决定入口短码与可访问名称。' },
        {
          name: 'onChoiceChange',
          type: '(choice: string) => void',
          description: '选择了不同的偏好时回调；重复选择当前项不回调。',
        },
        {
          name: 'locales',
          type: 'readonly LanguageOption[]',
          default: 'locales',
          description: '可选语言，含 tag / name / short；不超过两种时点击互切，多于两种时弹出菜单。',
        },
        {
          name: 'allowSystem',
          type: 'boolean',
          default: 'true',
          description: '菜单形态下是否提供“跟随系统”；互切形态没有该项。',
        },
        {
          name: 'variant',
          type: "'menubar' | 'plain'",
          default: "'menubar'",
          description: '菜单栏 / 任务栏形态或普通工具区形态。',
        },
        { name: 'align', type: "'left' | 'right'", default: "'right'", description: '菜单相对入口的水平停靠。' },
        {
          name: 'labels',
          type: 'LabelOverrides<LanguageSwitcherLabels>',
          description: '入口名称、当前语言、互切目标与跟随系统文案，默认读取 ConfigProvider。',
        },
      ],
    },
    {
      component: 'locales / resolveLocale / useMessages',
      props: [
        {
          name: 'locales',
          type: 'readonly LocaleDefinition[]',
          description: '语言登记表，每项含 tag、name、short 与完整组件文案；第一项是回退语言。',
        },
        {
          name: 'resolveLocale(choice, systemLanguages?)',
          type: '=> LocaleDefinition',
          description: '把偏好解析成登记项；先完全匹配，再按主语言匹配，最后回退。',
        },
        {
          name: 'normalizeLocaleChoice(value)',
          type: '=> string',
          description: '校验持久化的偏好，未登记的值回退为跟随系统。',
        },
        {
          name: 'ConfigProvider locale',
          type: 'string',
          description: '当前语言标签，嵌套时继承父级；useLocale() 读取。',
        },
        {
          name: 'defineMessages(base, source, translations)',
          type: '=> MessageCatalog<T>',
          description: '登记应用文案；基准字典约束其它语言的键与函数签名，缺键编译期报错。',
        },
        {
          name: 'useMessages(catalog) / pickMessages(catalog, locale)',
          type: '=> T',
          description: '按当前语言取字典，没有对应翻译时回退基准语言；后者供非 React 代码使用。',
        },
      ],
    },
  ],
  a11y: [
    '互切形态是普通按钮，可访问名称说明点击后的目标语言（切换到 English）；短码仅作视觉提示。',
    '菜单形态的入口带 aria-haspopup / aria-expanded，可访问名称包含当前语言；菜单项为 menuitemradio，当前偏好 aria-checked，语言项带各自的 lang。',
    '菜单里方向键、Home / End 在菜单项间移动，Esc、外部点击或选择后关闭并把焦点还给入口。',
    '短码字号 12px、方框描边使用当前文字色，深浅色下对比度随文字色。',
  ],
};
