import path from 'path'
import { defineConfig } from "vite";
import vue from 'unplugin-vue/vite'
import tailwindcss from '@tailwindcss/vite'

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
    vue(),
    tailwindcss(),
  ],
})
