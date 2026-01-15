import { VariancePlayground } from '@/modules/ml/playground/VariancePlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { FAQSchema } from '@/components/FAQSchema'

export const metadata = {
  title: 'Variance - Statistical Spread Visualization',
  description:
    'Interactive variance visualization with card drawing. Explore how variance measures the spread of a distribution and watch the running variance converge to the theoretical value through the Law of Large Numbers.',
  keywords: [
    'variance',
    'statistical spread',
    'card drawing',
    'probability',
    'law of large numbers',
    'running variance',
    'squared differences',
    'statistics',
    'expected value',
    'distribution',
    'convergence',
    'machine learning mathematics',
  ],
}

export default function VariancePage() {
  const faqs = [
    {
      question: 'What is variance?',
      answer:
        'Variance measures how spread out the values in a distribution are. It is calculated as the average of squared differences from the expected value: Var(X) = E[(X - E[X])²]. A higher variance means the values are more spread out, while a lower variance means they are closer to the expected value.',
    },
    {
      question: 'How does the Law of Large Numbers relate to variance?',
      answer:
        'The Law of Large Numbers states that as the number of trials increases, the sample variance converges to the theoretical variance. This means if you draw many cards, the average of squared differences will get closer and closer to the true variance of the distribution.',
    },
    {
      question: 'Why do we square the differences?',
      answer:
        'We square the differences for two reasons: (1) to make all deviations positive (otherwise positive and negative differences would cancel out), and (2) to give more weight to larger deviations. This makes variance sensitive to outliers and provides a measure of the overall spread.',
    },
    {
      question: 'How does changing the deck affect variance?',
      answer:
        'When you remove cards from the deck, you change the distribution. If you keep only similar values (e.g., 5, 6, 7), the variance will be low because the values are close together. If you keep only extreme values (e.g., 1 and 10), the variance will be high because the values are spread far apart.',
    },
    {
      question: 'What is the difference between variance and standard deviation?',
      answer:
        'Standard deviation is simply the square root of variance. While variance is measured in squared units, standard deviation is in the same units as the original data, making it more intuitive to interpret. For example, if your data is in dollars, variance is in dollars squared, but standard deviation is in dollars.',
    },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Variance - Statistical Spread Visualization',
    description:
      'Interactive card drawing simulation demonstrating variance, squared differences, and the Law of Large Numbers with customizable card deck selection.',
    educationalLevel: 'Intermediate',
    teaches: [
      'Variance',
      'Statistical Spread',
      'Law of Large Numbers',
      'Squared Differences',
      'Convergence',
    ],
  }

  return (
    <>
      <AlgorithmStructuredData type="custom" data={structuredData} />
      <FAQSchema faqs={faqs} pageUrl="/ml/variance" />
      <VariancePlayground />
    </>
  )
}
