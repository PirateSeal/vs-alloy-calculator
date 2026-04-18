import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { SUPPORTED_LOCALES } from './src/i18n/routing'
import { localizeHtmlDocument } from './src/i18n/seo'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }
const APP_ROUTES = ['/', '/reference/', '/about/'] as const

function localizedHtmlPlugin() {
  return {
    name: 'localized-html-plugin',
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir ?? 'dist'
      const indexPath = join(outDir, 'index.html')
      const rootHtml = readFileSync(indexPath, 'utf-8')

      for (const route of APP_ROUTES) {
        for (const locale of SUPPORTED_LOCALES) {
          const localizedHtml = localizeHtmlDocument(rootHtml, locale, route)
          const targetPath =
            locale === 'en'
              ? route === '/'
                ? indexPath
                : join(outDir, route.slice(1), 'index.html')
              : route === '/'
                ? join(outDir, locale, 'index.html')
                : join(outDir, locale, route.slice(1), 'index.html')

          mkdirSync(path.dirname(targetPath), { recursive: true })
          writeFileSync(targetPath, localizedHtml)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    localizedHtmlPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-ui",
              test: /[\\/]node_modules[\\/](radix-ui|@radix-ui|framer-motion|lucide-react|clsx|tailwind-merge)[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})
