import type { SanityClient } from '@sanity/client'
import { normalizeConfig } from '../config'
import type { SitemapPluginConfig } from '../types'

/**
 * Generates multiple sitemap XML files split by document type,
 * plus a sitemap index file referencing each generated sitemap.
 */
export async function generateSplitSitemaps(
  client: SanityClient,
  config: SitemapPluginConfig
): Promise<{
  indexXml: string
  sitemaps: Record<string, string>
}> {
  const normalized = normalizeConfig(config)

  // GROQ query to fetch all necessary fields from included types
  const query = `*[_type in $types && !(_id in path("drafts.**"))]{
    _type,
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }`

  // Fetch content based on types specified
  const rawDocs = await client.fetch(query, {
    types: normalized.includeTypes,
  })

  // Apply custom filtering or transformation hook
  const filteredDocs = normalized.onBeforeRender(rawDocs)

  // Group filtered documents by their _type (e.g., page, post, product)
  const grouped: Record<string, any[]> = {}
  for (const doc of filteredDocs) {
    if (!grouped[doc._type]) grouped[doc._type] = []
    if (!normalized.excludeSlugs.includes(doc.slug)) {
      grouped[doc._type].push(doc)
    }
  }

  const sitemaps: Record<string, string> = {}

  // Generate sitemap XML for each _type group
  for (const type in grouped) {
    const docs = grouped[type]

    const xmlItems = docs.map((doc) => {
      const loc = normalized.urlBuilders?.[type]
        ? normalized.urlBuilders[type](doc)
        : `${normalized.baseUrl}/${doc.slug}`

      const dateField = normalized.dateFieldPerType[type] || '_updatedAt'
      const lastmod = doc[dateField] || new Date().toISOString()

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${normalized.changefreq}</changefreq>
    <priority>${normalized.priority}</priority>
  </url>`
    })

    const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems.join('\n')}
</urlset>`

    sitemaps[`sitemap-${type}.xml`] = fullXml
  }

  // Optional: generate a separate sitemap for manually added URLs
  if (normalized.manualUrls.length) {
    const manualXml = normalized.manualUrls.map((entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified || new Date().toISOString()}</lastmod>
    <changefreq>${normalized.changefreq}</changefreq>
    <priority>${normalized.priority}</priority>
  </url>`).join('\n')

    sitemaps[`sitemap-manual.xml`] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${manualXml}
</urlset>`
  }

  // Generate sitemap index XML that links to all generated sitemap files
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(sitemaps).map(file => `
  <sitemap>
    <loc>${normalized.baseUrl}/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return {
    indexXml: normalized.onAfterRender(indexXml),
    sitemaps
  }
}
