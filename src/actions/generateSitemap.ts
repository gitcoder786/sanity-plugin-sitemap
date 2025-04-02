import type { SanityClient } from '@sanity/client'
import { normalizeConfig } from '../config'
import type { SitemapPluginConfig } from '../types'
import { generateSplitSitemaps } from './generateSplitSitemaps'

/**
 * Generates a sitemap (or sitemap index if `splitByType` is enabled).
 * It fetches content from Sanity, transforms it into XML, and applies any config-based rules/hooks.
 */
export async function generateSitemap(
  client: SanityClient,
  config: SitemapPluginConfig & { splitByType?: boolean }
): Promise<string> {
  const normalized = normalizeConfig(config)

  // ✅ If splitByType is true, generate an index referencing multiple type-specific sitemaps
  if (config.splitByType) {
    const { indexXml } = await generateSplitSitemaps(client, config)
    return indexXml
  }

  // GROQ query to fetch slug + date fields for configured types
  const query = `*[_type in $types && !(_id in path("drafts.**"))]{
    _type,
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }`

  // Fetch documents of allowed types
  const documentsRaw = await client.fetch(query, {
    types: normalized.includeTypes,
  })

  // Optional pre-processing via hook
  const documents = normalized.onBeforeRender(documentsRaw)

  // Generate <url> entries for each document
  const sitemapEntries = documents
    .filter((doc) => !normalized.excludeSlugs.includes(doc.slug)) // Remove excluded slugs
    .map((doc) => {
      const urlBuilder = normalized.urlBuilders[doc._type]
      const loc = urlBuilder ? urlBuilder(doc) : `${normalized.baseUrl}/${doc.slug}`

      const dateField = normalized.dateFieldPerType[doc._type] || '_updatedAt'
      const lastmod = doc[dateField] || new Date().toISOString()

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${normalized.changefreq}</changefreq>
    <priority>${normalized.priority}</priority>
  </url>`
    })

  // Add manual URLs configured by the user
  const manualUrls = normalized.manualUrls.map((entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified || new Date().toISOString()}</lastmod>
    <changefreq>${normalized.changefreq}</changefreq>
    <priority>${normalized.priority}</priority>
  </url>`)

  // Wrap all <url> entries in <urlset>
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...sitemapEntries, ...manualUrls].join('\n')}
</urlset>`

  // Allow optional post-processing of final XML
  return normalized.onAfterRender(xml)
}
