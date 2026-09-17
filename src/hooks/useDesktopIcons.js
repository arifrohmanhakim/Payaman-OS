import { useState, useCallback, useEffect } from 'react'
import { storageService } from '../services/storageService.js'
import { getDesktopApps } from '../apps/appRegistry.js'

const STORAGE_KEY_POSITIONS = 'desktop_icon_positions'

const ICON_WIDTH = 96
const ICON_HEIGHT = 92
const MARGIN_RIGHT = 24
const MARGIN_TOP = 44

export function arrangeGridPositions(appList, uiScale = 1.15) {
  const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1280) / uiScale
  const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) / uiScale

  const maxRows = Math.max(1, Math.floor((screenH - MARGIN_TOP - 80) / ICON_HEIGHT))
  const startX = Math.max(20, screenW - ICON_WIDTH - MARGIN_RIGHT)
  const colSpacing = ICON_WIDTH + 12

  const positions = {}

  appList.forEach((app, index) => {
    const appId = typeof app === 'string' ? app : app.id
    const colIndex = Math.floor(index / maxRows)
    const rowIndex = index % maxRows

    const x = Math.max(16, startX - colIndex * colSpacing)
    const y = MARGIN_TOP + rowIndex * ICON_HEIGHT

    positions[appId] = { x, y }
  })

  return positions
}

export function useDesktopIcons(uiScale = 1.15) {
  const [positions, setPositions] = useState(() => {
    const desktopApps = getDesktopApps()
    const saved = storageService.getItem(STORAGE_KEY_POSITIONS, null)
    if (saved && Object.keys(saved).length > 0) {
      return saved
    }
    return arrangeGridPositions(desktopApps, uiScale)
  })

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_POSITIONS, positions)
  }, [positions])

  const getIconPosition = useCallback(
    (appId, index = 0) => {
      if (positions[appId]) {
        return positions[appId]
      }
      const desktopApps = getDesktopApps()
      const fallbackGrid = arrangeGridPositions(desktopApps, uiScale)
      return fallbackGrid[appId] || { x: 24, y: MARGIN_TOP + index * ICON_HEIGHT }
    },
    [positions, uiScale]
  )

  const setIconPosition = useCallback(
    (appId, x, y) => {
      const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1280) / uiScale
      const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) / uiScale
      const clampedX = Math.max(8, Math.min(screenW - 96, x))
      const clampedY = Math.max(30, Math.min(screenH - 110, y))

      setPositions((prev) => ({
        ...prev,
        [appId]: { x: clampedX, y: clampedY },
      }))
    },
    [uiScale]
  )

  // Clean up and snap all icons to clean grid
  const cleanUpIcons = useCallback(() => {
    const desktopApps = getDesktopApps()
    const fresh = arrangeGridPositions(desktopApps, uiScale)
    setPositions(fresh)
  }, [uiScale])

  // Sort icons by name alphabetically (A-Z) and arrange on grid
  const sortIconsByName = useCallback(() => {
    const desktopApps = getDesktopApps()
    const sorted = [...desktopApps].sort((a, b) =>
      a.title.localeCompare(b.title, 'id', { sensitivity: 'base' })
    )
    const fresh = arrangeGridPositions(sorted, uiScale)
    setPositions(fresh)
  }, [uiScale])

  // Reset to default system order
  const resetPositions = useCallback(() => {
    const desktopApps = getDesktopApps()
    const fresh = arrangeGridPositions(desktopApps, uiScale)
    setPositions(fresh)
  }, [uiScale])

  return {
    getIconPosition,
    setIconPosition,
    cleanUpIcons,
    sortIconsByName,
    resetPositions,
  }
}
