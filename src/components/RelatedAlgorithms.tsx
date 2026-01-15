'use client'

import Link from 'next/link'
import { DSARoute } from '@/app/dsa/metadata-config'
import { MLRoute, mlAlgorithmRelations } from '@/modules/ml/config/algorithmRelations'

interface RelatedAlgorithm {
  route: DSARoute | MLRoute
  title: string
  description: string
  category: string
}

type AlgorithmType = 'dsa' | 'ml'

interface RelatedAlgorithmsProps {
  route: DSARoute | MLRoute
  type: AlgorithmType
  compact?: boolean
}

const algorithmRelations: Record<DSARoute, DSARoute[]> = {
  'binary-search': ['array-operations', 'merge-sort', 'quick-sort'],
  'bubble-sort': ['insertion-sort', 'selection-sort', 'merge-sort'],
  'insertion-sort': ['bubble-sort', 'selection-sort', 'quick-sort'],
  'selection-sort': ['bubble-sort', 'insertion-sort', 'heap-sort'],
  'merge-sort': ['quick-sort', 'heap-sort', 'binary-search'],
  'quick-sort': ['merge-sort', 'heap-sort', 'recursion'],
  'heap-sort': ['merge-sort', 'quick-sort', 'binary-search-tree'],
  'binary-search-tree': ['heap-sort', 'recursion', 'binary-search'],
  stack: ['queue', 'recursion', 'array-operations'],
  queue: ['stack', 'array-operations', 'binary-search-tree'],
  recursion: ['binary-search-tree', 'quick-sort', 'merge-sort'],
  'array-operations': ['binary-search', 'strings', 'stack'],
  strings: ['array-operations', 'recursion', 'bit-manipulation'],
  'bit-manipulation': ['recursion', 'strings', 'array-operations'],
}

const algorithmInfo: Record<DSARoute, { title: string; description: string; category: string }> = {
  'binary-search': {
    title: 'Binary Search',
    description: 'Efficient search in sorted arrays',
    category: 'Searching',
  },
  'bubble-sort': {
    title: 'Bubble Sort',
    description: 'Simple comparison sort',
    category: 'Sorting',
  },
  'insertion-sort': {
    title: 'Insertion Sort',
    description: 'Build sorted array incrementally',
    category: 'Sorting',
  },
  'selection-sort': {
    title: 'Selection Sort',
    description: 'Select minimum and swap',
    category: 'Sorting',
  },
  'merge-sort': {
    title: 'Merge Sort',
    description: 'Divide and conquer sorting',
    category: 'Sorting',
  },
  'quick-sort': {
    title: 'Quick Sort',
    description: 'Partition-based sorting',
    category: 'Sorting',
  },
  'heap-sort': { title: 'Heap Sort', description: 'Heap-based sorting', category: 'Sorting' },
  'binary-search-tree': {
    title: 'Binary Search Tree',
    description: 'Hierarchical data structure',
    category: 'Trees',
  },
  stack: { title: 'Stack', description: 'LIFO data structure', category: 'Data Structures' },
  queue: { title: 'Queue', description: 'FIFO data structure', category: 'Data Structures' },
  recursion: {
    title: 'Recursion',
    description: 'Function calling itself',
    category: 'Techniques',
  },
  'array-operations': {
    title: 'Array Operations',
    description: 'Array manipulation techniques',
    category: 'Arrays',
  },
  strings: {
    title: 'String Operations',
    description: 'Text processing algorithms',
    category: 'Strings',
  },
  'bit-manipulation': {
    title: 'Bit Manipulation',
    description: 'Bitwise operations',
    category: 'Bitwise',
  },
}

const mlAlgorithmInfo: Record<MLRoute, { title: string; description: string; category: string }> = {
  'chance-events': {
    title: 'Chance Events',
    description: 'Explore random events and probability',
    category: 'Basic Probability',
  },
  expectation: {
    title: 'Expectation',
    description: 'Expected value and probability-weighted outcomes',
    category: 'Basic Probability',
  },
  'linear-regression': {
    title: 'Linear Regression',
    description: 'Fit a line to predict values',
    category: 'Regression',
  },
  'polynomial-regression': {
    title: 'Polynomial Regression',
    description: 'Non-linear curve fitting',
    category: 'Regression',
  },
  'logistic-regression': {
    title: 'Logistic Regression',
    description: 'Binary classification with sigmoid',
    category: 'Classification',
  },
  'decision-tree': {
    title: 'Decision Tree',
    description: 'Tree-based classification',
    category: 'Classification',
  },
  'ensemble-models': {
    title: 'Random Forest',
    description: 'Ensemble of decision trees',
    category: 'Ensemble',
  },
  knn: {
    title: 'K-Nearest Neighbors',
    description: 'Instance-based classification',
    category: 'Classification',
  },
  'k-means': {
    title: 'K-Means Clustering',
    description: 'Unsupervised clustering',
    category: 'Clustering',
  },
  'gradient-descent': {
    title: 'Gradient Descent',
    description: 'Optimization algorithm',
    category: 'Optimization',
  },
  'minmax-scaler': {
    title: 'MinMax Scaler',
    description: 'Feature normalization [0,1]',
    category: 'Preprocessing',
  },
  'standard-scaler': {
    title: 'Standard Scaler',
    description: 'Feature standardization (z-score)',
    category: 'Preprocessing',
  },
  'regularization': {
    title: 'Regularization',
    description: 'Prevent overfitting with L1/L2',
    category: 'Optimization',
  },
}

export function RelatedAlgorithms({ route, type, compact = false }: RelatedAlgorithmsProps) {
  let relatedAlgorithms: RelatedAlgorithm[]

  if (type === 'ml') {
    const mlRoute = route as MLRoute
    const relations = mlAlgorithmRelations[mlRoute]
    if (!relations) return null

    relatedAlgorithms = relations.map((algo) => ({
      route: algo.route,
      title: algo.name,
      description: mlAlgorithmInfo[algo.route]?.description || '',
      category: algo.category,
    }))
  } else {
    // DSA type
    const dsaRoute = route as DSARoute
    const related = algorithmRelations[dsaRoute] || []
    relatedAlgorithms = related.map((r) => ({
      route: r,
      ...algorithmInfo[r],
    }))
  }

  if (relatedAlgorithms.length === 0) return null

  const baseUrl = type === 'ml' ? '/ml' : '/dsa'

  if (compact) {
    return (
      <div className="mt-2">
        <div className="flex flex-col gap-3">
          {relatedAlgorithms.map((algo) => (
            <Link
              key={algo.route}
              href={`${baseUrl}/${algo.route}`}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {algo.title}
                </h3>
                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                  {algo.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{algo.description}</p>
              <span className="inline-block mt-1 text-xs text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Related Algorithms</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {relatedAlgorithms.map((algo) => (
          <Link
            key={algo.route}
            href={`${baseUrl}/${algo.route}`}
            className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {algo.title}
              </h3>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                {algo.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{algo.description}</p>
            <span className="inline-block mt-2 text-sm text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
