import type { MarkdownParsedContent } from '@nuxt/content'

declare module '#app' {
  interface PageMeta {
    title?: string
  }
}

declare global {
  interface Image {
    src: string
    alt: string
    draggable: boolean
    width: number
    title: string
  }

  interface CustomParsedContent extends MarkdownParsedContent {
    image: Image
  }
}
