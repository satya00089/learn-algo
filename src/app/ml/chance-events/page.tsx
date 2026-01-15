import { ChanceEventsPlayground } from '@/modules/ml/playground/ChanceEventsPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { FAQSchema } from '@/components/FAQSchema'

export const metadata = {
  title: 'Chance Events - Basic Probability',
  description:
    'Interactive chance events visualization with coin flips. Explore random events, fair and weighted coins, and understand how observed frequencies converge to true probabilities.',
  keywords: [
    'chance events',
    'probability',
    'coin flip',
    'random events',
    'law of large numbers',
    'probability visualization',
    'statistics',
    'fair coin',
    'weighted coin',
    'experimental probability',
    'basic probability',
    'machine learning mathematics',
  ],
}

export default function ChanceEventsPage() {
  const faqs = [
    {
      question: 'What is probability?',
      answer:
        'Probability is a number between 0 and 1 that measures the likelihood of an event occurring. A probability of 0 means the event is impossible, while 1 means it is certain. For example, a fair coin has a 0.5 (50%) probability of landing on heads.',
    },
    {
      question: 'What is the difference between a fair and unfair coin?',
      answer:
        'A fair coin has equal probability (50%) for both heads and tails. An unfair or weighted coin has been modified so one outcome is more likely than the other. This visualization lets you adjust the coin weight to see how it affects the results.',
    },
    {
      question: 'What is the Law of Large Numbers?',
      answer:
        'The Law of Large Numbers states that as the number of trials increases, the observed frequency of an event gets closer to its true probability. For example, if you flip a fair coin many times, the percentage of heads will approach 50%.',
    },
    {
      question: 'Why does the observed probability differ from the true probability?',
      answer:
        'Random variation causes the observed probability to differ from the true probability, especially with small sample sizes. As you increase the number of flips, the observed probability converges to the true probability due to the Law of Large Numbers.',
    },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Chance Events - Basic Probability Visualization',
    description:
      'Interactive coin flip simulation demonstrating chance events and probability concepts including fair and weighted coins, experimental vs theoretical probability, and the Law of Large Numbers.',
    educationalLevel: 'Beginner',
    teaches: ['Chance Events', 'Probability', 'Random Events', 'Law of Large Numbers', 'Experimental Probability'],
  }

  return (
    <>
      <AlgorithmStructuredData type="custom" data={structuredData} />
      <FAQSchema faqs={faqs} pageUrl="/ml/chance-events" />
      <ChanceEventsPlayground />
    </>
  )
}
