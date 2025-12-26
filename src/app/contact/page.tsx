import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the LEARN ALGO team. We&apos;d love to hear from you!',
}

export default function Contact() {
  // Function to generate random value between 16 and 36
  const getRandomSize = () => {
    return Math.floor(Math.random() * (36 - 16 + 1)) + 16
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        {/* Left Decorative Pattern Column */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 border-r border-gray-200 dark:border-gray-800 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]"></div>

        {/* Right Decorative Pattern Column */}
        <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-16 border-l border-gray-200 dark:border-gray-800 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]"></div>

        {/* Content Container */}
        <div className="relative lg:mx-16">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none [--bg-pattern:theme(colors.gray.400/0.25)] dark:[--bg-pattern:theme(colors.white/0.2)]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                var(--bg-pattern) ${getRandomSize()}px,
                var(--bg-pattern) ${getRandomSize()}px
              )`,
              backgroundSize: `${getRandomSize()}px ${getRandomSize()}px`,
            }}
          />

          {/* Header */}
          <header className="relative z-10 flex justify-between items-center py-6 px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo/logo.png"
                  alt="Learn Algo Logo"
                  width={64}
                  height={64}
                  className="rounded-lg dark:invert"
                  priority
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
              </Link>
            </div>
            <ThemeToggle />
          </header>

          <div className="col-span-full col-start-2 row-start-4 h-px bg-gray-950/5 dark:bg-white/10"></div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Have questions, feedback, or suggestions? We&apos;d love to hear from you!
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              {/* GitHub */}
              <a
                href="https://github.com/satya00089/learn-algo"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">GitHub</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      The best way to reach us! Report bugs, request features, or contribute to the
                      project
                    </p>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                      <span>Visit Repository</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                </div>
              </a>
            </div>

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                What can we help you with?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bug Reports */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Bug Reports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Found an issue? Open an issue on GitHub with details and we&apos;ll
                      investigate.
                    </p>
                  </div>
                </div>

                {/* Feature Requests */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Feature Requests
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Have an idea for a new algorithm or feature? We&apos;d love to hear it!
                    </p>
                  </div>
                </div>

                {/* General Feedback */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      General Feedback
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Share your thoughts on how we can improve the learning experience.
                    </p>
                  </div>
                </div>

                {/* Collaboration */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
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
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Collaboration
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Interested in contributing or partnering? Let&apos;s discuss opportunities.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Before reaching out, you might find your answer in our FAQ section.
                </p>
                <Link
                  href="/#faq"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <span>View FAQ</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Response Time */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 We typically respond within 24-48 hours
              </p>
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
