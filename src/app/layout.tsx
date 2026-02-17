import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import { PWARegister } from '@/components/PWARegister'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { StructuredData } from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.learn-algo.com'),
  title: {
    default: 'LEARN ALGO - Interactive Algorithm Visualizations | Master DSA, ML & AI',
    template: '%s | LEARN ALGO',
  },
  description:
    'Master algorithms through interactive 3D visualizations. Explore 30+ algorithms including sorting (QuickSort, MergeSort), data structures (BST, Stack, Queue), ML (PCA, K-Means, Regression, Gradient Descent), and AI (Minimax). Step-by-step animations with full control - play, pause, adjust speed. Perfect for CS students, developers, and technical interview prep. 100% free forever.',
  keywords: [
    // Core Platform Keywords
    'algorithm visualization',
    'interactive algorithms',
    '3D algorithm animations',
    'algorithm visualizer',
    'interactive learning',
    'visual learning',
    'step-by-step algorithms',
    'algorithm animations',
    'learn algorithms online',
    'free algorithm visualizer',
    
    // Data Structures & Algorithms
    'data structures tutorial',
    'DSA learning',
    'DSA visualization',
    'sorting algorithms interactive',
    'sorting algorithms visualization',
    'binary search tree visualization',
    'binary search algorithm',
    'graph algorithms',
    'dynamic programming',
    'recursion visualization',
    'bit manipulation',
    'string algorithms',
    'array operations',
    'stack and queue',
    'linked list visualization',
    'tree traversal',
    'quicksort visualization',
    'merge sort animation',
    'heap sort',
    'insertion sort',
    'selection sort',
    'bubble sort',
    
    // Machine Learning
    'machine learning visualization',
    'ML algorithms',
    'ML algorithms interactive',
    'PCA visualization',
    'principal component analysis',
    '3D PCA',
    'PCA 3D visualization',
    'dimensionality reduction',
    'linear regression',
    'polynomial regression',
    'logistic regression',
    'regression models',
    'k-means clustering',
    'K-means visualization',
    'DBSCAN clustering',
    'GMM clustering',
    'hierarchical clustering',
    'clustering algorithms',
    'anomaly detection',
    'ensemble models',
    'gradient descent',
    'gradient descent animation',
    'feature scaling',
    'standard scaler',
    'minmax scaler',
    'regularization',
    'probability theory',
    'expected value',
    'variance',
    'KNN algorithm',
    'decision tree',
    'decision trees',
    't-SNE visualization',
    
    // Artificial Intelligence
    'AI algorithms',
    'neural networks',
    'minimax algorithm',
    'game theory',
    'search algorithms',
    
    // Education & Learning
    'algorithm education',
    'programming education',
    'computer science learning',
    'computer science education',
    'programming tutorials',
    'algorithm tutorial',
    'educational technology',
    'STEM education',
    'learn coding',
    'visual programming',
    
    // Interview Preparation
    'coding interview prep',
    'technical interview practice',
    'FAANG interview prep',
    'software engineering interview',
    'algorithm interview questions',
    'data structures interview',
    'competitive programming',
    'leetcode preparation',
    'hackerrank practice',
    'coding challenges',
    'algorithm problems',
    
    // Technical Concepts
    'algorithm complexity',
    'time complexity visualization',
    'space complexity',
    'algorithm analysis',
    'big O notation',
    'algorithm optimization',
    'data structure visualization',
    
    // Professional Development
    'software engineering',
    'software development',
    'computer science fundamentals',
    'algorithmic thinking',
    'problem solving',
  ],
  authors: [{ name: 'LEARN ALGO Team' }],
  creator: 'LEARN ALGO',
  publisher: 'LEARN ALGO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Education',
  classification: 'Educational Software',
  icons: {
    icon: [
      { url: '/logo/logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo/logo.png',
    apple: [
      { url: '/logo/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.learn-algo.com',
    title: 'LEARN ALGO - Interactive Algorithm Visualizations | Master DSA, ML & AI',
    description:
      'Master 30+ algorithms through interactive 3D visualizations: Sorting (QuickSort, MergeSort, HeapSort), Data Structures (BST, Arrays, Recursion), Machine Learning (PCA, K-Means, DBSCAN, Regression, Gradient Descent), and AI (Minimax, Game Theory). Step-by-step animations with full control. Perfect for CS students, developers, and FAANG interview prep. 100% free forever.',
    siteName: 'LEARN ALGO',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LEARN ALGO - Interactive Algorithm Visualizations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEARN ALGO - Interactive Algorithm Visualizations',
    description:
      'Master 30+ algorithms through interactive 3D visualizations: Sorting, BST, ML (PCA, K-Means, Regression), AI (Minimax). Step-by-step animations. Perfect for interview prep. Free forever.',
    images: ['/og/og-image.png'],
    creator: '@learn_algo',
    site: '@learn_algo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'kts0xKWk4QTecBByCGmjUErPafS7Evt4hvwNWLGggKI',
  },
  alternates: {
    canonical: 'https://www.learn-algo.com',
  },
  other: {
    'theme-color': '#ffffff',
    'color-scheme': 'light dark',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'LEARN ALGO',
    'application-name': 'LEARN ALGO',
    'msapplication-TileColor': '#ffffff',
    'msapplication-config': '/browserconfig.xml',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        {/* Google tag (gtag.js) - loads after the page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K9C8S5RSSR"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-K9C8S5RSSR');`,
          }}
        />
        {/* Structured Data - Organization */}
        <Script
          id="structured-data-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'LEARN ALGO',
              url: 'https://www.learn-algo.com',
              logo: 'https://www.learn-algo.com/logo/logo.png',
              description:
                'Interactive 3D algorithm visualizations for learning data structures, algorithms, machine learning, and probability theory with step-by-step explanations and multi-language code examples',
              educationalLevel: ['Beginner', 'Intermediate', 'Advanced'],
              teaches: [
                'Data Structures',
                'Algorithms',
                'Machine Learning',
                'Sorting Algorithms',
                'Search Algorithms',
                'Tree Data Structures',
                'Stack and Queue',
                'Recursion',
                'Bit Manipulation',
                'String Algorithms',
                'Regression Analysis',
                'Clustering Algorithms',
                'Dimensionality Reduction',
                'PCA (Principal Component Analysis)',
                'Anomaly Detection',
                'Ensemble Methods',
                'Gradient Descent Optimization',
                'Feature Scaling',
                'Probability Theory',
                'Statistical Analysis',
                'KNN Algorithm',
                'Decision Trees',
                'DBSCAN Clustering',
                'Hierarchical Clustering',
                'GMM (Gaussian Mixture Models)',
              ],
            }),
          }}
        />
        {/* Structured Data - Website */}
        <Script
          id="structured-data-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'LEARN ALGO',
              url: 'https://www.learn-algo.com',
              description:
                'Master data structures, algorithms, and machine learning through cutting-edge 3D interactive visualizations with step-by-step explanations, theory modals, and multi-language code examples',
              inLanguage: 'en-US',
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PWARegister />
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
        <StructuredData />
      </body>
    </html>
  )
}
