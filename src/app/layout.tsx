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
    'Master data structures, algorithms, and machine learning through interactive visualizations. Step-by-step exploration of sorting, searching, trees, graphs, regression, clustering, and more. Perfect for students, developers, and interview preparation.',
  keywords: [
    'algorithms',
    'data structures',
    'machine learning',
    'visualization',
    'interactive learning',
    'DSA',
    'sorting algorithms',
    'quicksort visualization',
    'binary search tree',
    'graph algorithms',
    'ML algorithms',
    'linear regression',
    'polynomial regression',
    'k-means clustering',
    'programming education',
    'coding interview prep',
    'algorithm animation',
    'computer science education',
    'learn algorithms online',
    'free algorithm visualizer',
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
    title: 'LEARN ALGO - Interactive Algorithm Visualizations',
    description:
      'Master algorithms through interactive visualizations. Watch sorting, searching, and ML algorithms execute step-by-step. Free forever.',
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
    title: 'LEARN ALGO - Interactive Algorithm Visualizations',
    description:
      'Master algorithms through interactive visualizations. Watch sorting, searching, and ML algorithms execute step-by-step. Free forever.',
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
                'Interactive algorithm visualizations for learning data structures, algorithms, and machine learning',
              educationalLevel: ['Beginner', 'Intermediate', 'Advanced'],
              teaches: [
                'Data Structures',
                'Algorithms',
                'Machine Learning',
                'Sorting Algorithms',
                'Graph Algorithms',
                'Regression Analysis',
                'Clustering',
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
                'Master data structures, algorithms, and machine learning through interactive visualizations',
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
