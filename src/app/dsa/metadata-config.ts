export const dsaMetadata = {
  strings: {
    title: 'String Operations',
    description:
      'Master string manipulation with reverse, palindrome, anagram, and substring search algorithms. Interactive visualizations with step-by-step explanations and O(n) complexity analysis.',
    keywords: [
      'string algorithms',
      'string operations',
      'reverse string',
      'palindrome check',
      'anagram detection',
      'substring search',
      'string manipulation',
      'data structures and algorithms',
    ],
    ogImage: '/og/og-dsa-strings.png',
  },
  'array-operations': {
    title: 'Array Operations',
    description:
      'Learn array manipulation techniques including append, insert, delete, search, and update operations. Visual demonstrations with O(1) to O(n) complexity analysis.',
    keywords: [
      'array operations',
      'array manipulation',
      'array insert',
      'array delete',
      'array search',
      'data structures',
      'DSA',
    ],
    ogImage: '/og/og-dsa-array-operations.png',
  },
  'binary-search': {
    title: 'Binary Search Algorithm',
    description:
      'Master binary search with divide and conquer strategy on sorted arrays. Interactive visualization showing O(log n) efficiency and step-by-step execution.',
    keywords: [
      'binary search',
      'binary search algorithm',
      'divide and conquer',
      'search algorithm',
      'sorted array search',
      'logarithmic search',
      'DSA',
    ],
    ogImage: '/og/og-dsa-binary-search.png',
  },
  'bit-manipulation': {
    title: 'Bit Manipulation',
    description:
      'Explore bitwise operations including AND, OR, XOR, and bit shifts. Learn bit tricks and patterns with O(1) constant time complexity.',
    keywords: [
      'bit manipulation',
      'bitwise operations',
      'bitwise AND',
      'bitwise OR',
      'bitwise XOR',
      'bit shifts',
      'bit tricks',
      'DSA',
    ],
    ogImage: '/og/og-dsa-bit-manipulation.png',
  },
  recursion: {
    title: 'Recursion Visualized',
    description:
      'Understand recursion through factorial, Fibonacci, and Tower of Hanoi visualizations. See call stacks and O(2^n) exponential complexity in action.',
    keywords: [
      'recursion',
      'recursive algorithms',
      'factorial',
      'fibonacci sequence',
      'tower of hanoi',
      'call stack',
      'recursion visualization',
      'DSA',
    ],
    ogImage: '/og/og-dsa-recursion.png',
  },
  stack: {
    title: 'Stack (LIFO) Data Structure',
    description:
      'Master stack operations with Last In First Out (LIFO) principle. Interactive push, pop, and peek operations with O(1) time complexity.',
    keywords: [
      'stack data structure',
      'LIFO',
      'stack operations',
      'push operation',
      'pop operation',
      'peek operation',
      'data structures',
      'DSA',
    ],
    ogImage: '/og/og-dsa-stack.png',
  },
  queue: {
    title: 'Queue (FIFO) Data Structure',
    description:
      'Learn queue operations with First In First Out (FIFO) principle. Visualize enqueue, dequeue, and peek operations with O(1) efficiency.',
    keywords: [
      'queue data structure',
      'FIFO',
      'queue operations',
      'enqueue operation',
      'dequeue operation',
      'queue visualization',
      'data structures',
      'DSA',
    ],
    ogImage: '/og/og-dsa-queue.png',
  },
  'bubble-sort': {
    title: 'Bubble Sort Algorithm',
    description:
      'Watch elements bubble to their correct positions in this classic sorting algorithm. Step-by-step visualization with O(n²) complexity analysis.',
    keywords: [
      'bubble sort',
      'bubble sort algorithm',
      'sorting algorithm',
      'comparison sort',
      'bubble sort visualization',
      'sorting visualization',
      'DSA',
    ],
    ogImage: '/og/og-dsa-bubble-sort.png',
  },
  'insertion-sort': {
    title: 'Insertion Sort Algorithm',
    description:
      'Build a sorted array by inserting elements one by one. Interactive visualization showing how insertion sort works with O(n²) complexity.',
    keywords: [
      'insertion sort',
      'insertion sort algorithm',
      'sorting algorithm',
      'incremental sort',
      'insertion sort visualization',
      'adaptive sorting',
      'DSA',
    ],
    ogImage: '/og/og-dsa-insertion-sort.png',
  },
  'selection-sort': {
    title: 'Selection Sort Algorithm',
    description:
      'Repeatedly select the minimum element and place it at the beginning. Visual demonstration of selection sort with O(n²) time complexity.',
    keywords: [
      'selection sort',
      'selection sort algorithm',
      'sorting algorithm',
      'minimum selection',
      'selection sort visualization',
      'comparison sort',
      'DSA',
    ],
    ogImage: '/og/og-dsa-selection-sort.png',
  },
  'merge-sort': {
    title: 'Merge Sort Algorithm',
    description:
      'Master divide and conquer sorting with guaranteed O(n log n) performance. Watch how merge sort splits and merges arrays efficiently.',
    keywords: [
      'merge sort',
      'merge sort algorithm',
      'divide and conquer',
      'efficient sorting',
      'merge sort visualization',
      'stable sort',
      'DSA',
    ],
    ogImage: '/og/og-dsa-merge-sort.png',
  },
  'quick-sort': {
    title: 'Quick Sort Algorithm',
    description:
      'Visualize partitioning and recursion in this efficient sorting algorithm. Step-by-step quick sort demonstration with O(n log n) average complexity.',
    keywords: [
      'quick sort',
      'quick sort algorithm',
      'partitioning',
      'pivot selection',
      'quick sort visualization',
      'efficient sorting',
      'DSA',
    ],
    ogImage: '/og/og-dsa-quick-sort.png',
  },
  'heap-sort': {
    title: 'Heap Sort Algorithm',
    description:
      'Sort using binary heap data structure with guaranteed O(n log n) performance. Interactive visualization of heap construction and sorting.',
    keywords: [
      'heap sort',
      'heap sort algorithm',
      'binary heap',
      'heap data structure',
      'heap sort visualization',
      'efficient sorting',
      'DSA',
    ],
    ogImage: '/og/og-dsa-heap-sort.png',
  },
  'binary-search-tree': {
    title: 'Binary Search Tree (BST)',
    description:
      'Master binary search tree operations including insert, delete, and traversals. Interactive tree visualization with O(log n) average complexity.',
    keywords: [
      'binary search tree',
      'BST',
      'tree data structure',
      'tree traversal',
      'inorder traversal',
      'preorder traversal',
      'postorder traversal',
      'binary tree operations',
      'DSA',
    ],
    ogImage: '/og/og-dsa-binary-search-tree.png',
  },
}

export type DSARoute = keyof typeof dsaMetadata

// Helper function to generate metadata for DSA pages
export function generateDSAMetadata(route: DSARoute, customAlt?: string) {
  const meta = dsaMetadata[route]
  const baseUrl = 'https://www.learn-algo.com'
  const canonicalUrl = `${baseUrl}/dsa/${route}`

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'LEARN ALGO' }],
    creator: 'LEARN ALGO',
    publisher: 'LEARN ALGO',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${meta.title} | Learn Algo`,
      description: meta.description,
      type: 'article' as const,
      url: canonicalUrl,
      siteName: 'LEARN ALGO',
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}${meta.ogImage}`,
          width: 1200,
          height: 630,
          alt: customAlt || `${meta.title} Visualization`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${meta.title} | Learn Algo`,
      description: meta.description,
      site: '@LearnAlgo',
      creator: '@LearnAlgo',
      images: [`${baseUrl}${meta.ogImage}`],
    },
  }
}

// Helper function to generate structured data (JSON-LD) for DSA algorithm pages
export function generateDSAStructuredData(route: DSARoute) {
  const meta = dsaMetadata[route]
  const baseUrl = 'https://www.learn-algo.com'
  const canonicalUrl = `${baseUrl}/dsa/${route}`

  // Get complexity category
  const getComplexityCategory = (keywords: string[]) => {
    if (keywords.includes('sorting algorithm')) return 'Sorting Algorithm'
    if (keywords.includes('search algorithm')) return 'Search Algorithm'
    if (keywords.includes('data structure')) return 'Data Structure'
    return 'Algorithm'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description: meta.description,
    url: canonicalUrl,
    image: `${baseUrl}${meta.ogImage}`,
    author: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo/logo.png`,
      },
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: getComplexityCategory(meta.keywords),
    keywords: meta.keywords.join(', '),
    educationalLevel: 'Beginner to Advanced',
    learningResourceType: 'Interactive Visualization',
    interactivityType: 'active',
    about: {
      '@type': 'Thing',
      name: meta.title,
      description: meta.description,
    },
    teaches: meta.title,
  }
}
