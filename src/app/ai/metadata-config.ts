export interface AIMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage: string
}

export const aiMetadata: Record<string, AIMetadata> = {
  minimax: {
    title: 'Minimax Algorithm - AI Decision Making',
    description:
      'Master the Minimax algorithm with Alpha-Beta pruning through interactive Tic-Tac-Toe gameplay. Visualize AI decision trees, explore optimal strategies, and understand adversarial search algorithms.',
    keywords: [
      'minimax algorithm',
      'alpha beta pruning',
      'adversarial search',
      'game theory',
      'artificial intelligence',
      'AI algorithms',
      'decision trees',
      'optimal strategy',
      'tic tac toe AI',
      'game AI',
      'minimax tree',
      'alpha-beta optimization',
      'adversarial games',
      'AI decision making',
      'machine learning algorithms',
    ],
    ogImage: '/og/og-ai-minimax.png',
  },
}

export type AIRoute = keyof typeof aiMetadata

export function generateAIMetadata(route: AIRoute, defaultTitle?: string): import('next').Metadata {
  const meta = aiMetadata[route]
  if (!meta) {
    throw new Error(`No metadata found for AI route: ${route}`)
  }

  const title = defaultTitle || meta.title
  const description = meta.description
  const keywords = meta.keywords.join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Learn Algorithms' }],
    creator: 'Learn Algorithms',
    publisher: 'Learn Algorithms',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://learnalgo.com'),
    alternates: {
      canonical: `/ai/${route}`,
    },
    openGraph: {
      title,
      description,
      url: `https://learnalgo.com/ai/${route}`,
      siteName: 'Learn Algorithms',
      images: [
        {
          url: meta.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [meta.ogImage],
      creator: '@learnalgo',
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  }
}

export function generateAIStructuredData(route: AIRoute) {
  const meta = aiMetadata[route]
  if (!meta) {
    throw new Error(`No metadata found for AI route: ${route}`)
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title,
    description: meta.description,
    url: `https://learnalgo.com/ai/${route}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Learn Algorithms',
      url: 'https://learnalgo.com',
    },
    educationalUse: 'Interactive Learning',
    teaches: meta.keywords,
    learningResourceType: 'Interactive Simulation',
    about: [
      {
        '@type': 'DefinedTerm',
        name: 'Minimax Algorithm',
        description: 'A decision-making algorithm for adversarial games that explores all possible moves to find optimal strategy.',
      },
      {
        '@type': 'DefinedTerm',
        name: 'Alpha-Beta Pruning',
        description: 'An optimization technique that eliminates branches in the minimax tree that won\'t affect the final decision.',
      },
      {
        '@type': 'DefinedTerm',
        name: 'Adversarial Search',
        description: 'Search algorithms designed for competitive environments where players have opposing goals.',
      },
    ],
  }
}