import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'AI Algorithms',
    template: '%s | AI | Learn Algo',
  },
  description:
    'Explore artificial intelligence algorithms and techniques. Learn neural networks, deep learning, and advanced AI concepts through interactive visualizations.',
}

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
