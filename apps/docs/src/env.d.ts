/// <reference types="vite/client" />

declare module '*?metadata' {
  const docs: Record<string, import('./blocks/types').DocMetadata>;
  export default docs;
}
