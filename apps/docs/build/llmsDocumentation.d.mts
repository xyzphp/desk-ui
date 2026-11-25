import type { Plugin } from 'vite';

export function buildLlmsAssets(): Promise<Map<string, string>>;
export function llmsDocumentation(): Plugin;
