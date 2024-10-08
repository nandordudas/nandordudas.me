import type { Config } from 'tailwindcss'

import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>> {
  content: [
    'content/**/*.md',
  ],
  theme: {
    extend: {
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
