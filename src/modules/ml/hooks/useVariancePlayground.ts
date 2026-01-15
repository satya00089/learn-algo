/**
 * useVariancePlayground Hook
 * Manages state for variance playground
 */

import { useState, useCallback } from 'react'
import type { CardDeck } from '../engines/VarianceEngine'

export function useVariancePlayground() {
  // Default deck: all cards included (1-10)
  const [deck, setDeck] = useState<CardDeck>({
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
  })

  const [drawSpeed, setDrawSpeed] = useState<number>(500) // ms between draws
  const [showTheoretical, setShowTheoretical] = useState<boolean>(true)

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
    setDeck({
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
    })
  }, [])

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
