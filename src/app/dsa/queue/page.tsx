import { QueuePlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Queue',
  description:
    'Interactive Queue data structure visualization. Learn FIFO (First In First Out) operations: enqueue, dequeue, and understand queue applications.',
}

export default function QueuePage() {
  return <QueuePlayground />
}
