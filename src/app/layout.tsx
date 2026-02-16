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
    default: 'LEARN ALGO - Interactive 3D Algorithm Visualizations | Master DSA, ML & AI',
    template: '%s | LEARN ALGO',
  },
  description:
    'Master data structures, algorithms, and machine learning through cutting-edge 3D interactive visualizations. Explore sorting algorithms, binary trees, PCA dimensionality reduction, clustering (K-Means, DBSCAN, GMM, Hierarchical), regression models, gradient descent optimization, anomaly detection, ensemble methods, probability theory, and more. Step-by-step explanations with multi-language code examples. Perfect for students, developers, and technical interview preparation.',
  keywords: [
    'algorithm visualization',
    'interactive algorithms',
    '3D visualization',
    'data structures',
    'machine learning',
    'DSA tutorial',
    'sorting algorithms',
    'quicksort visualization',
    'merge sort',
    'heap sort',
    'binary search tree',
    'binary search algorithm',
    'stack and queue',
    'recursion visualization',
    'bit manipulation',
    'string algorithms',
    'ML algorithms',
    'PCA visualization',
    'principal component analysis',
    '3D PCA',
    'dimensionality reduction',
    'linear regression',
    'polynomial regression',
    'logistic regression',
    'k-means clustering',
    'DBSCAN clustering',
    'GMM clustering',
    'hierarchical clustering',
    'anomaly detection',
    'ensemble models',
    'gradient descent',
    'feature scaling',
    'standard scaler',
    'minmax scaler',
    'regularization',
    'probability theory',
    'expected value',
    'variance',
    'KNN algorithm',
    'decision tree',
    'programming education',
    'coding interview prep',
    'algorithm animation',
    'computer science education',
    'learn algorithms online',
    'free algorithm visualizer',
    'FAANG interview prep',
    'technical interview practice',
  ],
  authors: [{ name: 'LEARN ALGO' }],
  creator: 'LEARN ALGO',
  publisher: 'LEARN ALGO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.learn-algo.com',
    title: 'LEARN ALGO - Interactive 3D Algorithm Visualizations',
    description:
      'Master algorithms through cutting-edge 3D interactive visualizations. Explore PCA dimensionality reduction, clustering algorithms (K-Means, DBSCAN, GMM), gradient descent optimization, sorting algorithms, binary trees, probability theory, and more. Step-by-step explanations with code examples. Free forever.',
    siteName: 'LEARN ALGO',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LEARN ALGO - Interactive Algorithm Visualizations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEARN ALGO - Interactive 3D Algorithm Visualizations',
    description:
      'Master algorithms through cutting-edge 3D interactive visualizations. Explore PCA, clustering algorithms, gradient descent, sorting, trees, probability theory, and more. Step-by-step explanations with code examples. Free forever.',
    images: ['/og/og-image.png'],
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
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://www.learn-algo.com',
  },
  other: {
    'theme-color': '#ffffff',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
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
