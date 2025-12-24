import { StringOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'String Operations',
  description:
    'Interactive string operations visualization. Master string manipulation algorithms, pattern matching, and text processing techniques.',
}

export default function StringsPage() {
  return <StringOperationsPlayground />
}
