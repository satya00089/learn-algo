'use client'

import { useEffect, useState } from 'react'
import { FaCheck, FaShareAlt } from 'react-icons/fa'
import { Button } from './Button'

interface ShareButtonProps {
  readonly className?: string
  readonly size?: 'sm' | 'md' | 'lg'
  readonly variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  readonly title?: string
}

export function ShareButton({
  className,
  size = 'sm',
  variant = 'outline',
  title = 'Copy share link',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  const handleClick = async () => {
    if (typeof window === 'undefined') return

    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy share link:', error)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      title={copied ? 'Link copied!' : title}
      aria-label={title}
    >
      {copied ? <FaCheck size={12} /> : <FaShareAlt size={12} />}
    </Button>
  )
}
