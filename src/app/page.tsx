'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/core/theme'

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="h-full flex flex-col">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Title with Gradient */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              learn-algo.dev
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 mb-4 font-medium">
              Master Algorithms Through Interactive Visualization
            </p>
            
            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
              Step through code, watch data transform, and understand how algorithms work under the hood.
              No more black boxes—see every step in real-time.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-700">
                ⚡ Interactive Playgrounds
              </div>
              <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold border border-indigo-200 dark:border-indigo-700">
                🔍 Step-by-Step Debugging
              </div>
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-700">
                📊 Real-Time Visualization
              </div>
              <div className="px-4 py-2 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded-full text-sm font-semibold border border-pink-200 dark:border-pink-700">
                🎯 Hands-On Learning
              </div>
            </div>

            {/* CTA Modules - Larger and More Prominent */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* DSA Module */}
              <Link href="/dsa" className="group">
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-2xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-rotate-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🧩</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                      DSA
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Sorting, Trees, Graphs & More
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* ML Module - Featured */}
              <Link href="/ml" className="group">
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      LIVE NOW
                    </div>
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📈</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                      Machine Learning
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Regression, Classification & More
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded font-semibold">
                        Available ✓
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* AI Module */}
              <Link href="/ai" className="group">
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                      AI
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Search, Game Theory & More
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Bottom Tagline */}
            <p className="mt-12 text-sm text-gray-500 dark:text-gray-400 font-medium">
              Free • Open Source • Built for Developers
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
