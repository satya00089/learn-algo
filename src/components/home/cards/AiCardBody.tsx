'use client'

import Image from 'next/image'

import { AiIcon } from '../icons/AiIcon'

export function AiCardBody({ hovered }: Readonly<{ hovered: boolean }>) {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_45%)]" />

      <div className="pointer-events-none absolute -top-4 -right-4 w-[80%] max-w-[960px] h-[72%] opacity-75 dark:opacity-28">
        <Image
          src="/icons/ai/ai-bg.png"
          alt=""
          fill
          sizes="960px"
          className="object-contain object-[right_top] brightness-90 contrast-125"
          style={{
            WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 8%, black 100%)',
            maskImage: 'linear-gradient(to left, transparent 0%, black 8%, black 100%)',
          }}
        />
      </div>

      <div className="relative z-10 p-7 flex-1 flex flex-col">
        <div className="mb-5">
          <AiIcon hovered={hovered} />
        </div>
        <h3 className="text-xl uppercase tracking-widest font-bold text-orange-500 mb-2">Artificial Intelligence</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
          Search algorithms, game trees, and intelligent agents — see how AI reasons through
          decision spaces.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Search', 'Game Trees', 'Planning'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          Growing collection
        </span>
        <svg
          className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
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
