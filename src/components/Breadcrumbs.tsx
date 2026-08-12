'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'HOME', href: '/' }]

    let currentPath = ''
    paths.forEach((path) => {
      currentPath += `/${path}`
      const label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .toUpperCase()

      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  // Remove the last breadcrumb since the title already shows it
  const displayBreadcrumbs = breadcrumbs.slice(0, -1)

  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://www.learn-algo.com${crumb.href}`,
    })),
  }

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <nav aria-label="Breadcrumb" data-tour="playground-breadcrumbs">
        <ol className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          {displayBreadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <Link
                href={crumb.href}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {crumb.label}
              </Link>
            </li>
          ))}
          <li>
            <span className="mx-2">/</span>
          </li>
        </ol>
      </nav>
    </>
  )
}
