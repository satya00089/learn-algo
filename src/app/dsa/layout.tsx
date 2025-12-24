import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Data Structures & Algorithms',
    template: '%s | DSA | Learn Algo',
  },
  description:
    'Master data structures and algorithms through interactive visualizations. Explore sorting, searching, trees, graphs, stacks, queues, and more with animated step-by-step explanations.',
}

export default function DSALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
