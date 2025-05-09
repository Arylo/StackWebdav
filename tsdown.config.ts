import { defineConfig } from 'tsdown'
import { globSync } from 'glob'

const isCI = !!process.env.CI

export default defineConfig({
  entry: './src/index.ts',
  target: ['node20'],
  format: 'cjs',
  clean: true,
  dts: false,
  platform: 'node',
  sourcemap: !isCI,
  copy: globSync('./src/**/*.pug'),
})
