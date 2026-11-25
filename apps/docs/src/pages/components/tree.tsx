import type { ComponentDoc } from '../../blocks/types';
import { TreeDemo } from './TreeDemo';
import source from './TreeDemo.tsx?raw';

export const treeDoc: ComponentDoc = {
  name: { 'zh-CN': '通用树', 'en-US': 'Tree' },
  summary: {
    'zh-CN': '分离目录展开、键盘焦点与单选状态的层级视图，适合资料目录和导航。',
    'en-US': 'Hierarchical view separating folder expansion, keyboard focus, and single selection, suitable for catalogs and navigation.',
  },
  usage: ['nodes 的 id 在整棵树内唯一且稳定，label 为纯文本；目录结构应无循环。',
    '选中和展开各自支持受控 / 非受控；单击选择，Enter 或双击通过 onActivate 通知宿主打开。',
    'selectable=false 允许聚焦与展开而不参与单选；disabled 禁用整条分支及其后代。',
    '权限勾选继续使用 PermissionTree / SelectionTree；本组件不包含级联复选、拖拽、请求或持久化。'],
  demos: [{ title: '目录、选择与禁用分支', layout: 'stack', code: source, render: () => <TreeDemo /> }],
  api: [{ component: 'Tree', props: [
    { name: 'label / nodes', type: 'string / readonly TreeNode[]', description: '可访问名称与节点；节点含 id、label、icon、disabled、selectable、children。' },
    { name: 'value / defaultValue / onValueChange', type: 'string | null / string | null / (id) => void', description: '当前单选值，初始为空；焦点移动不自动改变选择。' },
    { name: 'expanded / defaultExpanded / onExpandedChange', type: 'readonly string[] / readonly string[] / (ids) => void', description: '展开节点集合，默认收起。' },
    { name: 'onActivate', type: '(node: TreeNode) => void', description: 'Enter / 双击时回调；宿主负责跳转或加载。' },
    { name: 'disabled / labels', type: 'boolean / Partial<TreeLabels>', description: '整体禁用；空态、展开和收起文案读取 ConfigProvider。' },
    { name: '…div 属性', type: 'ComponentProps<div>', description: 'className、style、ref 和原生事件作用于 tree 根容器。' },
  ] }],
  a11y: ['使用 tree / treeitem / group、层级与同级位置；仅一个可见可用节点参与 Tab 顺序。',
    '上下移动，右键展开或进入子节点，左键收起或返回父节点；Home / End 跳首尾。',
    'Space 选择，Enter 选择并激活，输入字符按可见节点名称前缀定位；焦点与选中分别表达。'],
};
