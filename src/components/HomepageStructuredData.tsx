import Script from 'next/script'

export function HomepageStructuredData() {
  // FAQ Schema for the FAQ section
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need programming experience to use LEARN ALGO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! LEARN ALGO is designed for all skill levels. While basic programming knowledge helps, our visualizations make algorithms intuitive even for beginners. Each algorithm includes explanations and you can learn by watching and experimenting.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are new algorithms added regularly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We\'re constantly expanding our library. Currently, we have 30+ algorithms across DSA and ML domains, with AI algorithms coming soon. We prioritize adding algorithms based on user requests and educational value.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to learn an algorithm?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most users gain a solid understanding of an algorithm in 15-30 minutes through our interactive visualizations. For deeper mastery, we recommend spending 1-2 hours experimenting with different parameters, datasets, and edge cases.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use this for interview preparation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! LEARN ALGO is perfect for technical interview prep. Our visualizations help you build the intuition needed to solve algorithm problems in interviews. Many users report improved performance on coding challenges after using our platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes LEARN ALGO different from other resources?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LEARN ALGO provides fully interactive, real-time visualizations with complete control. You can play, pause, step forward/backward, adjust animation speed, modify parameters like array size, and generate random data to explore different scenarios. Our focus is on helping you build intuition through visual understanding by seeing every step of the algorithm as it executes.',
        },
      },
    ],
  }

  // Software Application Schema for the homepage
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LEARN ALGO',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-01',
    },
    description: 'Interactive 3D algorithm visualization platform for learning 30+ Data Structures, Machine Learning, and AI algorithms through step-by-step animations and explanations. Includes sorting algorithms, binary trees, clustering (K-Means, DBSCAN), regression models, gradient descent, PCA, and game theory (Minimax).',
    featureList: [
      'Interactive 3D visualizations',
      '30+ algorithms across DSA, ML, and AI',
      'Step-by-step animations with full control',
      'Real-time parameter adjustment',
      'Multi-language code examples',
      'Free forever with no registration required',
    ],
    screenshot: 'https://www.learn-algo.com/og/og-image.png',
    author: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: 'https://www.learn-algo.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
  }

  // HowTo Schema for learning process
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Learn Algorithms with LEARN ALGO',
    description: 'Learn algorithms through interactive visualizations in three simple steps',
    totalTime: 'PT30M',
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Web Browser',
        description: 'Modern web browser with JavaScript enabled',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose Your Algorithm',
        text: 'Select from 30+ algorithms across Data Structures (Sorting, BST, Stack, Queue, Recursion), Machine Learning (PCA, K-Means, DBSCAN, Regression, Gradient Descent), and AI (Minimax, Game Theory). Generate random datasets, adjust parameters, and explore different scenarios interactively.',
        position: 1,
        image: 'https://www.learn-algo.com/og/og-image.png',
      },
      {
        '@type': 'HowToStep',
        name: 'Think Through Each Step',
        text: 'See every step animated in real-time. Pause, step through, adjust speed, and modify parameters on the fly to understand how algorithms work.',
        position: 2,
        image: 'https://www.learn-algo.com/og/og-image.png',
      },
      {
        '@type': 'HowToStep',
        name: 'Build Deep Understanding',
        text: 'Master algorithms through visualization. Understand time complexity, space trade-offs, and real-world applications with interactive controls.',
        position: 3,
        image: 'https://www.learn-algo.com/og/og-image.png',
      },
    ],
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.learn-algo.com',
      },
    ],
  }

  return (
    <>
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-software-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <Script
        id="schema-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}