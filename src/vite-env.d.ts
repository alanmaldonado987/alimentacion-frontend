/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_VERSION_APP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

