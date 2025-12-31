import Script from 'next/script'
import { generateDSAStructuredData, DSARoute } from '@/app/dsa/metadata-config'
import { generateMLStructuredData, MLRoute } from '@/app/ml/metadata-config'

interface DSAStructuredDataProps {
  type: 'dsa'
  route: DSARoute
}

interface MLStructuredDataProps {
  type: 'ml'
  route: MLRoute
}

interface CustomStructuredDataProps {
  type: 'custom'
  data: Record<string, any>
}

type AlgorithmStructuredDataProps =
  | DSAStructuredDataProps
  | MLStructuredDataProps
  | CustomStructuredDataProps

export function AlgorithmStructuredData(props: AlgorithmStructuredDataProps) {
  let structuredData: Record<string, any>
  let id: string

  if (props.type === 'dsa') {
    structuredData = generateDSAStructuredData(props.route)
    id = `algorithm-schema-dsa-${props.route}`
  } else if (props.type === 'ml') {
    structuredData = generateMLStructuredData(props.route)
    id = `algorithm-schema-ml-${props.route}`
  } else {
    structuredData = props.data
    id = 'algorithm-schema-custom'
  }

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
