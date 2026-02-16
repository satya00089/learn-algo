'use client'

import { useState, useRef, useEffect } from 'react'
import { FaCopy, FaCheck } from 'react-icons/fa'
import { Button } from './Button'

interface CopyButtonProps {
  readonly content: string
  readonly onCopy?: (content: string) => boolean | undefined
  readonly className?: string
  readonly size?: 'sm' | 'md' | 'lg'
  readonly variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
}

export function CopyButton({
  content,
  onCopy,
  className,
  size = 'sm',
  variant = 'outline',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    // Allow onCopy callback to prevent copy if it returns false
    if (onCopy && onCopy(content) === false) {
      return
    }

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCopied(false)
        }
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={className}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
    </Button>
  )
}
