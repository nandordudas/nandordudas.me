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
      meta: [
        { name: 'color-scheme', content: 'light dark' },
      ],
      templateParams: { separator: '·' },
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  css: [
    '~/assets/css/main.css',
  ],
  modules: ['@nuxtjs/i18n', '@nuxt/content', '@nuxt/image'],
  i18n: {
    defaultLocale: 'en',
    langDir: 'locales/',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en-US.yaml', isCatchallLocale: true },
      { code: 'hu', iso: 'hu-HU', file: 'hu-HU.yaml' },
    ],
    lazy: true,
  },
  content: {
    // documentDriven: true,
    // contentHead: false,
    locales: ['en', 'hu'],
    defaultLocale: 'en',
  },
})
