/**
 * Manually added URLs that should be included in the sitemap.
 */
export interface ManualUrl {
  url: string                     // The full URL (e.g., https://example.com/manual-page)
  lastModified?: string          // Optional last modified ISO date
}

/**
 * Function to generate a custom URL for a given document.
 */
export type UrlBuilder = (doc: any) => string

/**
 * Configuration options for the sitemap plugin.
 */
export interface SitemapPluginConfig {
  baseUrl: string                 // The base domain URL (e.g., https://example.com)

  includeTypes?: string[]        // Array of document _types to include (e.g., ['page', 'post'])

  excludeSlugs?: string[]        // Array of slugs to exclude (e.g., ['privacy', 'terms'])

  manualUrls?: ManualUrl[]       // List of manually added URLs to include in the sitemap

  urlBuilders?: Record<string, UrlBuilder> 
  // Custom URL generators per _type
  // e.g., { product: (doc) => `/products/${doc.slug}` }

  dateFieldPerType?: Record<string, string>
  // Use a specific date field per _type instead of _updatedAt
  // e.g., { post: 'publishedAt' }

  changefreq?: string            // Optional <changefreq> value for all URLs (e.g., 'monthly')

  priority?: number              // Optional <priority> value for all URLs (0.0 to 1.0)

  onBeforeRender?: (items: any[]) => any[]
  // Optional hook to filter/transform documents before building the sitemap

  onAfterRender?: (xml: string) => string
  // Optional hook to post-process final sitemap XML
}
