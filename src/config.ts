import type { SitemapPluginConfig } from './types'

/**
 * Ensures that all optional sitemap config properties have default values.
 * This allows other parts of the plugin to work with a fully-populated config object.
 */
export function normalizeConfig(config: SitemapPluginConfig): Required<SitemapPluginConfig> {
  return {
    baseUrl: config.baseUrl, // Must be provided by the user

    // Use provided types or fallback to common defaults
    includeTypes: config.includeTypes || ['page', 'post'],

    // Slugs to exclude from the sitemap
    excludeSlugs: config.excludeSlugs || [],

    // Optional manually included URLs
    manualUrls: config.manualUrls || [],

    // Optional custom URL builders per _type
    urlBuilders: config.urlBuilders || {},

    // Optional custom field to use for <lastmod> per type
    dateFieldPerType: config.dateFieldPerType || {},

    // Sitemap <changefreq> value (default: 'monthly')
    changefreq: config.changefreq || 'monthly',

    // Sitemap <priority> value (default: 0.5)
    priority: config.priority || 0.5,

    // Hook to transform/filter documents before rendering
    onBeforeRender: config.onBeforeRender || ((docs) => docs),

    // Hook to modify the final XML output
    onAfterRender: config.onAfterRender || ((xml) => xml),
  }
}
