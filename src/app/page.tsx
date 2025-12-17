'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/core/theme'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Theme Toggle in Top Right */}
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            learn-algo.dev
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master algorithms through interactive visualization, step-by-step debugging, and hands-on experimentation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* DSA Module */}
          <Link href="/dsa" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="text-4xl mb-4">🧩</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                Data Structures & Algorithms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Visualize sorting algorithms, tree traversals, graph algorithms, and more
              </p>
              <div className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Explore DSA →
              </div>
            </div>
          </Link>

          {/* ML Module */}
          <Link href="/ml" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                Machine Learning
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Step through regression, classification, clustering, and neural networks
              </p>
              <div className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Explore ML →
              </div>
            </div>
          </Link>

          {/* AI Module */}
          <Link href="/ai" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                Artificial Intelligence
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Understand search algorithms, game theory, and optimization techniques
              </p>
              <div className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Explore AI →
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex gap-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Interactive</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Step-by-Step</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Debuggable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Visual</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
