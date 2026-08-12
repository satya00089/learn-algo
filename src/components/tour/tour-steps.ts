import type { Alignment, Side } from 'driver.js'
import type { TourDomain, TourMode, TourRoute } from './tour-state'

export interface TourStepDefinition {
  id: string
  element?: string | (() => Element | null)
  title: string
  description: string
  side?: Side
  align?: Alignment
  nextPath?: '/ml' | '/ml/linear-regression'
}

function buttonContaining(label: string) {
  return () =>
    [...document.querySelectorAll('button')].find((button) =>
      button.textContent?.toLowerCase().includes(label.toLowerCase())
    ) ?? null
}

function playbackControls() {
  const explicit = document.querySelector('[data-tour="playground-controls"]')
  if (explicit) return explicit

  const playControl =
    document.querySelector('[role="tooltip"][aria-label="Play"]') ??
    document.querySelector('[role="tooltip"][aria-label="Play Animation"]') ??
    document.querySelector('[aria-label="Play/Pause Animation"]')

  return playControl?.closest('.bg-white, .dark\\:bg-gray-800') ?? playControl
}

function visualization() {
  return (
    document.querySelector('[data-tour="playground-visualization"]') ??
    document.querySelector('canvas')
  )
}

function catalogName(domain?: TourDomain) {
  if (domain === 'dsa') return 'Data Structures & Algorithms'
  if (domain === 'ai') return 'Artificial Intelligence'
  return 'Machine Learning'
}

const completionStep: TourStepDefinition = {
  id: 'complete',
  title: "You're ready to explore",
  description:
    'Experiment freely—reset buttons make it easy to try again. Use the Tour button whenever you want a refresher.',
}

function homeSteps(): TourStepDefinition[] {
  return [
    {
      id: 'home-welcome',
      title: 'Welcome to Learn Algo',
      description:
        'Learn algorithms by controlling each step and watching the visualization respond in real time.',
    },
    {
      id: 'home-hero',
      element: '[data-tour="home-hero"]',
      title: 'Learn by doing',
      description:
        'Every playground lets you play, pause, step forward, adjust inputs, and inspect what changed.',
      side: 'bottom',
    },
    {
      id: 'home-demo',
      element: '[data-tour="home-demo"]',
      title: 'Try the controls',
      description: 'This preview uses the same playback ideas you will find throughout the site.',
      side: 'left',
      align: 'center',
    },
    {
      id: 'home-modules',
      element: '[data-tour="home-modules"]',
      title: 'Choose a learning path',
      description:
        'Browse DSA, Machine Learning, or AI. We will use Linear Regression to show you a complete playground.',
      side: 'top',
      align: 'center',
      nextPath: '/ml',
    },
  ]
}

function catalogSteps(route: TourRoute, mode: TourMode): TourStepDefinition[] {
  const domain = route.domain ?? 'ml'
  const steps: TourStepDefinition[] = [
    {
      id: `${domain}-catalog-intro`,
      element: '[data-tour="catalog-header"]',
      title: catalogName(domain),
      description:
        'Use the catalog to compare topics, difficulty, and category before opening a visualization.',
      side: 'bottom',
    },
    {
      id: `${domain}-catalog-navigation`,
      element: '[data-tour="catalog-back"]',
      title: 'You can always find your way back',
      description:
        'Return home to switch domains, or use the theme control beside this navigation.',
      side: 'bottom',
    },
    {
      id: `${domain}-catalog-grid`,
      element: '[data-tour="catalog-grid"]',
      title: 'Pick an interactive topic',
      description:
        'Each available card opens a hands-on playground; “Soon” cards are not active yet.',
      side: 'top',
    },
  ]

  if (mode === 'full' && domain === 'ml') {
    steps.push({
      id: 'ml-linear-regression-card',
      element: '[data-tour="linear-regression-card"]',
      title: 'Open Linear Regression',
      description:
        'Next, we will use this playground to learn the controls shared across the site.',
      side: 'left',
      align: 'center',
      nextPath: '/ml/linear-regression',
    })
  } else {
    steps.push(completionStep)
  }

  return steps
}

function playgroundSteps(): TourStepDefinition[] {
  return [
    {
      id: 'playground-navigation',
      element: '[data-tour="playground-breadcrumbs"]',
      title: 'Navigate without losing your place',
      description: 'Breadcrumbs take you back to Home or the current learning catalog.',
      side: 'bottom',
    },
    {
      id: 'playground-theory',
      element: buttonContaining('How It Works'),
      title: 'Understand the theory',
      description: 'Open the explanation for intuition, complexity, formulas, and code examples.',
      side: 'bottom',
      align: 'end',
    },
    {
      id: 'playground-controls',
      element: playbackControls,
      title: 'Control the execution',
      description:
        'Play continuously, move one step at a time, run to the end, or reset the model.',
      side: 'bottom',
    },
    {
      id: 'playground-parameters',
      element: '[data-tour="playground-parameters"]',
      title: 'Change the experiment',
      description: 'Adjust inputs and model settings, then rerun to see how the behavior changes.',
      side: 'bottom',
    },
    {
      id: 'playground-visualization',
      element: visualization,
      title: 'Watch each decision happen',
      description:
        'The main workspace updates as the algorithm advances so you can connect cause and effect.',
      side: 'top',
      align: 'center',
    },
    {
      id: 'playground-insights',
      element: '[data-tour="playground-insights"]',
      title: 'Read the result',
      description:
        'Use metrics, status, and step details to understand what the visualization is showing.',
      side: 'left',
      align: 'start',
    },
    {
      id: 'playground-related',
      element: () =>
        document.querySelector('[data-tour="playground-related"]') ??
        document.querySelector('[aria-label="Toggle related algorithms"]'),
      title: 'Keep learning',
      description: 'Related algorithms make it easy to continue with a connected concept.',
      side: 'top',
      align: 'end',
    },
    completionStep,
  ]
}

export function getTourSteps(route: TourRoute, mode: TourMode): TourStepDefinition[] {
  if (route.kind === 'home') return homeSteps()
  if (route.kind === 'catalog') return catalogSteps(route, mode)
  if (route.kind === 'playground') return playgroundSteps()
  return []
}
