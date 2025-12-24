import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn about how LEARN ALGO collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
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
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Last updated: December 24, 2025
              </p>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                {/* Introduction */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    Welcome to LEARN ALGO (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We
                    are committed to protecting your privacy and ensuring you have a positive
                    experience on our website. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you visit our website.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    By using LEARN ALGO, you agree to the collection and use of information in
                    accordance with this policy. If you do not agree with our policies and
                    practices, please do not use our services.
                  </p>
                </section>

                {/* Information We Collect */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    2. Information We Collect
                  </h2>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    2.1 Automatically Collected Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    When you visit LEARN ALGO, we automatically collect certain information about
                    your device, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Device type (mobile, tablet, desktop)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    2.2 Analytics Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    We use Google Analytics to understand how visitors use our site. Google
                    Analytics collects information such as how often users visit the site, what
                    pages they visit, and what other sites they used prior to coming to our site. We
                    use this information to improve our website and services.
                  </p>
                </section>

                {/* How We Use Your Information */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Improve and optimize our website performance</li>
                    <li>Understand how users interact with our content</li>
                    <li>Analyze usage patterns and trends</li>
                    <li>Fix bugs and technical issues</li>
                    <li>Develop new features and content</li>
                    <li>Monitor and prevent security issues</li>
                  </ul>
                </section>

                {/* Cookies */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    4. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    We use cookies and similar tracking technologies to track activity on our
                    website. Cookies are small data files stored on your device. You can instruct
                    your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    <strong>Types of cookies we use:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>
                      <strong>Essential Cookies:</strong> Required for the website to function
                      properly
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> Help us understand how visitors use our
                      website (Google Analytics)
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> Remember your settings like dark mode
                      preference
                    </li>
                  </ul>
                </section>

                {/* Data Sharing */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    5. Data Sharing and Disclosure
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We
                    may share generic aggregated demographic information not linked to any personal
                    identification information with our partners and advertisers.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We use Google Analytics, a third-party service. Google&apos;s ability to use and
                    share information collected is restricted by the Google Analytics Terms of
                    Service and Google Privacy Policy.
                  </p>
                </section>

                {/* Data Security */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    6. Data Security
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We implement appropriate technical and organizational security measures to
                    protect your information. However, no method of transmission over the internet
                    or electronic storage is 100% secure. While we strive to use commercially
                    acceptable means to protect your data, we cannot guarantee its absolute
                    security.
                  </p>
                </section>

                {/* Your Rights */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    7. Your Rights
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing of your data</li>
                    <li>Opt-out of analytics tracking</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To opt-out of Google Analytics, you can install the{' '}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Google Analytics Opt-out Browser Add-on
                    </a>
                    .
                  </p>
                </section>

                {/* Children's Privacy */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    8. Children&apos;s Privacy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Our service is available to users of all ages. We do not knowingly collect
                    personal information from children under 13 without parental consent. If you are
                    a parent or guardian and believe your child has provided us with personal
                    information, please contact us.
                  </p>
                </section>

                {/* Changes to Policy */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    9. Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We may update our Privacy Policy from time to time. We will notify you of any
                    changes by posting the new Privacy Policy on this page and updating the
                    &quot;Last updated&quot; date at the top of this policy. You are advised to
                    review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                {/* Contact */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    10. Contact Us
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> privacy@learn-algo.com
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>GitHub:</strong>{' '}
                      <a
                        href="https://github.com/satya00089/learn-algo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        github.com/satya00089/learn-algo
                      </a>
                    </p>
                  </div>
                </section>
              </div>

              {/* Back Button */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
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
      </div>
    </main>
  )
}
