'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export default function Home() {
  // Function to generate random value between 16 and 36
  const getRandomSize = () => {
    return Math.floor(Math.random() * (36 - 16 + 1)) + 16;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        {/* Left Decorative Pattern Column */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 border-r border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]"></div>

        {/* Right Decorative Pattern Column */}
        <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-16 border-l border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]"></div>

        {/* Content Container */}
        <div className="relative mx-16">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(156, 163, 175, 0.15) ${getRandomSize()}px,
            rgba(156, 163, 175, 0.15) ${getRandomSize()}px
          )`,
              backgroundSize: `${getRandomSize()}px ${getRandomSize()}px`,
            }}
          />
          {/* Header */}
          <header className="relative z-10 flex justify-between items-center py-6 px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Learn Algo</span>
            </div>
            <ThemeToggle />
          </header>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Hero Section */}
          <section className="relative z-10 py-8 px-6 lg:px-8">
            <div className="">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Left Column - Content */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
                      See algorithms
                      <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        in motion
                      </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                      Interactive visualizations that transform abstract concepts into intuitive
                      understanding. Watch sorting, searching, and ML algorithms execute
                      step-by-step.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/dsa"
                      className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-900/10 dark:shadow-white/10"
                    >
                      Start Learning
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="#modules"
                      className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      View Modules
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center gap-8 pt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Free forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>15+ algorithms</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visualization Canvas */}
                <div className="lg:col-span-7">
                  <div className="relative aspect-[4/3] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                    {/* Canvas Header - Browser-like */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                        QuickSort Visualization
                      </div>
                    </div>

                    {/* Visualization Area */}
                    <div className="absolute inset-0 top-10 flex items-end justify-center gap-1.5 p-12">
                      {[
                        { h: 60, color: 'bg-blue-500', delay: 0 },
                        { h: 30, color: 'bg-blue-400', delay: 100 },
                        { h: 85, color: 'bg-purple-500', delay: 200 },
                        { h: 45, color: 'bg-blue-400', delay: 300 },
                        { h: 75, color: 'bg-purple-400', delay: 400 },
                        { h: 20, color: 'bg-blue-500', delay: 500 },
                        { h: 90, color: 'bg-purple-500', delay: 600 },
                        { h: 55, color: 'bg-blue-400', delay: 700 },
                        { h: 10, color: 'bg-blue-500', delay: 800 },
                        { h: 70, color: 'bg-purple-400', delay: 900 },
                        { h: 40, color: 'bg-blue-400', delay: 1000 },
                        { h: 65, color: 'bg-purple-500', delay: 1100 },
                      ].map((bar, idx) => (
                        <div
                          key={`bar-${idx}`}
                          className={`flex-1 ${bar.color} rounded-t transition-all duration-700 ease-in-out`}
                          style={{
                            height: `${bar.h}%`,
                            animation: 'sortBounce 3s ease-in-out infinite',
                            animationDelay: `${bar.delay}ms`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Control Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Step 7 of 24
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Running
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Social Proof / Quick Stats */}
          <section className="relative z-10 py-8 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    15+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Algorithms</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    3
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Domains</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    100%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Interactive</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    Free
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Forever</div>
                </div>
              </div>
            </div>
          </section>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Module Cards Section */}
          <section id="modules" className="relative z-10 py-8 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Choose Your Learning Path
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Explore algorithms across different domains with interactive visualizations
                </p>
              </div>

              {/* Module Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* DSA Card */}
                <Link href="/dsa" className="group">
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl">
                    <div className="p-8">
                      <div className="mb-6">
                        <Image
                          src="/icons/dsa/dsa.png"
                          alt="Data Structures & Algorithms"
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Data Structures
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Master fundamental data structures and algorithms through step-by-step
                        interactive visualization
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Sorting
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Trees
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Graphs
                        </span>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Available now
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* ML Card */}
                <Link href="/ml" className="group">
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl">
                    <div className="p-8">
                      <div className="mb-6">
                        <Image
                          src="/icons/ml/ml.png"
                          alt="Machine Learning"
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Machine Learning
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Explore ML algorithms with hands-on experimentation and real-time visual
                        feedback
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Regression
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Classification
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Clustering
                        </span>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Available now
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* AI Card */}
                <Link href="/ai" className="group">
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700">
                    <div className="p-8">
                      <div className="mb-6">
                        <Image
                          src="/icons/ai/ai.png"
                          alt="Artificial Intelligence"
                          width={64}
                          height={56}
                          className="object-contain dark:invert dark:drop-shadow-[0_0_8px_rgba(156,163,175,0.8)]"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Artificial Intelligence
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Explore AI concepts, search algorithms, and intelligent agent systems
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Search
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Games
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          Planning
                        </span>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Coming soon
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                      <span className="text-white dark:text-gray-900 font-bold text-sm">LA</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      learn-algo
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interactive algorithm visualizations for developers and learners
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Explore</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <Link
                        href="/dsa"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Data Structures
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ml"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Machine Learning
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ai"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Artificial Intelligence
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">About</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Free & Open Source • MIT License
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Built for developers, by developers
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
