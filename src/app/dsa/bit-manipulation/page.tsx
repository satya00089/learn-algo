import { BitManipulationPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bit Manipulation',
  description:
    'Interactive bit manipulation visualization. Learn bitwise operations (AND, OR, XOR, NOT, shifts) and their applications in algorithms.',
}

export default function BitManipulationPage() {
  return <BitManipulationPlayground />
}
