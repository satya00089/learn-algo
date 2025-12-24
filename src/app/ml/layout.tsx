import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Machine Learning',
    template: '%s | ML | Learn Algo',
  },
  description:
    'Explore interactive machine learning algorithm visualizations. Learn regression, classification, clustering, and optimization techniques with step-by-step animations.',
}

export default function MLLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
