import { useState } from 'react';
import { Checkbox, Panel, SelectionArea, Stack, Text } from '@desk/ui';

const files = ['设计草稿', '界面截图', '会议记录', '素材目录', '归档', '只读文件'];
export function SelectionAreaDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Stack gap="md">
      <SelectionArea label="文件框选示例" value={selected} onValueChange={setSelected} disabledIds={['只读文件']}>
        {(preview) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, padding: 32 }}>
            {files.map((name) => (
              <div key={name} data-selection-id={name}>
                <Panel>
                  <Checkbox
                    checked={preview.includes(name)}
                    disabled={name === '只读文件'}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setSelected((current) => (checked ? [...current, name] : current.filter((id) => id !== name)));
                    }}
                  >
                    {name}
                  </Checkbox>
                </Panel>
              </div>
            ))}
          </div>
        )}
      </SelectionArea>
      <Text tone="muted" role="status">
        已提交：{selected.join('、') || '未选择'}
      </Text>
    </Stack>
  );
}
