'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export default function AIPage() {
  const algorithms = [
    {
      title: 'A* Pathfinding',
      description: 'Visualize optimal path finding with heuristics',
      href: '/ai/astar',
      icon: '/icons/ai/pathfinding.png',
      iconType: 'image' as const,
      darkFilter: 'dark:invert',
      difficulty: 'Intermediate',
      comingSoon: true,
      category: 'Search Algorithms',
    },
    {
      title: 'Minimax Algorithm',
      description: 'Game theory and decision trees',
      href: '/ai/minimax',
      icon: '/icons/ai/minimax.png',
      iconType: 'image' as const,
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: true,
      category: 'Game Theory',
    },
    {
      title: 'Genetic Algorithm',
      description: 'Evolution-inspired optimization',
      href: '/ai/genetic',
      icon: '/icons/ai/genetic.png',
      iconType: 'image' as const,
      darkFilter: 'dark:invert',
      difficulty: 'Advanced',
      comingSoon: true,
      beta: false,
      category: 'Optimization',
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
            Artificial Intelligence
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Explore AI algorithms through interactive demos. Understand search strategies, game
            theory, and optimization techniques that power intelligent systems.
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
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 h-full transition-all duration-300 border-l-4 border-green-500 ${
                    algo.comingSoon ? 'opacity-70' : 'hover:shadow-2xl hover:-translate-y-2'
                  }`}
                >
                  <div className="mb-3">
                    {algo.iconType === 'image' ? (
                      <Image
                        src={algo.icon}
                        alt={algo.title}
                        width={88}
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
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      {algo.category}
                    </span>
                    {!algo.comingSoon && (
                      <span className="text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform text-sm">
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
