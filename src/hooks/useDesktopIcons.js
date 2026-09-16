import { useState, useCallback, useEffect } from 'react'
import { storageService } from '../services/storageService.js'

const STORAGE_KEY_POSITIONS = 'desktop_icon_positions'

const ICON_WIDTH = 96
const ICON_HEIGHT = 92
const MARGIN_RIGHT = 24
const MARGIN_TOP = 44

function generateRightAlignedPositions(appIds) {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const startX = screenWidth - ICON_WIDTH - MARGIN_RIGHT
  const positions = {}

  appIds.forEach((id, index) => {
    positions[id] = {
      x: startX,
      y: MARGIN_TOP + index * ICON_HEIGHT,
    }
  })

  return positions
}

const DEFAULT_APP_ORDER = [
  'write', 'paint', 'calendar', 'calc', 'gallery', 'photobot', 'terminal', 'preferences', 'about',
]

export function useDesktopIcons() {
  const [positions, setPositions] = useState(() => {
    const saved = storageService.getItem(STORAGE_KEY_POSITIONS, null)
    if (saved && Object.keys(saved).length > 0) {
      const firstAppPos = saved[DEFAULT_APP_ORDER[0]]
      const isLegacyLeftLayout = firstAppPos && firstAppPos.x < 200
      if (isLegacyLeftLayout) {
        const fresh = generateRightAlignedPositions(DEFAULT_APP_ORDER)
        storageService.setItem(STORAGE_KEY_POSITIONS, fresh)
        return fresh
      }
      return saved
    }
    return generateRightAlignedPositions(DEFAULT_APP_ORDER)
  })

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_POSITIONS, positions)
  }, [positions])

  const getIconPosition = useCallback(
    (appId, index = 0) => {
      if (positions[appId]) {
        return positions[appId]
      }
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
      return { x: screenWidth - ICON_WIDTH - MARGIN_RIGHT, y: MARGIN_TOP + index * ICON_HEIGHT }
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

  const resetPositions = useCallback(() => {
    const freshPositions = generateRightAlignedPositions(DEFAULT_APP_ORDER)
    setPositions(freshPositions)
  }, [])

  return {
    getIconPosition,
    setIconPosition,
    resetPositions,
  }
}
