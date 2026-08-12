/**
 * useVariancePlayground Hook
 * Manages state for variance playground
 */

import { useState, useCallback, useMemo } from 'react'
import type { CardDeck } from '../engines/VarianceEngine'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
  type QueryCodec,
} from '@/core/share/query-state'

export function useVariancePlayground() {
  // Default deck: all cards included (1-10)
  const defaultDeck = useMemo<CardDeck>(
    () => ({
      card1: true,
      card2: true,
      card3: true,
      card4: true,
      card5: true,
      card6: true,
      card7: true,
      card8: true,
      card9: true,
      card10: true,
    }),
    []
  )

  const [deck, setDeck] = useState<CardDeck>(defaultDeck)

  const [drawSpeed, setDrawSpeed] = useState<number>(500) // ms between draws
  const [showTheoretical, setShowTheoretical] = useState<boolean>(true)

  const deckCodec = useMemo<QueryCodec<CardDeck>>(
    () => ({
      parse(rawValue) {
        if (!rawValue || rawValue.length !== 10) return undefined
        const values = rawValue.split('').map((char) => char === '1')
        return {
          card1: values[0],
          card2: values[1],
          card3: values[2],
          card4: values[3],
          card5: values[4],
          card6: values[5],
          card7: values[6],
          card8: values[7],
          card9: values[8],
          card10: values[9],
        }
      },
      serialize(value) {
        return [
          value.card1,
          value.card2,
          value.card3,
          value.card4,
          value.card5,
          value.card6,
          value.card7,
          value.card8,
          value.card9,
          value.card10,
        ]
          .map((flag) => (flag ? '1' : '0'))
          .join('')
      },
    }),
    []
  )

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'deck',
          value: deck,
          defaultValue: defaultDeck,
          setValue: setDeck,
          codec: deckCodec,
        },
        {
          key: 'speed',
          value: drawSpeed,
          defaultValue: 500,
          setValue: setDrawSpeed,
          codec: createNumberCodec({ min: 10, max: 2000, step: 10 }),
        },
        {
          key: 'show',
          value: showTheoretical,
          defaultValue: true,
          setValue: setShowTheoretical,
          codec: createBooleanCodec(),
        },
      ],
      [deck, deckCodec, defaultDeck, drawSpeed, showTheoretical]
    )
  )

  /**
   * Toggle a card in/out of the deck
   */
  const toggleCard = useCallback((cardNumber: number) => {
    setDeck((prev) => ({
      ...prev,
      [`card${cardNumber}`]: !prev[`card${cardNumber}` as keyof CardDeck],
    }))
  }, [])

  /**
   * Reset deck to all cards included
   */
  const resetDeck = useCallback(() => {
    setDeck(defaultDeck)
  }, [defaultDeck])

  /**
   * Toggle theoretical variance visibility
   */
  const toggleShowTheoretical = useCallback(() => {
    setShowTheoretical((prev) => !prev)
  }, [])

  return {
    deck,
    setDeck,
    toggleCard,
    resetDeck,
    drawSpeed,
    setDrawSpeed,
    showTheoretical,
    toggleShowTheoretical,
  }
}
