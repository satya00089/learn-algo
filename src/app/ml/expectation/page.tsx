import { ExpectationPlayground } from '@/modules/ml/playground/ExpectationPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { FAQSchema } from '@/components/FAQSchema'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('expectation')

export default function ExpectationPage() {
  const faqs = [
    {
      question: 'What is expected value?',
      answer:
        'Expected value E[X] is the probability-weighted average of all possible outcomes. It represents the long-run average value you would get if you repeated an experiment many times. For a fair six-sided die, E[X] = (1+2+3+4+5+6)/6 = 3.5.',
    },
    {
      question: 'How does the Law of Large Numbers relate to expected value?',
      answer:
        'The Law of Large Numbers states that as the number of trials increases, the sample mean (running mean) converges to the expected value. This means if you roll a die many times, the average of all rolls will get closer and closer to 3.5 (for a fair die).',
    },
    {
      question: 'What happens when I make the die biased?',
      answer:
        'When you adjust the probability distribution to favor certain faces, you create a biased die. The expected value changes to reflect the weighted probabilities: E[X] = Σ x·P(x). For example, if you increase the weight of face 6, the expected value will be higher than 3.5.',
    },
    {
      question: 'Why is the running mean different from the expected value?',
      answer:
        'The running mean is calculated from actual observed rolls, which involves randomness. The expected value is the theoretical average based on probabilities. With few rolls, random variation causes differences. As you roll more times, the running mean converges to the expected value.',
    },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Expectation - Expected Value Visualization',
    description:
      'Interactive dice rolling simulation demonstrating expected value, probability-weighted averages, and the Law of Large Numbers with adjustable probability distributions.',
    educationalLevel: 'Intermediate',
    teaches: [
      'Expected Value',
      'Probability Distribution',
      'Law of Large Numbers',
      'Running Mean',
      'Convergence',
    ],
  }

  return (
    <>
      <AlgorithmStructuredData type="custom" data={structuredData} />
      <FAQSchema faqs={faqs} pageUrl="/ml/expectation" />
      <ExpectationPlayground />
    </>
  )
}
