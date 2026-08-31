/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_WOMPI_PUBLIC_KEY?: string
  readonly VITE_WOMPI_JS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
