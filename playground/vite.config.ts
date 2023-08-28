import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
// import FilesLoader from 'vite-plugin-files-loader'
import FilesLoader from '../src/index'

console.log(resolve(fileURLToPath(import.meta.url), '../src'))
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(fileURLToPath(import.meta.url), '../src')}/`,
    },
  },
  plugins: [
    FilesLoader({
      paths: '../demo',
      resolveChildrenBase: 'src',
      enableResolveLongChildren: true,
    }),
  ],
  build: {
    target: 'esnext',
  },
  clearScreen: false,
  optimizeDeps: {
    entries: [],
  },
})
