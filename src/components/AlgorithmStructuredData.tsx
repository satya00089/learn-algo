import Script from 'next/script'
import { generateDSAStructuredData, DSARoute } from '@/app/dsa/metadata-config'

interface AlgorithmStructuredDataProps {
  route: DSARoute
}

export function AlgorithmStructuredData({ route }: AlgorithmStructuredDataProps) {
  const structuredData = generateDSAStructuredData(route)

  return (
    <Script
      id={`algorithm-schema-${route}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
