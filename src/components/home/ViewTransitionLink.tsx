'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function ViewTransitionLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: React.ComponentProps<typeof Link>) {
  const router = useRouter()
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (!doc.startViewTransition) return
    e.preventDefault()
    doc.startViewTransition(() => {
      router.push(href as string)
    })
  }
  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
