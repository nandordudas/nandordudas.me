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
}
