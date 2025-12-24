import { RecursionPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursion',
  description:
    'Interactive recursion visualization. Understand recursive function calls, base cases, call stacks, and solve problems using recursive approaches.',
}

export default function RecursionPage() {
  return <RecursionPlayground />
}
