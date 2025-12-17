'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/core/theme'

export default function DSAPage() {
  const algorithms = [
    {
      title: 'Bubble Sort',
      description: 'Watch elements bubble to their correct positions',
      href: '/dsa/bubble-sort',
      icon: '🫧',
      difficulty: 'Beginner',
      comingSoon: true,
    },
    {
      title: 'Quick Sort',
      description: 'Visualize partitioning and recursion',
      href: '/dsa/quick-sort',
      icon: '⚡',
      difficulty: 'Intermediate',
      comingSoon: true,
    },
    {
      title: 'Binary Search Tree',
      description: 'Interactive tree operations and traversals',
      href: '/dsa/binary-search-tree',
      icon: '🌳',
      difficulty: 'Intermediate',
      comingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-purple-600 dark:text-purple-400 hover:underline inline-block"
            >
              ← Back to Home
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-white">
            Data Structures & Algorithms
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Master fundamental algorithms through visualization. Step through sorting algorithms,
            explore data structures, and understand how they work under the hood.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo) => (
            <Link
              key={algo.href}
              href={algo.comingSoon ? '#' : algo.href}
              className={`group ${algo.comingSoon ? 'pointer-events-none' : ''}`}
            >
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full transition-all duration-300 ${
                  algo.comingSoon
                    ? 'opacity-60'
                    : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                <div className="text-5xl mb-4">{algo.icon}</div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {algo.title}
                  </h2>
                  {algo.comingSoon && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{algo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {algo.difficulty}
                  </span>
                  {!algo.comingSoon && (
                    <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
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
  )
}
