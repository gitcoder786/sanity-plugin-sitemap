import { createClient } from '@sanity/client'
import { generateSitemap, generateSplitSitemaps } from './dist/index.mjs' // Built ESM output

const client = createClient({
  projectId: 'xxxxxxxxx',        // ✅ Replace with your actual project ID
  dataset: 'xxxxxxxx',        // ✅ Replace with your dataset name
  useCdn: false,
  apiVersion: '2024-03-31',
})

// ✅ CONFIG: Shared for both examples
const config = {
  baseUrl: 'https://example.com',
  includeTypes: ['page', 'post', 'product'],
  excludeSlugs: ['private-page'],
  manualUrls: [
    { url: 'https://example.com/custom', lastModified: '2025-01-01' }
  ],
  urlBuilders: {
    product: (doc) => `https://example.com/products/${doc.slug}`
  },
  splitByType: false // Change to true if using generateSitemap with splitting
}

//
// ✅ Example 1: Single sitemap or sitemap index (if splitByType === true)
//
generateSitemap(client, config)
  .then(xml => {
    console.log('\n✅ Single Sitemap Output:')
    console.log(xml)
  })
  .catch(err => {
    console.error('❌ Error generating single sitemap:', err)
  })

//
// ✅ Example 2: Explicit split sitemaps per type
//
const runSplitSitemaps = async () => {
  try {
    const { indexXml, sitemaps } = await generateSplitSitemaps(client, config)

    console.log('\n✅ Sitemap Index XML:')
    console.log(indexXml)

    console.log('\n📦 Individual Sitemaps:')
    for (const [file, xml] of Object.entries(sitemaps)) {
      console.log(`\n🗂️ ${file}:\n${xml}`)
    }
  } catch (err) {
    console.error('❌ Error generating split sitemaps:', err)
  }
}

runSplitSitemaps()
