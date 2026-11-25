import type { Plugin } from 'vite';
import type { DocMetadata } from '../src/blocks/types';
export function extractDocMetadata(source: string, filename: string): Record<string, DocMetadata>;
export function docMetadata(): Plugin;
