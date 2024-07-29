import type { MarkdownParsedContent } from '@nuxt/content'

declare module '#app' {
  interface PageMeta {
    title?: string
  }
}

declare global {
  interface CustomParsedContent extends MarkdownParsedContent {
    image: HTMLImageElement
  }

  type Prettify<T> = {
    [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K]
  } & unknown
}
