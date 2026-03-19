'use client'

import { MlIcon } from '../icons/MlIcon'

export function MlCardBody({ hovered }: Readonly<{ hovered: boolean }>) {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      <div className="p-7 flex-1 flex flex-col">
        <div className="mb-5">
          <MlIcon hovered={hovered} />
        </div>
        <h3 className="text-xl font-bold text-orange-500 mb-2">Machine Learning</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
          Regression, clustering, classification — adjust parameters and watch the model adapt in
          real time.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Regression', 'Clustering', 'Classification', 'Dimensionality'].map((tag) => (
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
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">18 algorithms</span>
        <svg
          className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
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
