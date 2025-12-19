'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'
import { TbMountain } from 'react-icons/tb'
import { MdOutlineRadar } from 'react-icons/md'

export default function MLPage() {
  const algorithms = [
    {
      title: 'Gradient Descent',
      description: 'Interactive optimization visualization on mathematical functions',
      href: '/ml/gradient-descent',
      icon: TbMountain,
      iconType: 'react-icon' as const,
      color: 'text-purple-600 dark:text-purple-400',
      darkFilter: '',
      difficulty: 'Beginner',
      comingSoon: false,
    },
    {
      title: 'Linear Regression',
      description: 'Gradient descent optimization for fitting a line to data points',
      href: '/ml/linear-regression',
      icon: '/icons/ml/linear-regression.png',
      iconType: 'image' as const,
      color: 'text-blue-600 dark:text-blue-400',
      darkFilter: 'dark:invert dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]',
      difficulty: 'Beginner',
      comingSoon: false,
    },
    {
      title: 'Polynomial Regression',
      description: 'Curve fitting with gradient descent training',
      href: '/ml/polynomial-regression',
      icon: '/icons/ml/polynomial-regression.png',
      iconType: 'image' as const,
      color: 'text-green-600 dark:text-green-400',
      darkFilter: 'dark:invert dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]',
      difficulty: 'Intermediate',
      comingSoon: false,
    },
    {
      title: 'Logistic Regression',
      description: 'Binary classification with sigmoid activation',
      href: '/ml/logistic-regression',
      icon: '/icons/ml/logistic-regression.png',
      iconType: 'image' as const,
      color: 'text-orange-600 dark:text-orange-400',
      darkFilter: 'dark:invert dark:drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]',
      difficulty: 'Beginner',
      comingSoon: false,
    },
    {
      title: 'K-Nearest Neighbors',
      description: 'Instance-based classification using distance metrics',
      href: '/ml/knn',
      icon: MdOutlineRadar,
      iconType: 'react-icon' as const,
      color: 'text-pink-600 dark:text-pink-400',
      darkFilter: '',
      difficulty: 'Beginner',
      comingSoon: false,
    },
    {
      title: 'K-Means Clustering',
      description: 'Unsupervised learning for grouping similar data',
      href: '/ml/k-means',
      icon: '/icons/ml/cluster.png',
      iconType: 'image' as const,
      color: 'text-indigo-600 dark:text-indigo-400',
      darkFilter: 'dark:invert dark:drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]',
      difficulty: 'Intermediate',
      comingSoon: false,
    },
  ]

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
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

        <div className="flex-1 overflow-y-auto px-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {algorithms.map((algo) => (
              <Link
                key={algo.href}
                href={algo.comingSoon ? '#' : algo.href}
                className={`group ${algo.comingSoon ? 'pointer-events-none' : ''}`}
              >
                <div
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 h-full transition-all duration-300 ${
                    algo.comingSoon ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-2'
                  }`}
                >
                  <div className="mb-3">
                    {algo.iconType === 'image' ? (
                      <Image
                        src={algo.icon}
                        alt={algo.title}
                        width={64}
                        height={64}
                        className={`object-contain ${algo.darkFilter}`}
                      />
                    ) : (
                      <div className={`text-6xl ${algo.color}`}>
                        {typeof algo.icon === 'function' && <algo.icon />}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {algo.title}
                    </h2>
                    {algo.comingSoon && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                    {algo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {algo.difficulty}
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
