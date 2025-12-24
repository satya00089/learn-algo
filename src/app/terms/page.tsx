import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using LEARN ALGO interactive algorithm visualizations.',
}

export default function TermsOfService() {
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
                Terms of Service
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Last updated: December 24, 2025
              </p>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                {/* Agreement */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    1. Agreement to Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    By accessing and using LEARN ALGO (&quot;the Service&quot;), you accept and
                    agree to be bound by the terms and provision of this agreement. If you do not
                    agree to these Terms of Service, please do not use the Service.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We reserve the right to update and change these Terms of Service without notice.
                    Any new features that augment or enhance the current Service shall be subject to
                    the Terms of Service.
                  </p>
                </section>

                {/* Description of Service */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    LEARN ALGO provides interactive visualizations of algorithms in the following
                    domains:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Data Structures and Algorithms (DSA)</li>
                    <li>Machine Learning (ML)</li>
                    <li>Artificial Intelligence (AI) - Coming Soon</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    The Service is provided free of charge and is intended for educational purposes
                    only.
                  </p>
                </section>

                {/* User Obligations */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    3. User Obligations
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    By using the Service, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Use the Service for lawful purposes only</li>
                    <li>Not attempt to gain unauthorized access to any part of the Service</li>
                    <li>Not interfere with or disrupt the Service or servers</li>
                    <li>Not use automated systems or software to extract data from the Service</li>
                    <li>Not remove, alter, or obscure any copyright or proprietary notices</li>
                    <li>Not use the Service to transmit viruses or malicious code</li>
                  </ul>
                </section>

                {/* Intellectual Property */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    4. Intellectual Property Rights
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The Service and its original content, features, and functionality are owned by
                    LEARN ALGO and are protected by international copyright, trademark, patent,
                    trade secret, and other intellectual property or proprietary rights laws.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The source code for LEARN ALGO is open source and available on GitHub under the
                    MIT License. You are free to use, copy, modify, merge, publish, distribute,
                    sublicense, and/or sell copies of the software, subject to the terms of the MIT
                    License.
                  </p>
                </section>

                {/* User Content */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    5. User-Generated Content
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    Currently, LEARN ALGO does not allow users to post or share content on the
                    platform. All content is provided by LEARN ALGO. If we add user-generated
                    content features in the future, these terms will be updated accordingly.
                  </p>
                </section>

                {/* Disclaimer */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    6. Disclaimer of Warranties
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                    BASIS. LEARN ALGO MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, INCLUDING:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>That the Service will be uninterrupted or error-free</li>
                    <li>That defects will be corrected</li>
                    <li>That the Service is free of viruses or other harmful components</li>
                    <li>
                      The accuracy or reliability of any information obtained through the Service
                    </li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You use the Service at your own risk. We do not guarantee that the algorithms
                    visualized represent the most efficient or optimal implementations.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    7. Limitation of Liability
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEARN ALGO SHALL NOT BE LIABLE FOR ANY
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                    OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
                    DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    This limitation applies even if LEARN ALGO has been advised of the possibility
                    of such damages.
                  </p>
                </section>

                {/* Educational Use */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    8. Educational Use Only
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The algorithm visualizations and implementations provided by LEARN ALGO are for
                    educational purposes only. They are designed to help users understand
                    algorithmic concepts and should not be used in production environments without
                    proper review, testing, and optimization.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We make no guarantees about the correctness, completeness, or suitability of the
                    code for any particular purpose.
                  </p>
                </section>

                {/* Third-Party Services */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    9. Third-Party Services
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The Service uses third-party services, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                    <li>Google Analytics for usage analytics</li>
                    <li>Vercel for hosting (if applicable)</li>
                    <li>GitHub for source code hosting</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    These third-party services have their own Terms of Service and Privacy Policies,
                    and your use of them is subject to those terms.
                  </p>
                </section>

                {/* Termination */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    10. Termination
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We may terminate or suspend access to the Service immediately, without prior
                    notice or liability, for any reason whatsoever, including without limitation if
                    you breach the Terms. All provisions of the Terms which by their nature should
                    survive termination shall survive termination.
                  </p>
                </section>

                {/* Governing Law */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    11. Governing Law
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    These Terms shall be governed and construed in accordance with the laws of your
                    jurisdiction, without regard to its conflict of law provisions. Our failure to
                    enforce any right or provision of these Terms will not be considered a waiver of
                    those rights.
                  </p>
                </section>

                {/* Changes to Terms */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    12. Changes to Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms
                    at any time. If a revision is material, we will try to provide at least 30
                    days&apos; notice prior to any new terms taking effect. What constitutes a
                    material change will be determined at our sole discretion.
                  </p>
                </section>

                {/* Contact */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    13. Contact Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> terms@learn-algo.com
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

                {/* Acknowledgment */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    14. Acknowledgment
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE
                    AND AGREE TO BE BOUND BY THEM.
                  </p>
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
