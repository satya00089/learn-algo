import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Data Structures & Algorithms',
    template: '%s | DSA | Learn Algo',
  },
  description:
    'Master data structures and algorithms through interactive visualizations with step-by-step explanations, theory modals, and multi-language code examples. Explore sorting algorithms (Quick Sort, Merge Sort, Heap Sort, Bubble Sort, Insertion Sort, Selection Sort), searching (Binary Search), tree data structures (Binary Search Tree), stacks, queues, recursion, bit manipulation, string operations, and array manipulations.',
  keywords: [
    'data structures',
    'algorithms',
    'DSA',
    'sorting algorithms',
    'quicksort',
    'merge sort',
    'heap sort',
    'bubble sort',
    'insertion sort',
    'selection sort',
    'binary search',
    'binary search tree',
    'BST operations',
    'tree traversal',
    'stack LIFO',
    'queue FIFO',
    'recursion visualization',
    'bit manipulation',
    'bitwise operations',
    'string algorithms',
    'array operations',
    'algorithm visualization',
    'interactive learning',
    'coding interview preparation',
    'FAANG interview prep',
    'technical interview practice',
    'step-by-step algorithm',
    'algorithm complexity',
    'Big O notation',
  ],
  authors: [{ name: 'LEARN ALGO' }],
  creator: 'LEARN ALGO',
  alternates: {
    canonical: 'https://www.learn-algo.com/dsa',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Data Structures & Algorithms - Interactive Visualizations | LEARN ALGO',
    description:
      'Master DSA through interactive visualizations. Sorting algorithms, binary trees, stacks, queues, recursion, bit manipulation & more with step-by-step theory explanations and code examples.',
    type: 'website',
    url: 'https://www.learn-algo.com/dsa',
    siteName: 'LEARN ALGO',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.learn-algo.com/og/og-dsa.png',
        width: 1200,
        height: 630,
        alt: 'Data Structures & Algorithms Visualizations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Structures & Algorithms | LEARN ALGO',
    description: 'Master DSA through practice with interactive visualizations',
    site: '@LearnAlgo',
    creator: '@LearnAlgo',
    images: ['https://www.learn-algo.com/og/og-dsa.png'],
  },
}

export default function DSALayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
