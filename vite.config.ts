import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // База для GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/b-employee-statistics/' : '/',
  // Настройки сборки
  build: {
    // Выходная директория для GitHub Pages
    outDir: 'docs',
    // Очистка выходной директории перед сборкой
    emptyOutDir: true,
    // Настройки минификации
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
