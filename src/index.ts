// Import Sanity's plugin definition utility
import { definePlugin } from 'sanity'

// Import the config interface for strong typing
import type { SitemapPluginConfig } from './types'

/**
 * The main plugin definition for Sanity Studio.
 * This function registers the plugin with optional configuration.
 */
export const sitemapPlugin = definePlugin<SitemapPluginConfig>((config) => {
  // Validate required config input
  if (!config?.baseUrl) {
    throw new Error('sitemapPlugin: "baseUrl" is required in config.')
  }

  return {
    name: 'sanity-plugin-sitemap-pro', // Plugin identifier
  }
})

/**
 * Export sitemap generation utilities
 * 
 * `generateSitemap`: returns a single sitemap or a sitemap index (if `splitByType` is true)
 * `generateSplitSitemaps`: generates multiple sitemaps per type and a sitemap index
 */
export { generateSitemap } from './actions/generateSitemap'
export { generateSplitSitemaps } from './actions/generateSplitSitemaps'
