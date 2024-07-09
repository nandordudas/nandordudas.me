type PageType = 'page'

declare module '#app' {
  interface PageMeta {
    pageType: PageType
  }
}

export { }
