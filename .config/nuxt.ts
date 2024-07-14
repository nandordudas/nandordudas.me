import { pathcat } from 'pathcat'

import { ALLOWED_LOCALES, DEFAULT_LOCALE } from '../lib/utils'
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
    // pageTransition: { name: 'page', mode: 'out-in' },
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
    defaultLocale: DEFAULT_LOCALE,
    langDir: 'locales/',
    locales: [
      { code: 'en', iso: 'en', file: 'en.yaml', isCatchallLocale: true, name: 'English' },
      { code: 'hu', iso: 'hu', file: 'hu.yaml', name: 'Magyar' },
    ],
    lazy: true,
    strategy: 'no_prefix',
    experimental: {
      localeDetector: './lib/locale-detector.ts',
    },
  },
  content: {
    documentDriven: true,
    locales: ALLOWED_LOCALES as unknown as string[],
    defaultLocale: DEFAULT_LOCALE,
  },
  routeRules: {
    ...ALLOWED_LOCALES.reduce((acc, locale) => ({
      ...acc,
      [pathcat('/api/:locale/search.json', { locale })]: { prerender: true },
    }), Object.create(null) as unknown as any), // INFO: NuxtConfig['routeRules']
  },
  eslint: {
    config: { autoInit: false, standalone: false },
  },
  experimental: {
    viewTransition: true,
  },
})
