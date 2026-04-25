import { defineConfig } from 'vite'
import type { ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import path from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getLocalePath, SUPPORTED_LOCALES } from './src/i18n/routing'
import { localizeHtmlDocument, SITE_URL } from './src/i18n/seo'
import { generateSitemapXml } from './src/i18n/sitemap'
import { APP_STATIC_ROUTES } from './src/routing/routes'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }
const sitemapRoutes = APP_STATIC_ROUTES.flatMap((route) =>
  SUPPORTED_LOCALES.map((locale) => getLocalePath(locale, route)),
)

function localizedHtmlPlugin() {
  return {
    name: 'localized-html-plugin',
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir ?? 'dist'
      const indexPath = join(outDir, 'index.html')
      const rootHtml = readFileSync(indexPath, 'utf-8')

      for (const route of APP_STATIC_ROUTES) {
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

function routeManifestSitemapPlugin() {
  let outDir = 'dist'

  return {
    name: 'route-manifest-sitemap-plugin',
    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir
    },
    async closeBundle() {
      await new Promise((resolve) => setImmediate(resolve))
      writeFileSync(join(outDir, 'sitemap.xml'), generateSitemapXml())
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
    Sitemap({
      hostname: SITE_URL,
      dynamicRoutes: sitemapRoutes,
      extensions: [],
      generateRobotsTxt: true,
      robots: [{ userAgent: '*', allow: '/' }],
    }),
    routeManifestSitemapPlugin(),
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
