import path from 'path'
import { defineConfig } from "vite";
import VuePlugin from 'unplugin-vue/vite'
import UnoCSSPlugin from 'unocss/vite'
import { presetAttributify, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  root: path.resolve(__dirname, 'app'),
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/index.html'),
      },
      output: {
        manualChunks: {
          vue: ['vue'],
        },
      },
    },
    cssCodeSplit: true,
  },
  plugins: [
    VuePlugin({
      isProduction: true,
    }),
    UnoCSSPlugin({
      mode: 'vue-scoped',
      presets: [
        presetAttributify(),
        presetWind3(),
        presetIcons({
          cdn: 'https://esm.sh/'
        }),
      ],
      transformers: [transformerDirectives(), transformerVariantGroup()],
      shortcuts: {
        'flex-row-nowrap': 'flex flex-row flex-nowrap',
        'flex-col-nowrap': 'flex flex-col flex-nowrap',
        'flex-row-wrap': 'flex flex-row flex-wrap',
        'flex-col-wrap': 'flex flex-col flex-wrap',
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls'],
      }
    },
  },
})
