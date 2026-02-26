import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'
import { copyFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Plugin to copy index.html to 404.html for GitHub Pages SPA routing
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const indexPath = path.resolve(__dirname, 'dist/index.html')
      const notFoundPath = path.resolve(__dirname, 'dist/404.html')
      copyFileSync(indexPath, notFoundPath)
      console.log('Copied index.html to 404.html for GitHub Pages SPA routing')
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyIndexTo404()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
