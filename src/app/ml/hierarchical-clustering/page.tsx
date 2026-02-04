import type { Metadata } from 'next'
import { HierarchicalClusteringPlayground } from '@/modules/ml/playground/HierarchicalClusteringPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { FAQSchema } from '@/components/FAQSchema'

export const metadata: Metadata = {
  title: 'Hierarchical Clustering | Interactive ML Algorithm Visualization',
  description:
    'Learn hierarchical clustering with step-by-step visualization. Explore agglomerative clustering with single, complete, and average linkage methods.',
  keywords: [
    'hierarchical clustering',
    'agglomerative clustering',
    'divisive clustering',
    'dendrogram',
    'linkage methods',
    'single linkage',
    'complete linkage',
    'average linkage',
    'unsupervised learning',
    'clustering algorithm',
    'machine learning',
    'data science',
    'cluster analysis',
    'visualization',
    'interactive tutorial',
  ],
  openGraph: {
    title: 'Hierarchical Clustering Visualization | Learn ML Algorithms',
    description:
      'Interactive visualization of hierarchical clustering. See how agglomerative clustering builds a hierarchy of clusters step by step.',
    type: 'article',
    url: 'https://learn-algo.com/ml/hierarchical-clustering',
    images: [
      {
        url: 'https://learn-algo.com/og/ml-hierarchical-clustering.png',
        width: 1200,
        height: 630,
        alt: 'Hierarchical Clustering Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hierarchical Clustering Visualization',
    description:
      'Interactive visualization of hierarchical clustering with different linkage methods.',
    images: ['https://learn-algo.com/og/ml-hierarchical-clustering.png'],
  },
}

const faqItems = [
  {
    question: 'What is hierarchical clustering?',
    answer:
      'Hierarchical clustering is an unsupervised machine learning algorithm that builds a hierarchy of clusters. In agglomerative (bottom-up) clustering, each data point starts as a separate cluster, and pairs of clusters are progressively merged until reaching the desired number of clusters. In divisive (top-down) clustering, all data points start in one cluster and are progressively split.',
  },
  {
    question: 'What are the different linkage methods?',
    answer:
      'The main linkage methods are: Single Linkage (minimum distance between any two points in different clusters, tends to create elongated clusters), Complete Linkage (maximum distance between any two points, creates compact clusters), and Average Linkage (average distance between all pairs of points, balances between single and complete). Other methods include Ward\'s linkage and centroid linkage.',
  },
  {
    question: 'How is hierarchical clustering different from K-Means?',
    answer:
      'K-Means requires specifying the number of clusters beforehand and assigns points to the nearest centroid. Hierarchical clustering builds a dendrogram showing relationships at all levels, allowing you to choose the number of clusters after seeing the structure. K-Means is faster for large datasets, while hierarchical clustering provides more insight into data structure and relationships.',
  },
  {
    question: 'What is a dendrogram?',
    answer:
      'A dendrogram is a tree-like diagram that shows the hierarchical relationship between clusters. The height at which two clusters merge indicates their distance or dissimilarity. By cutting the dendrogram at different heights, you can obtain different numbers of clusters. Dendrograms help visualize the clustering structure and choose an appropriate number of clusters.',
  },
  {
    question: 'What are the advantages of hierarchical clustering?',
    answer:
      'Advantages include: no need to specify the number of clusters beforehand, produces a dendrogram showing relationships at all levels, works with any distance metric, can reveal hierarchical structure in data, and doesn\'t require initialization. However, it has O(n²log n) time complexity making it slower for large datasets, and merge decisions are permanent.',
  },
]

export default function HierarchicalClusteringPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="hierarchical-clustering" />

      <FAQSchema faqs={faqItems} pageUrl="/ml/hierarchical-clustering" />

      <HierarchicalClusteringPlayground />
    </>
  )
}
