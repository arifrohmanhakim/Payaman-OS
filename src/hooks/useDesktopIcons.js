import { useState, useCallback, useEffect } from 'react'
import { storageService } from '../services/storageService.js'

const STORAGE_KEY_POSITIONS = 'desktop_icon_positions'

const DEFAULT_ICON_POSITIONS = {
  files: { x: 24, y: 44 },
  write: { x: 24, y: 136 },
  calc: { x: 24, y: 228 },
  terminal: { x: 24, y: 320 },
  gallery: { x: 24, y: 412 },
  preferences: { x: 120, y: 44 },
  about: { x: 120, y: 136 },
  wastebasket: { x: 120, y: 228 },
}

export function useDesktopIcons() {
  const [positions, setPositions] = useState(() => {
    const saved = storageService.getItem(STORAGE_KEY_POSITIONS, {})
    return { ...DEFAULT_ICON_POSITIONS, ...saved }
  })

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_POSITIONS, positions)
  }, [positions])

  const getIconPosition = useCallback(
    (appId, index = 0) => {
      if (positions[appId]) {
        return positions[appId]
      }
      return { x: 24, y: 44 + index * 92 }
    },
    [positions]
  )

  const setIconPosition = useCallback((appId, x, y) => {
    const clampedX = Math.max(8, Math.min(window.innerWidth - 96, x))
    const clampedY = Math.max(30, Math.min(window.innerHeight - 110, y))

    setPositions((prev) => ({
      ...prev,
      [appId]: { x: clampedX, y: clampedY },
    }))
  }, [])

  return {
    getIconPosition,
    setIconPosition,
  }
}
