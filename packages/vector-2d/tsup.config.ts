import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils.ts',
    'src/vector-2d.ts',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  minify: true,
  format: 'esm',
  dts: true,
})
