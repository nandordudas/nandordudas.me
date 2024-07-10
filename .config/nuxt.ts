import { httpsServerFiles } from '../lib/server.utils'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
  },
  devtools: {
    timeline: { enabled: true },
  },
  devServer: {
    https: httpsServerFiles(),
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
  modules: ['@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'en',
    langDir: 'locales/',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en-US.yaml', isCatchallLocale: true },
    ],
    lazy: true,
  },
})
