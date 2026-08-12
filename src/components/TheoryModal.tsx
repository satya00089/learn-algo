'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { GiBookCover } from 'react-icons/gi'
import { CodeTabs } from './CodeTabs'

interface TheoryModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly theoryFile: string
  readonly title: string
}

// Helper function to detect if a line is a tab header
// Expected format: # Tab: Tab Name
function isTabHeader(line: string): boolean {
  const trimmed = line.trim()
  return /^#\s*Tab:\s+.+$/.test(trimmed)
}

// Extract tab name from header line
function extractTabName(line: string): string {
  const match = line.trim().match(/^#\s*Tab:\s+(.+)$/)
  return match ? match[1].trim() : ''
}

export function TheoryModal({ isOpen, onClose, theoryFile, title }: TheoryModalProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  // Focus the panel on open, and trap Tab within it while open
  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && theoryFile) {
      setLoading(true)
      setError(null)

      fetch(theoryFile)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load theory content: ${response.status}`)
          }
          return response.text()
        })
        .then((text) => {
          setContent(text)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [isOpen, theoryFile])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className="glass-surface bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/80 dark:border-gray-700/80"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <GiBookCover className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none transition active:scale-90"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
              {loading && (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-600 dark:text-gray-300">Loading theory content...</div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                  <div className="text-red-800 dark:text-red-200 font-medium">
                    Error loading theory content
                  </div>
                  <div className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</div>
                </div>
              )}

              {!loading && !error && content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>
                      ),
                      ul: ({ children }) => <ul className="mb-4 space-y-1">{children}</ul>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      code: ({ children, className, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const language = match ? match[1] : ''

                        // Check if this is a code tabs block
                        // Expected format: # Tab: Tab Name
                        if (typeof children === 'string' && children.includes('# Tab:')) {
                          const lines = children.trim().split('\n')

                          const codes: Record<string, string> = {}
                          let currentKey = ''
                          let currentCode: string[] = []
                          let hasContentBeforeFirstTab = false

                          lines.forEach((line) => {
                            if (isTabHeader(line)) {
                              // If there's content before the first tab, save it as a default tab
                              if (hasContentBeforeFirstTab && currentCode.length > 0) {
                                codes['Code'] = currentCode.join('\n').trim()
                                currentCode = []
                                hasContentBeforeFirstTab = false
                              }

                              // Save previous code block
                              if (currentKey && currentCode.length > 0) {
                                codes[currentKey] = currentCode.join('\n').trim()
                              }

                              // Start new code block
                              currentKey = extractTabName(line)
                              currentCode = []
                            } else {
                              if (!currentKey) {
                                hasContentBeforeFirstTab = true
                              }
                              currentCode.push(line)
                            }
                          })

                          // Save last code block
                          if (currentKey && currentCode.length > 0) {
                            codes[currentKey] = currentCode.join('\n').trim()
                          } else if (hasContentBeforeFirstTab && currentCode.length > 0) {
                            codes['Code'] = currentCode.join('\n').trim()
                          }

                          // Need at least 2 tabs to create tabs
                          if (Object.keys(codes).length >= 2) {
                            return (
                              <div className="my-6 not-prose">
                                <CodeTabs codes={codes} lang={language || 'python'} />
                              </div>
                            )
                          }
                        }

                        // Regular code block
                        if (className) {
                          return (
                            <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto my-4 shadow-sm">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          )
                        }

                        // Inline code
                        return (
                          <code
                            className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700"
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      },
                      table: ({ children }) => (
                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 mb-4">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>
                      ),
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => (
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition active:scale-[0.97]"
              >
                Start Exploring →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
