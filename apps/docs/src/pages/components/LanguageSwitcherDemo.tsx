import { useState } from 'react';
import { ConfigProvider, CopyButton, Field, LanguageSwitcher, PasswordInput, resolveLocale, Select, SYSTEM_LOCALE } from '@desk/ui';
import { copyText } from './CopyDemo';

export function LanguageSwitcherDemo() {
  const [choice, setChoice] = useState(SYSTEM_LOCALE);
  // 库不读浏览器语言：由宿主把系统语言列表传给 resolveLocale。
  const locale = resolveLocale(choice, navigator.languages);
  return (
    <ConfigProvider locale={locale.tag} labels={locale.labels}>
      <div style={{ display: 'grid', gap: 16 }}>
        <LanguageSwitcher variant="plain" align="left" choice={choice} current={locale.tag} onChoiceChange={setChoice} />
        <Field label="Select">
          <Select>
            <option value="" hidden />
          </Select>
        </Field>
        <Field label="PasswordInput">
          <PasswordInput />
        </Field>
        <CopyButton text="example" onCopy={copyText} />
      </div>
    </ConfigProvider>
  );
}
