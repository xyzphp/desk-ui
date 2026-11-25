import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, iconNames, type IconName } from './Icon';

const settingsIcons = [
  'user-round',
  'messages-square',
  'package',
  'bot',
  'arrow-right',
  'boxes',
  'database',
  'plug',
] as const satisfies readonly IconName[];

const workshopReportIcons = [
  'archive',
  'ban',
  'chart-column',
  'chart-line',
  'chart-pie',
  'check-circle-2',
  'circle-off',
  'circle-plus',
  'file-plus',
  'hash',
  'pause',
  'play',
  'user-plus',
  'workflow',
] as const satisfies readonly IconName[];

const accountEditorIcons = ['shuffle', 'user-round-plus'] as const satisfies readonly IconName[];

describe('original settings icon names', () => {
  it.each(settingsIcons)('%s is registered and renders an SVG', (name) => {
    expect(iconNames).toContain(name);
    expect(render(<Icon name={name} />).container.querySelector('svg')).not.toBeNull();
  });
});

describe('original article icon names', () => {
  it('crop is registered and renders an SVG', () => {
    expect(iconNames).toContain('crop');
    expect(render(<Icon name="crop" />).container.querySelector('svg')).not.toBeNull();
  });
});

describe('application workshop report icon names', () => {
  it.each(workshopReportIcons)('%s is registered and renders an SVG', (name) => {
    expect(iconNames).toContain(name);
    expect(render(<Icon name={name} />).container.querySelector('svg')).not.toBeNull();
  });
});

describe('original account editor icon names', () => {
  it.each(accountEditorIcons)('%s is registered and renders an SVG', (name) => {
    expect(iconNames).toContain(name);
    expect(render(<Icon name={name} />).container.querySelector('svg')).not.toBeNull();
  });
});
