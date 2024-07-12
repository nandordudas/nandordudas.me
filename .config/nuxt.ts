import { httpsServerFiles } from '../lib/server.utils'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-10',
  future: {
    compatibilityVersion: 4,
  },
  devtools: {
    timeline: { enabled: true },
  },
  devServer: {
    https: httpsServerFiles(),
    host: 'nandordudas.me',
  },
  app: {
    head: {
      templateParams: { separator: '·' },
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  css: [
    '~/assets/css/main.css',
  ],
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],
  extends: [
    '@nuxt/ui-pro',
  ],
  i18n: {
    defaultLocale: 'en',
    langDir: 'locales/',
    locales: [
      { code: 'en', iso: 'en', file: 'en.yaml', isCatchallLocale: true },
      { code: 'hu', iso: 'hu', file: 'hu.yaml' },
    ],
    lazy: true,
    strategy: 'no_prefix',
  },
  content: {
    documentDriven: true,
    locales: ['en', 'hu'],
    defaultLocale: 'en',
  },
  routeRules: {
    '/api/en/search.json': { prerender: true },
    '/api/hu/search.json': { prerender: true },
  },
  eslint: {
    config: { autoInit: false, standalone: false },
  },
})
