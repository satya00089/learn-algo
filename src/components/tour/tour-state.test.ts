import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyTourRoute,
  createTourContinuation,
  getTourStatus,
  parseTourContinuation,
  parseTourSeenState,
  updateTourStatus,
} from './tour-state.ts'

test('classifies home, catalogs, playgrounds, and unsupported routes', () => {
  assert.deepEqual(classifyTourRoute('/'), { kind: 'home' })
  assert.deepEqual(classifyTourRoute('/ml/'), { kind: 'catalog', domain: 'ml' })
  assert.deepEqual(classifyTourRoute('/dsa/bubble-sort'), {
    kind: 'playground',
    domain: 'dsa',
  })
  assert.deepEqual(classifyTourRoute('/privacy'), { kind: 'unsupported' })
  assert.deepEqual(classifyTourRoute('/ml/linear-regression/details'), { kind: 'unsupported' })
})

test('stores completion independently for every catalog and playground', () => {
  const mlSeen = updateTourStatus({}, '/ml', 'completed')
  const withDsa = updateTourStatus(mlSeen, '/dsa/', 'dismissed')
  const withPlayground = updateTourStatus(withDsa, '/ml/linear-regression', 'completed')

  assert.equal(getTourStatus(withPlayground, '/ml'), 'completed')
  assert.equal(getTourStatus(withPlayground, '/dsa'), 'dismissed')
  assert.equal(getTourStatus(withPlayground, '/ml/linear-regression'), 'completed')
  assert.equal(getTourStatus(withPlayground, '/ml/k-means'), null)
})

test('parses valid route statuses and ignores malformed entries', () => {
  assert.deepEqual(
    parseTourSeenState(JSON.stringify({ '/': 'completed', '/ml': 'dismissed', '/dsa': 'started' })),
    { '/': 'completed', '/ml': 'dismissed' }
  )
  assert.deepEqual(parseTourSeenState('completed'), {})
  assert.deepEqual(parseTourSeenState('{bad-json'), {})
  assert.deepEqual(parseTourSeenState(null), {})
})

test('round-trips valid continuations and rejects malformed state', () => {
  const continuation = createTourContinuation('/ml', 123)
  assert.deepEqual(parseTourContinuation(JSON.stringify(continuation)), continuation)
  assert.equal(parseTourContinuation('{bad-json'), null)
  assert.equal(
    parseTourContinuation(JSON.stringify({ mode: 'contextual', targetPath: '/ml', createdAt: 1 })),
    null
  )
  assert.equal(
    parseTourContinuation(JSON.stringify({ mode: 'full', targetPath: '/dsa', createdAt: 1 })),
    null
  )
})
