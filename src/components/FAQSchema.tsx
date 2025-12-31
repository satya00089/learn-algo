import Script from 'next/script'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
  pageUrl: string
}

export function FAQSchema({ faqs, pageUrl }: FAQSchemaProps) {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id={`faq-schema-${pageUrl}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
    />
  )
}

// Common FAQ data for DSA algorithms
export const dsaCommonFAQs: Record<string, FAQItem[]> = {
  'binary-search': [
    {
      question: 'What is Binary Search algorithm?',
      answer:
        'Binary Search is an efficient algorithm for finding a target value within a sorted array. It works by repeatedly dividing the search interval in half, comparing the target value to the middle element, and eliminating half of the remaining elements.',
    },
    {
      question: 'What is the time complexity of Binary Search?',
      answer:
        'Binary Search has a time complexity of O(log n), where n is the number of elements in the array. This makes it much faster than linear search for large datasets.',
    },
    {
      question: 'When should I use Binary Search?',
      answer:
        'Binary Search should be used when you have a sorted array and need to find a specific element quickly. It is ideal for large datasets where linear search would be too slow.',
    },
  ],
  'bubble-sort': [
    {
      question: 'What is Bubble Sort?',
      answer:
        'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The process is repeated until no swaps are needed.',
    },
    {
      question: 'What is the time complexity of Bubble Sort?',
      answer:
        'Bubble Sort has a worst-case and average time complexity of O(n²), where n is the number of elements. Best case is O(n) when the array is already sorted.',
    },
    {
      question: 'Is Bubble Sort efficient?',
      answer:
        'Bubble Sort is not efficient for large datasets due to its O(n²) time complexity. However, it is easy to understand and implement, making it useful for educational purposes and small datasets.',
    },
  ],
  stack: [
    {
      question: 'What is a Stack data structure?',
      answer:
        'A Stack is a linear data structure that follows the Last In First Out (LIFO) principle. The last element added to the stack is the first one to be removed. It supports two main operations: push (add) and pop (remove).',
    },
    {
      question: 'What are common applications of Stack?',
      answer:
        'Stacks are commonly used for function call management, expression evaluation, undo mechanisms in applications, backtracking algorithms, and browser history management.',
    },
    {
      question: 'What is the time complexity of Stack operations?',
      answer:
        'Both push and pop operations in a Stack have O(1) constant time complexity, making them very efficient for adding and removing elements.',
    },
  ],
}
