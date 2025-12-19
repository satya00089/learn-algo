import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.learn-algo.com'

  // Define all your static routes
  const routes = [
    '',
    '/dsa',
    '/dsa/array-operations',
    '/dsa/binary-search-tree',
    '/dsa/bit-manipulation',
    '/dsa/bubble-sort',
    '/dsa/heap-sort',
    '/dsa/insertion-sort',
    '/dsa/merge-sort',
    '/dsa/queue',
    '/dsa/quick-sort',
    '/dsa/recursion',
    '/dsa/selection-sort',
    '/dsa/stack',
    '/dsa/strings',
    '/ml',
    '/ml/gradient-descent',
    '/ml/k-means',
    '/ml/knn',
    '/ml/linear-regression',
    '/ml/logistic-regression',
    '/ml/polynomial-regression',
    '/ai',
  ].map((route) => {
    let priority = 0.9
    if (route === '') {
      priority = 1
    } else if (route.includes('/dsa/') || route.includes('/ml/')) {
      priority = 0.8
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority,
    }
  })

  return routes
}
