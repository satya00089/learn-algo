'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/core/theme'

export default function DSAPage() {
  const algorithms = [
    {
      title: 'Array Operations',
      description: 'Explore append, insert, delete, search, and update',
      href: '/dsa/array-operations',
      icon: '📊',
      difficulty: 'Beginner',
      complexity: 'O(1) - O(n)',
      comingSoon: false,
    },
    {
      title: 'Stack (LIFO)',
      description: 'Last In First Out - push, pop, and peek operations',
      href: '/dsa/stack',
      icon: '📚',
      difficulty: 'Beginner',
      complexity: 'O(1)',
      comingSoon: false,
    },
    {
      title: 'Queue (FIFO)',
      description: 'First In First Out - enqueue, dequeue, and peek operations',
      href: '/dsa/queue',
      icon: '🎟️',
      difficulty: 'Beginner',
      complexity: 'O(1)',
      comingSoon: false,
    },
    {
      title: 'Bubble Sort',
      description: 'Watch elements bubble to their correct positions',
      href: '/dsa/bubble-sort',
      icon: '🫧',
      difficulty: 'Beginner',
      complexity: 'O(n²)',
      comingSoon: false,
    },
    {
      title: 'Insertion Sort',
      description: 'Build sorted array by inserting elements one by one',
      href: '/dsa/insertion-sort',
      icon: '📥',
      difficulty: 'Beginner',
      complexity: 'O(n²)',
      comingSoon: false,
    },
    {
      title: 'Selection Sort',
      description: 'Repeatedly select minimum and place at beginning',
      href: '/dsa/selection-sort',
      icon: '🎯',
      difficulty: 'Beginner',
      complexity: 'O(n²)',
      comingSoon: false,
    },
    {
      title: 'Merge Sort',
      description: 'Divide and conquer with guaranteed O(n log n)',
      href: '/dsa/merge-sort',
      icon: '🔀',
      difficulty: 'Intermediate',
      complexity: 'O(n log n)',
      comingSoon: false,
    },
    {
      title: 'Quick Sort',
      description: 'Visualize partitioning and recursion',
      href: '/dsa/quick-sort',
      icon: '⚡',
      difficulty: 'Intermediate',
      complexity: 'O(n log n)',
      comingSoon: false,
    },
    {
      title: 'Heap Sort',
      description: 'Sort using binary heap data structure',
      href: '/dsa/heap-sort',
      icon: '🗻',
      difficulty: 'Advanced',
      complexity: 'O(n log n)',
      comingSoon: false,
    },
    {
      title: 'Binary Search Tree',
      description: 'Interactive tree operations and traversals',
      href: '/dsa/binary-search-tree',
      icon: '🌳',
      difficulty: 'Intermediate',
      complexity: 'O(log n)',
      comingSoon: false,
    },
    {
      title: 'Bit Manipulation',
      description: 'Bitwise operations: AND, OR, XOR, shifts, and bit tricks',
      href: '/dsa/bit-manipulation',
      icon: '💾',
      difficulty: 'Intermediate',
      complexity: 'O(1)',
      comingSoon: false,
    },
    {
      title: 'String Operations',
      description: 'Reverse, palindrome, anagram, substring search',
      href: '/dsa/strings',
      icon: '📝',
      difficulty: 'Beginner',
      complexity: 'O(n)',
      comingSoon: false,
    },
    {
      title: 'Recursion',
      description: 'Factorial, Fibonacci, Tower of Hanoi visualized',
      href: '/dsa/recursion',
      icon: '🔄',
      difficulty: 'Intermediate',
      complexity: 'O(2^n)',
      comingSoon: false,
    },
  ]

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
            Data Structures & Algorithms
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Master fundamental algorithms through visualization. Step through sorting algorithms,
            explore data structures, and understand how they work under the hood.
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
                  <div className="text-4xl mb-3">{algo.icon}</div>
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
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {algo.difficulty}
                      </span>
                      <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                        {algo.complexity}
                      </span>
                    </div>
                    {!algo.comingSoon && (
                      <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform text-sm">
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
