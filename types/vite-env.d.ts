// https://vitejs.dev/guide/env-and-mode#intellisense-for-typescript
interface ImportMetaEnv {
  readonly DEV_SERVER_CERT: string
  readonly DEV_SERVER_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
