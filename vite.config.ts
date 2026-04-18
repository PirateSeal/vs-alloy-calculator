import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { SUPPORTED_LOCALES } from './src/i18n/routing'
import { localizeHtmlDocument } from './src/i18n/seo'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }
const SITE_URL = 'https://vs-calculator.tcousin.com'
const APP_ROUTES = ['/', '/planner/', '/reference/', '/about/'] as const

function getLocalizedRoutePath(locale: string, route: (typeof APP_ROUTES)[number]) {
  if (locale === 'en') {
    return route
  }

  return route === '/' ? `/${locale}/` : `/${locale}${route}`
}

function getRoutePriority(route: (typeof APP_ROUTES)[number], locale: string) {
  if (route === '/') {
    return locale === 'en' ? '1.0' : '0.9'
  }

  return '0.8'
}

function generateSitemapXml() {
  const now = new Date()
  const lastmod = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const urls = APP_ROUTES.flatMap((route) =>
    SUPPORTED_LOCALES.map((locale) => {
      const loc = new URL(getLocalizedRoutePath(locale, route), `${SITE_URL}/`).toString()
      const alternates = [
        ...SUPPORTED_LOCALES.map((alternateLocale) => ({
          hrefLang: alternateLocale,
          href: new URL(getLocalizedRoutePath(alternateLocale, route), `${SITE_URL}/`).toString(),
        })),
        {
          hrefLang: 'x-default',
          href: new URL(route, `${SITE_URL}/`).toString(),
        },
      ]

      const alternateMarkup = alternates
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hrefLang}" href="${alternate.href}" />`,
        )
        .join('\n')

      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${getRoutePriority(route, locale)}</priority>`,
        alternateMarkup,
        '  </url>',
      ].join('\n')
    }),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

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
