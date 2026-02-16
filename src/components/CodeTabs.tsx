'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { useTheme } from '@/core/theme'
import { cn } from '@/core/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/controls/Tabs'
import { CopyButton } from '@/core/controls/CopyButton'

type CodeTabsProps = {
  codes: Record<string, string>
  lang?: string
  copyButton?: boolean
  /** Called when copy is attempted. Return false to prevent copy action. */
  onCopy?: (content: string) => undefined | boolean
  className?: string
}

/**
 * Memoized syntax highlighting component
 */
const SyntaxHighlightedCode = memo(function SyntaxHighlightedCode({
  code,
  lang,
  theme,
}: {
  code: string
  lang: string
  theme: 'light' | 'dark'
}) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function highlightCode() {
      try {
        const { codeToHtml } = await import('shiki')
        const html = await codeToHtml(code, {
          lang,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: theme === 'dark' ? 'dark' : 'light',
        })

        if (!cancelled) {
          requestAnimationFrame(() => {
            setHighlightedCode(html)
            setIsLoading(false)
          })
        }
      } catch (error) {
        console.error('Error highlighting code:', error)
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    const rafId = requestAnimationFrame(() => {
      highlightCode()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [code, lang, theme])

  if (isLoading || !highlightedCode) {
    return (
      <pre className="text-gray-800 dark:text-gray-200">
        <code>{code}</code>
      </pre>
    )
  }

  return <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
})

/**
 * CodeTabs component for displaying syntax-highlighted code with tabs
 * Optimized for performance with memoization and lazy loading
 */
const CodeTabs = memo(function CodeTabs({
  codes,
  lang = 'python',
  className,
  copyButton = true,
  onCopy,
}: CodeTabsProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<string>('')

  // Initialize or realign active tab when codes change
  useEffect(() => {
    const keys = Object.keys(codes)
    const firstKey = keys[0]
    if (!firstKey) return
    setActiveTab((prev) => (prev && codes[prev] ? prev : firstKey))
  }, [codes])

  // Memoize code keys and entries for performance
  const codeKeys = useMemo(() => Object.keys(codes), [codes])
  const codeEntries = useMemo(() => Object.entries(codes), [codes])

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn(
        'w-full gap-0 bg-inherit rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm',
        className
      )}
    >
      <TabsList className="w-full relative justify-between rounded-none h-12 bg-inherit border-b border-gray-200 dark:border-gray-700 text-current py-0 pl-0 pr-5">
        <div className="flex h-full">
          {codeKeys.map((code) => (
            <TabsTrigger
              key={code}
              value={code}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-all',
                'text-gray-600 dark:text-gray-400',
                'hover:text-gray-900 dark:hover:text-gray-100',
                'data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400',
                // Active underline effect
                "after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0",
                'after:bg-transparent after:rounded-t-full after:transition-colors',
                'data-[state=active]:after:bg-indigo-600 dark:data-[state=active]:after:bg-indigo-400'
              )}
            >
              {code}
            </TabsTrigger>
          ))}
        </div>

        {copyButton && activeTab && (
          <CopyButton
            content={codes[activeTab]}
            onCopy={onCopy}
            variant="ghost"
            size="sm"
            className="-me-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          />
        )}
      </TabsList>

      <div className="bg-inherit">
        {codeEntries.map(([key, code]) => (
          <TabsContent
            key={key}
            value={key}
            className="w-full text-sm flex items-start overflow-auto max-h-[600px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            <div className="w-full [&>pre]:m-0 [&>pre]:p-0 [&>pre]:bg-transparent! [&>pre]:border-none [&>pre]:text-[13.5px] [&>pre]:leading-[1.6] [&_code]:text-[13.5px] [&_code]:leading-[1.6] [&_code]:bg-transparent! [&_.shiki]:bg-transparent! [&>pre]:font-mono">
              <SyntaxHighlightedCode code={code} lang={lang} theme={theme} />
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
})

export { CodeTabs }
