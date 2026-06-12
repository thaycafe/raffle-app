/**
 * Utility functions for managing raffle drawn prizes in localStorage.
 * Stores and retrieves drawn prize data keyed by prizePosition.
 */

import type { DrawResult } from '../types/admin'

const STORAGE_KEY = 'raffleDrawnPrizes'

export type StoredDrawnPrize = {
  number: number
  name: string
  prizePosition: number
  drawnAt: string
}

/**
 * Get all drawn prizes from localStorage.
 */
export function getDrawnPrizes(): StoredDrawnPrize[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredDrawnPrize[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Get all drawn prize numbers.
 */
export function getDrawnPositions(): number[] {
  return getDrawnPrizes().map((p) => p.prizePosition)
}

/**
 * Save a drawn prize to localStorage.
 */
export function saveDrawnPrize(prize: DrawResult, prizePosition: number): void {
  try {
    const prizes = getDrawnPrizes()
    const existingIndex = prizes.findIndex((p) => p.prizePosition === prizePosition)
    const storedPrize: StoredDrawnPrize = {
      number: prize.number,
      name: prize.name,
      prizePosition,
      drawnAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      prizes[existingIndex] = storedPrize
    } else {
      prizes.push(storedPrize)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes))
  } catch {
    console.error('Failed to save drawn prize to localStorage')
  }
}

/**
 * Remove a drawn prize by prize number.
 */
export function removeDrawnPrize(position: number): void {
  try {
    const prizes = getDrawnPrizes()
    const filtered = prizes.filter((p) => p.prizePosition !== position)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    console.error('Failed to remove drawn prize from localStorage')
  }
}
