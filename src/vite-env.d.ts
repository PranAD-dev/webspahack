/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  const __XR_ENV_BASE__: string | undefined;
}

export {};

