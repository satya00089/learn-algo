import { Metadata } from 'next'
import { MinimaxPlayground } from '@/modules/ai'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = {
  title: 'Minimax Algorithm Visualization - AI Decision Making',
  description:
    'Interactive visualization of the Minimax algorithm with Alpha-Beta Pruning for game AI. Learn how adversarial search works in Tic-Tac-Toe with step-by-step exploration.',
  keywords: [
    'minimax algorithm',
    'alpha-beta pruning',
    'game ai',
    'adversarial search',
    'tic-tac-toe ai',
    'decision tree',
    'game theory',
    'ai visualization',
  ],
  openGraph: {
    title: 'Minimax Algorithm - Interactive AI Visualization',
    description:
      'Explore how AI makes optimal decisions in games using Minimax and Alpha-Beta Pruning',
    type: 'article',
    images: [
      {
        url: '/og/ai-minimax.png',
        width: 1200,
        height: 630,
        alt: 'Minimax Algorithm Visualization',
      },
    ],
  },
}

export default function MinimaxPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: 'Minimax Algorithm',
    description:
      'The Minimax algorithm is a decision-making algorithm used in game theory and artificial intelligence for finding the optimal move in two-player zero-sum games. It works by recursively exploring all possible game states, assuming both players play optimally.',
    category: 'AI',
    difficulty: 'Intermediate',
    timeComplexity: 'O(b^d) where b is branching factor and d is depth',
    spaceComplexity: 'O(d) with depth-limited search',
    applicationCategory: 'AI Algorithm',
    keywords: [
      'minimax algorithm',
      'alpha-beta pruning',
      'game ai',
      'adversarial search',
      'tic-tac-toe ai',
    ],
  }

  return (
    <>
      <AlgorithmStructuredData type="custom" data={structuredData} />
      <MinimaxPlayground />
    </>
  )
}
