# 🗺️ sanity-plugin-sitemap

A fully customizable plugin to generate SEO-friendly **XML sitemaps** for Sanity Studio v3.

---
## ✨ Features

- Generate a **single sitemap** or **split by document type**
- Supports `baseUrl`, `excludeSlugs`, and manual URLs
- Define **custom URL builders** per type
- Hook support: `onBeforeRender`, `onAfterRender`
- Easy integration into frontend frameworks (Next.js, Express, Node, etc.)

---

## 🚀 Installation

```bash
npm install sanity-plugin-sitemap-pro

```

## 🔧 Usage in sanity.config.ts

```bash
import { sitemapPlugin } from 'sanity-plugin-sitemap-pro'

export default defineConfig({
  // ...
  plugins: [
    sitemapPlugin({
      baseUrl: 'https://example.com',
      includeTypes: ['page', 'post'],
      excludeSlugs: ['terms', 'privacy'],
      manualUrls: [
        { url: 'https://example.com/custom', lastModified: '2025-01-01' }
      ],
      urlBuilders: {
        post: (doc) => `/blog/${doc.slug}`
      },
      onBeforeRender: (docs) => docs.filter(doc => doc.slug !== 'exclude-this'),
      onAfterRender: (xml) => xml.replace(/example/g, 'real-site'),
      splitByType: true
    })
  ]
})

```

---

## 🧪 Programmatic Usage (Node, Next.js, etc.)
```bash
import { generateSitemap, generateSplitSitemaps } from 'sanity-plugin-sitemap-pro'

const xml = await generateSitemap(client, config) // single or index

const { indexXml, sitemaps } = await generateSplitSitemaps(client, config) // advanced

```