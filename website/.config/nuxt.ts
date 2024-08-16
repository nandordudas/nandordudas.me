import { httpsServerFiles } from '../lib/server.utils'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-10',
  future: {
    compatibilityVersion: 4,
  },
  devServer: {
    https: httpsServerFiles(),
  },
  app: {
    head: {
      templateParams: { separator: '·' },
    },
  },
  css: [
    '~/assets/css/main.css',
  ],
  modules: [
    'nuxt-content-twoslash',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@nuxt/test-utils/module',
  ],
  extends: [
    '@nuxt/ui-pro',
  ],
  i18n: {
    defaultLocale: 'en',
    langDir: 'locales/',
    locales: [
      { code: 'en', language: 'en-US', file: 'en-US.yaml', isCatchallLocale: true, name: 'English' },
    ],
    lazy: true,
    strategy: 'no_prefix',
    experimental: {
      localeDetector: './lib/locale-detector.ts',
    },
  },
  content: {
    defaultLocale: 'en',
    highlight: {
      theme: {
        default: 'vitesse-light',
        dark: 'material-theme-darker',
      },
    },
  },
  routeRules: {
    '/api/search.json': { prerender: true },
  },
  eslint: {
    config: { autoInit: false, standalone: false },
  },
  experimental: {
    viewTransition: true,
  },
  site: {
    url: 'https://nandordudas.me',
    name: 'Nándor Dudás',
    description: 'Welcome to my awesome site!',
  },
  devtools: {
    enabled: false,
  },
  mdc: {
    highlight: {
      langs: ['ts', 'php'],
    },
  },
  twoslash: {
    floatingVueOptions: {
      classMarkdown: 'prose prose-primary dark:prose-invert',
    },
    throws: false,
  },
})
