import { Metadata } from 'next'
import { AnomalyDetectionPlayground } from '@/modules/ml/playground/AnomalyDetectionPlayground'

export const metadata: Metadata = {
  title: 'Anomaly Detection - Interactive ML Algorithms',
  description: 'Explore anomaly detection algorithms including Isolation Forest, One-Class SVM, Local Outlier Factor, and statistical methods. Identify outliers in your data with interactive visualizations.',
  keywords: [
    'anomaly detection',
    'outlier detection',
    'isolation forest',
    'one class svm',
    'local outlier factor',
    'lof',
    'z score',
    'iqr method',
    'machine learning',
    'unsupervised learning',
    'data mining',
    'novelty detection',
    'interactive visualization',
    'algorithm comparison',
  ],
  openGraph: {
    title: 'Anomaly Detection - Interactive ML Algorithms',
    description: 'Explore anomaly detection algorithms including Isolation Forest, One-Class SVM, Local Outlier Factor, and statistical methods.',
    images: [
      {
        url: '/og/og-ml-anomaly-detection.png',
        width: 1200,
        height: 630,
        alt: 'Anomaly Detection Visualization',
      },
    ],
  },
}

export default function AnomalyDetectionPage() {
  return <AnomalyDetectionPlayground />
}