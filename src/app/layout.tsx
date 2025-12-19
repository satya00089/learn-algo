import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.learn-algo.com'),
  title: {
    default: 'learn-algo - Interactive Algorithm Visualizations',
    template: '%s | learn-algo',
  },
  description:
    'Master data structures, algorithms, and machine learning through interactive visualizations. Step-by-step exploration of sorting, searching, trees, graphs, regression, clustering, and more.',
  keywords: [
    'algorithms',
    'data structures',
    'machine learning',
    'visualization',
    'interactive learning',
    'DSA',
    'sorting algorithms',
    'binary search tree',
    'graph algorithms',
    'ML algorithms',
    'linear regression',
    'k-means clustering',
    'programming education',
  ],
  authors: [{ name: 'learn-algo' }],
  creator: 'learn-algo',
  publisher: 'learn-algo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.learn-algo.com',
    title: 'learn-algo - Interactive Algorithm Visualizations',
    description:
      'Master algorithms through interactive visualizations. See every step, understand every concept.',
    siteName: 'learn-algo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'learn-algo - Interactive Algorithm Visualizations',
    description:
      'Master algorithms through interactive visualizations. See every step, understand every concept.',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
