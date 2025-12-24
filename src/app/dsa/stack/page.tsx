import { StackPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'Interactive Stack data structure visualization. Learn LIFO (Last In First Out) operations: push, pop, peek, and understand stack applications.',
}

export default function StackPage() {
  return <StackPlayground />
}
