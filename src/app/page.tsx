'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export default function Home() {
  const [patternValues, setPatternValues] = useState({ size1: 25, size2: 28, bgSize: 30 })

  useEffect(() => {
    // Generate random values only on client side to avoid hydration mismatch
    const getRandomSize = () => Math.floor(Math.random() * (36 - 16 + 1)) + 16
    setPatternValues({
      size1: getRandomSize(),
      size2: getRandomSize(),
      bgSize: getRandomSize(),
    })
  }, [])

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
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none [--bg-pattern:theme(colors.gray.400/0.25)] dark:[--bg-pattern:theme(colors.white/0.2)]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                var(--bg-pattern) ${patternValues.size1}px,
                var(--bg-pattern) ${patternValues.size2}px
              )`,
              backgroundSize: `${patternValues.bgSize}px ${patternValues.bgSize}px`,
            }}
          />
          {/* Header */}
          <header className="relative z-10 flex justify-between items-center py-6 px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo/logo.png"
                alt="Learn Algo Logo"
                width={64}
                height={64}
                className="rounded-lg dark:invert"
                apple-mobile-web-app-capable
              />
              <div className="space-y-1">
                <div className="bg-clip-text text-3xl font-black tracking-tight">LEARN ALGO</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                    DSA
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                    AI
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    ML
                  </span>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Hero Section */}
          <section className="relative z-10 py-8 px-6 lg:px-8">
            <div className="">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Left Column - Content */}
                <div className="lg:col-span-6 space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Master algorithms{' '}
                      <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        visually
                      </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                      Interactive, step-by-step visualizations of sorting, searching, and ML
                      algorithms.{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        See every step
                      </span>{' '}
                      with full control — play, pause, adjust speed, and explore different
                      scenarios.
                    </p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Build deep intuition through visualization. From confused to confident.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/dsa"
                      className="group inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/10 hover:shadow-xl hover:scale-105"
                      onClick={() => {
                        if (globalThis.window !== undefined && (globalThis as any).gtag) {
                          ;(globalThis as any).gtag('event', 'click', {
                            event_category: 'CTA',
                            event_label: 'Start Learning - Hero',
                          })
                        }
                      }}
                    >
                      Start Your First Algorithm
                      <svg
                        className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                      Explore All Modules
                    </Link>
                  </div>

                  {/* Scroll Indicator */}
                  <div className="flex justify-center pt-8">
                    <a
                      href="#how-it-works"
                      className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors animate-bounce"
                    >
                      <span>Scroll to explore</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
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
                      <span>20+ algorithms</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visualization Canvas */}
                <div className="lg:col-span-6">
                  <div className="relative aspect-[4/3] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden group hover:shadow-3xl transition-shadow">
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
                      ].map((bar) => (
                        <div
                          key={`bar-${bar.delay}`}
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

          {/* How It Works Section */}
          <section id="how-it-works" className="relative z-10 py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Three simple steps to visualize and master any algorithm
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg group">
                  <div className="mt-6">
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-purple-500 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Choose Your Algorithm
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Select from 20+ algorithms across DSA, ML, and AI. Generate random datasets,
                      adjust parameters, and explore different scenarios interactively.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group">
                  <div className="mt-6">
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Think Through Each Step
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      See every step animated in real-time. Pause, step through, adjust speed, and
                      modify parameters on the fly to understand how algorithms work.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-lg group">
                  <div className="mt-6">
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-green-500 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Build Deep Understanding
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Master algorithms through visualization. Understand time complexity, space
                      trade-offs, and real-world applications with interactive controls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Who It's For Section */}
          <section className="relative z-10 py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfect For Everyone
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Whether you&apos;re starting out or leveling up, LEARN ALGO adapts to your journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Students */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    CS Students
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ace your data structures and algorithms courses with visual understanding
                  </p>
                </div>

                {/* Self-taught */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Self-Taught Devs
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fill knowledge gaps and build confidence in fundamental concepts
                  </p>
                </div>

                {/* Interview Prep */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Interview Prep
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Master FAANG-level algorithm questions with deep visual intuition
                  </p>
                </div>

                {/* Educators */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Educators
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enhance lessons with engaging visualizations that students love
                  </p>
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
                    20+
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

          {/* What Makes Us Different Section */}
          <section className="relative z-10 py-16 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Learners Choose LEARN ALGO
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Interactive, real-time visualizations that help you{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">see</span> how
                  algorithms work step-by-step
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Feature 1 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Real-Time Step Visualization
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Watch every comparison, swap, and operation as it happens. See the
                        algorithm&apos;s logic unfold with color-coded highlights and animated
                        transitions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Full Interactive Control
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Play, pause, step forward/backward, and adjust speed. Change array sizes,
                        modify parameters, and generate random data to explore different scenarios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Multiple Algorithms & Domains
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Explore 20+ algorithms across Data Structures (sorting, searching, trees),
                        Machine Learning (regression, clustering), and AI concepts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Debug Mode & Insights
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Enable debug mode to see detailed information about each step. Track
                        comparisons, swaps, and understand why the algorithm makes each decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Free, interactive, and powerful
                  </span>{' '}
                  — explore 20+ algorithms with full control
                </p>
                <Link
                  href="/dsa"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Start Visualizing
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
                <Link
                  href="/dsa"
                  className="group"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'click', {
                        event_category: 'Module Card',
                        event_label: 'DSA',
                      })
                    }
                  }}
                >
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
                <Link
                  href="/ml"
                  className="group"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'click', {
                        event_category: 'Module Card',
                        event_label: 'ML',
                      })
                    }
                  }}
                >
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

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* FAQ Section */}
          <section className="relative z-10 py-16 px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Everything you need to know about LEARN ALGO
                </p>
              </div>

              <div className="space-y-4">
                {/* FAQ 1 */}
                <details className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Do I need programming experience to use LEARN ALGO?
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    No! LEARN ALGO is designed for all skill levels. While basic programming
                    knowledge helps, our visualizations make algorithms intuitive even for
                    beginners. Each algorithm includes explanations and you can learn by watching
                    and experimenting.
                  </div>
                </details>

                {/* FAQ 2 */}
                <details className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Are new algorithms added regularly?
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    Yes! We&apos;re constantly expanding our library. Currently, we have 20+
                    algorithms across DSA and ML domains, with AI algorithms coming soon. We
                    prioritize adding algorithms based on user requests and educational value.
                  </div>
                </details>

                {/* FAQ 3 */}
                <details className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      How long does it take to learn an algorithm?
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    Most users gain a solid understanding of an algorithm in 15-30 minutes through
                    our interactive visualizations. For deeper mastery, we recommend spending 1-2
                    hours experimenting with different parameters, datasets, and edge cases.
                  </div>
                </details>

                {/* FAQ 4 */}
                <details className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Can I use this for interview preparation?
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    Absolutely! LEARN ALGO is perfect for technical interview prep. Our
                    visualizations help you build the intuition needed to solve algorithm problems
                    in interviews. Many users report improved performance on coding challenges after
                    using our platform.
                  </div>
                </details>

                {/* FAQ 5 */}
                <details className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      What makes LEARN ALGO different from other resources?
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    LEARN ALGO provides fully interactive, real-time visualizations with complete
                    control. You can play, pause, step forward/backward, adjust animation speed,
                    modify parameters like array size, and generate random data to explore different
                    scenarios. Our focus is on helping you build intuition through visual
                    understanding by seeing every step of the algorithm as it executes.
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Image
                      src="/logo/logo.png"
                      alt="Learn Algo Logo"
                      width={128}
                      height={128}
                      className="rounded-lg dark:invert"
                    />
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div className="bg-clip-text text-4xl font-black tracking-tight">
                          LEARN ALGO
                        </div>
                        <div className="flex items-center gap-3 text-xl font-semibold text-gray-700 dark:text-gray-300">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold">
                            DSA
                          </span>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                            AI
                          </span>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                            ML
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Interactive algorithm visualizations for developers and learners
                      </p>
                    </div>
                  </div>
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
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Free & Open Source</li>
                    <li>Built for developers, by developers</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>&copy; 2025 LEARN ALGO. All rights reserved.</p>
                  <div className="flex gap-6">
                    <Link
                      href="/privacy"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="/contact"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
