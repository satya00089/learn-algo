'use client'

import Image from 'next/image'

import { DsaIcon } from '../icons/DsaIcon'

export function DsaCardBody({ hovered }: Readonly<{ hovered: boolean }>) {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_45%)]" />

      <div className="pointer-events-none absolute top-0 right-0 w-[64%] max-w-[960px] h-[72%] opacity-30 dark:opacity-25">
        <Image
          src="/icons/dsa/dsa-bg.png"
          alt=""
          fill
          sizes="960px"
          className="object-fill object-right opacity-35 dark:opacity-30"
          style={{
            WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 28%, black 100%)',
            maskImage: 'linear-gradient(to left, transparent 0%, black 28%, black 100%)',
          }}
        />
      </div>

      <div className="relative z-10 p-7 flex-1 flex flex-col">
        <div className="mb-5">
          <DsaIcon hovered={hovered} />
        </div>
        <h3 className="text-xl uppercase tracking-widest font-bold text-orange-500 mb-2">
          Data Structures & Algorithms
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
          Sorting, searching, trees, stacks, queues — every step visualized with full interactive
          control.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Sorting', 'Trees', 'Searching', 'Recursion'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative z-10 px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">14 algorithms</span>
        <svg
          className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  )
}
