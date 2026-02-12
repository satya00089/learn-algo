'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export default function MLPage() {
  const mathFundamentals = [
    {
      title: 'Chance Events',
      description:
        'Explore random events, coin flips, and probability basics with interactive visualizations',
      href: '/ml/chance-events',
      icon: '/icons/ml/chance-events.png',
      iconType: 'image' as const,
      color: 'text-purple-600 dark:text-purple-400',
      darkFilter: 'dark:invert',
      difficulty: 'Beginner',
      comingSoon: false,
      category: 'Basic Probability',
    },
    {
      title: 'Expectation',
      description: 'Learn about expected values and probability-weighted outcomes',
      href: '/ml/expectation',
      icon: '/icons/ml/dice.png',
      iconType: 'image' as const,
      color: 'text-yellow-600 dark:text-yellow-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Basic Probability',
    },
    {
      title: 'Variance',
      description: 'Understand variability and standard deviation in probability distributions',
      href: '/ml/variance',
      icon: '/icons/ml/variance.png',
      iconType: 'image' as const,
      color: 'text-orange-600 dark:text-orange-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Basic Probability',
    },
    // {
    //   title: 'Conditional Probability',
    //   description: 'Understand Bayes theorem and conditional events through interactive examples',
    //   href: '/ml/conditional-probability',
    //   icon: '/icons/ml/conditional.png',
    //   iconType: 'image' as const,
    //   color: 'text-blue-600 dark:text-blue-400',
    //   darkFilter: 'dark:invert',
    //   difficulty: 'Intermediate',
    //   comingSoon: true,
    //   category: 'Basic Probability',
    // },
    // {
    //   title: 'Probability Distributions',
    //   description:
    //     'Explore normal, binomial, and uniform distributions with interactive visualizations',
    //   href: '/ml/distributions',
    //   icon: '/icons/ml/distributions.png',
    //   iconType: 'image' as const,
    //   color: 'text-green-600 dark:text-green-400',
    //   darkFilter: 'dark:invert',
    //   difficulty: 'Intermediate',
    //   comingSoon: true,
    //   category: 'Basic Probability',
    // },
  ]

  const algorithms = [
    {
      title: 'Gradient Descent',
      description: 'Interactive optimization visualization on mathematical functions',
      href: '/ml/gradient-descent',
      icon: '/icons/ml/gradient-descent.png',
      iconType: 'image' as const,
      color: 'text-purple-600 dark:text-purple-400',
      darkFilter: 'dark:invert',
      difficulty: 'Beginner',
      comingSoon: false,
      category: 'Optimization',
    },
    {
      title: 'MinMax Scaler',
      description: 'Scale features to a fixed range for preprocessing',
      href: '/ml/minmax-scaler',
      icon: '/icons/ml/minmax.png',
      iconType: 'image' as const,
      color: 'text-cyan-600 dark:text-cyan-400',
      darkFilter: 'dark:invert',
      difficulty: 'Beginner',
      comingSoon: false,
      width: 128,
      category: 'Data Preprocessing',
    },
    {
      title: 'Standard Scaler',
      description: 'Standardize features by removing mean and scaling to unit variance',
      href: '/ml/standard-scaler',
      icon: '/icons/ml/standard.png',
      iconType: 'image' as const,
      color: 'text-violet-600 dark:text-violet-400',
      darkFilter: 'dark:invert',
      difficulty: 'Beginner',
      comingSoon: false,
      width: 178,
      category: 'Data Preprocessing',
    },
    {
      title: 'Linear Regression',
      description: 'Gradient descent optimization for fitting a line to data points',
      href: '/ml/linear-regression',
      icon: '/icons/ml/linear-regression.png',
      iconType: 'image' as const,
      color: 'text-blue-600 dark:text-blue-400',
      darkFilter: 'dark:invert',
      difficulty: 'Beginner',
      comingSoon: false,
      category: 'Supervised Learning',
    },
    {
      title: 'Polynomial Regression',
      description: 'Curve fitting with gradient descent training',
      href: '/ml/polynomial-regression',
      icon: '/icons/ml/polynomial-regression.png',
      iconType: 'image' as const,
      color: 'text-green-600 dark:text-green-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Supervised Learning',
    },
    {
      title: 'Logistic Regression',
      description: 'Binary classification with sigmoid activation',
      href: '/ml/logistic-regression',
      icon: '/icons/ml/logistic-regression.png',
      iconType: 'image' as const,
      color: 'text-orange-600 dark:text-orange-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Supervised Learning',
    },
    {
      title: 'Decision Tree',
      description: 'Classification using recursive partitioning and split criteria',
      href: '/ml/decision-tree',
      icon: '/icons/ml/decision-tree.png',
      iconType: 'image' as const,
      color: 'text-emerald-600 dark:text-emerald-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      beta: true,
      category: 'Supervised Learning',
    },
    {
      title: 'Ensemble Models',
      description: 'Random Forest combining multiple trees for robust predictions',
      href: '/ml/ensemble-models',
      icon: '/icons/ml/ensemble.png',
      iconType: 'image' as const,
      color: 'text-teal-600 dark:text-teal-400',
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: false,
      beta: true,
      category: 'Supervised Learning',
    },
    {
      title: 'K-Nearest Neighbors',
      description: 'Instance-based classification using distance metrics',
      href: '/ml/knn',
      icon: '/icons/ml/knn.png',
      iconType: 'image' as const,
      color: 'text-pink-600 dark:text-pink-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Supervised Learning',
    },
    {
      title: 'K-Means Clustering',
      description: 'Unsupervised learning for grouping similar data',
      href: '/ml/k-means',
      icon: '/icons/ml/cluster.png',
      iconType: 'image' as const,
      color: 'text-indigo-600 dark:text-indigo-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Unsupervised Learning',
    },
    {
      title: 'Hierarchical Clustering',
      description: 'Build cluster hierarchies using agglomerative bottom-up merging',
      href: '/ml/hierarchical-clustering',
      icon: '/icons/ml/hierarchical.png',
      iconType: 'image' as const,
      color: 'text-rose-600 dark:text-rose-400',
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: false,
      category: 'Unsupervised Learning',
    },
    {
      title: 'Gaussian Mixture Model',
      description: 'Soft clustering with probabilistic assignments via EM algorithm',
      href: '/ml/gmm',
      icon: '/icons/ml/gmm-cluster.png',
      iconType: 'image' as const,
      color: 'text-teal-600 dark:text-teal-400',
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: false,
      category: 'Unsupervised Learning',
    },
    {
      title: 'DBSCAN Clustering',
      description: 'Density-based clustering that finds arbitrarily shaped clusters',
      href: '/ml/dbscan',
      icon: '/icons/ml/dbscan.png',
      iconType: 'image' as const,
      color: 'text-purple-600 dark:text-purple-400',
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: false,
      category: 'Unsupervised Learning',
    },
    {
      title: 'Anomaly/Outlier Detection',
      description:
        'Detect outliers using Isolation Forest, One-Class SVM, LOF, Z-Score, and IQR methods',
      href: '/ml/anomaly-detection',
      icon: '/icons/ml/outlier.png',
      iconType: 'image' as const,
      color: 'text-red-600 dark:text-red-400',
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: false,
      category: 'Unsupervised Learning',
    },
    {
      title: 'Principal Component Analysis',
      description:
        'Dimensionality reduction using principal components to capture maximum variance',
      href: '/ml/pca',
      icon: '/icons/ml/pca.png',
      iconType: 'image' as const,
      color: 'text-amber-600 dark:text-amber-400',
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: false,
      category: 'Dimensionality Reduction',
    },
  ]

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="px-3 py-1.5 flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span>←</span> Back to Home
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
            Machine Learning
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Explore machine learning algorithms through interactive visualizations. Step through
            gradient descent, watch clusters form, and understand how models learn from data.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
          {/* Mathematics Fundamentals Section */}
          <div className="mb-6 max-w-full">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Image
                src={'/icons/ml/trigonometry.png'}
                alt="Mathematics For Machine Learning"
                width={48}
                height={48}
                className={`object-contain dark:invert`}
              />
              Mathematics For Machine Learning
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Build a strong mathematical foundation with probability, statistics, and linear
              algebra
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mathFundamentals.map((topic) => (
                <Link
                  key={topic.href}
                  href={topic.comingSoon ? '#' : topic.href}
                  className={`group ${topic.comingSoon ? 'pointer-events-none' : ''}`}
                >
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 h-full transition-all duration-300 border-l-4 border-orange-500 ${
                      topic.comingSoon ? 'opacity-70' : 'hover:shadow-2xl hover:-translate-y-2'
                    }`}
                  >
                    <div className="mb-3">
                      {topic.iconType === 'image' ? (
                        <Image
                          src={topic.icon}
                          alt={topic.title}
                          width={88}
                          height={64}
                          className={`object-contain ${topic.darkFilter}`}
                        />
                      ) : (
                        <div className="text-4xl">{topic.icon}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-left mb-2">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {topic.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        {topic.comingSoon && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 mx-2 px-2 py-1 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                      {topic.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                        {topic.category}
                      </span>
                      {!topic.comingSoon && (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform text-sm">
                          Learn →
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ML Algorithms Section */}
          <div className="mb-4 max-w-full">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Image
                src={'/icons/ml/machine-learning.png'}
                alt="Machine Learning Algorithms"
                width={48}
                height={48}
                className={`object-contain dark:invert`}
              />
              Machine Learning Algorithms
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Explore supervised and unsupervised learning algorithms with real-time visualizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {algorithms.map((algo) => (
              <Link
                key={algo.href}
                href={algo.comingSoon ? '#' : algo.href}
                className={`group ${algo.comingSoon ? 'pointer-events-none' : ''}`}
              >
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 h-full transition-all duration-300 border-l-4 border-blue-500 ${
                    algo.comingSoon ? 'opacity-70' : 'hover:shadow-2xl hover:-translate-y-2'
                  }`}
                >
                  <div className="mb-3">
                    {algo.iconType === 'image' ? (
                      <Image
                        src={algo.icon}
                        alt={algo.title}
                        width={algo.width || 88}
                        height={64}
                        className={`object-contain ${algo.darkFilter}`}
                      />
                    ) : (
                      <div className="text-4xl">{algo.icon}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-left mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {algo.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      {algo.comingSoon && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 mx-2 px-2 py-1 rounded">
                          Soon
                        </span>
                      )}
                      {algo.beta && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mx-2 px-2 py-1 rounded font-semibold">
                          Beta
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                    {algo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {algo.category}
                    </span>
                    {!algo.comingSoon && (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform text-sm">
                        Try it →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
