import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://incharacter.cloud',         lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: 'https://incharacter.cloud/about',   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://incharacter.cloud/faq',     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://incharacter.cloud/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://incharacter.cloud/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
