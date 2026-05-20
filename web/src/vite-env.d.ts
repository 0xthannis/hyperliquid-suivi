/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRADER_WALLET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
