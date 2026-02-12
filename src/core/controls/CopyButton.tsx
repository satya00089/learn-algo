'use client'

import { useState } from 'react'
import { FaCopy, FaCheck } from 'react-icons/fa'
import { Button } from './Button'

interface CopyButtonProps {
  content: string
  onCopy?: (content: string) => boolean | undefined
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
}

export function CopyButton({
  content,
  onCopy,
  className,
  size = 'sm',
  variant = 'outline'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    // Allow onCopy callback to prevent copy if it returns false
    if (onCopy && onCopy(content) === false) {
      return
    }

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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