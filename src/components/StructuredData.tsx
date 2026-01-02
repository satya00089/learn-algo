import Script from 'next/script'

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'LEARN ALGO',
    url: 'https://www.learn-algo.com',
    logo: 'https://www.learn-algo.com/logo/logo.png',
    description:
      'Interactive algorithm visualizations for Data Structures, Machine Learning, and Artificial Intelligence',
    educationalLevel: ['Beginner', 'Intermediate', 'Advanced'],
    sameAs: ['https://github.com/satya00089/learn-algo'],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LEARN ALGO',
    url: 'https://www.learn-algo.com',
    description: 'Master algorithms through interactive visualizations',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.learn-algo.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LEARN ALGO',
    url: 'https://www.learn-algo.com',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Algorithm Visualization Course',
    description:
      'Learn algorithms through interactive visualizations across DSA, ML, and AI domains',
    provider: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: 'https://www.learn-algo.com',
    },
    educationalLevel: 'Beginner to Advanced',
    coursePrerequisites: 'Basic programming knowledge recommended',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        name: 'Data Structures & Algorithms',
        url: 'https://www.learn-algo.com/dsa',
      },
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        name: 'Machine Learning Algorithms',
        url: 'https://www.learn-algo.com/ml',
      },
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        name: 'Artificial Intelligence',
        url: 'https://www.learn-algo.com/ai',
      },
    ],
  }

  return (
    <>
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="schema-web-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <Script
        id="schema-course"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
    </>
  )
}
