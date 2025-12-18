'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/core/theme'

export default function AIPage() {
  const algorithms = [
    {
      title: 'A* Pathfinding',
      description: 'Visualize optimal path finding with heuristics',
      href: '/ai/astar',
      icon: '🎯',
      difficulty: 'Intermediate',
      comingSoon: true,
    },
    {
      title: 'Minimax Algorithm',
      description: 'Game theory and decision trees',
      href: '/ai/minimax',
      icon: '🎮',
      difficulty: 'Advanced',
      comingSoon: true,
    },
    {
      title: 'Genetic Algorithm',
      description: 'Evolution-inspired optimization',
      href: '/ai/genetic',
      icon: '🧬',
      difficulty: 'Advanced',
      comingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-green-600 dark:text-green-400 hover:underline inline-block"
            >
              ← Back to Home
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-white">
            Artificial Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Explore AI algorithms through interactive demos. Understand search strategies, game
            theory, and optimization techniques that power intelligent systems.
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
                  algo.comingSoon ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                <div className="text-5xl mb-4">{algo.icon}</div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{algo.title}</h2>
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
                    <span className="text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
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
