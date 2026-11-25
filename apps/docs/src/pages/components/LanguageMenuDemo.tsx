import { useState } from 'react';
import { LanguageSwitcher, Text, type LanguageOption } from '@desk/ui';

// 仅演示多于两种语言时的菜单形态；日本語没有登记字典，不会改变界面文案。
const options: LanguageOption[] = [
  { tag: 'zh-CN', name: '简体中文', short: '中' },
  { tag: 'en-US', name: 'English', short: 'EN' },
  { tag: 'ja-JP', name: '日本語', short: 'あ' },
];

export function LanguageMenuDemo() {
  const [choice, setChoice] = useState('zh-CN');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <LanguageSwitcher variant="plain" align="left" locales={options} allowSystem={false} choice={choice} current={choice} onChoiceChange={setChoice} />
      <Text>{options.find((item) => item.tag === choice)?.name}</Text>
    </div>
  );
}
