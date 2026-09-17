import { useState, useCallback, useEffect } from 'react'
import { storageService } from '../services/storageService.js'

const STORAGE_KEY_WINDOWS = 'os_session_windows'
const STORAGE_KEY_ACTIVE_WINDOW = 'os_session_active_window'

export function useWindowManager(initialWindows = [], uiScale = 1.0) {
  const [windows, setWindows] = useState(() => {
    const saved = storageService.getItem(STORAGE_KEY_WINDOWS, null)
    if (Array.isArray(saved)) {
      return saved
    }
    return initialWindows
  })

  const [activeWindowId, setActiveWindowId] = useState(() => {
    const savedActive = storageService.getItem(STORAGE_KEY_ACTIVE_WINDOW, null)
    if (savedActive) {
      return savedActive
    }
    const savedWindows = storageService.getItem(STORAGE_KEY_WINDOWS, null)
    if (Array.isArray(savedWindows) && savedWindows.length > 0) {
      return savedWindows[savedWindows.length - 1].id
    }
    return initialWindows.length > 0 ? initialWindows[0].id : null
  })

  const [, setNextZIndex] = useState(() => {
    const maxZ = windows.reduce((max, w) => Math.max(max, w.zIndex || 10), 20)
    return maxZ + 1
  })

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_WINDOWS, windows)
  }, [windows])

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_ACTIVE_WINDOW, activeWindowId)
  }, [activeWindowId])

  const focusWindow = useCallback((windowId) => {
    setActiveWindowId(windowId)
    if (windowId) {
      setNextZIndex((prevZ) => {
        const updatedZ = prevZ + 1
        setWindows((prev) =>
          prev.map((w) => (w.id === windowId ? { ...w, zIndex: updatedZ } : w))
        )
        return updatedZ
      })
    }
  }, [])

  const openWindow = useCallback((appConfig) => {
    setNextZIndex((currentZ) => {
      const newZ = currentZ + 1
      setActiveWindowId(appConfig.id)

      setWindows((prevWindows) => {
        const existing = prevWindows.find((w) => w.appId === appConfig.id)
        if (existing) {
          return prevWindows.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  ...appConfig,
                  isMinimized: false,
                  zIndex: newZ,
                }
              : w
          )
        }

        const winWidth = appConfig.defaultWidth || 400
        const winHeight = appConfig.defaultHeight || 300
        const screenWidth = (typeof window !== 'undefined' ? window.innerWidth : 1024) / uiScale
        const screenHeight = (typeof window !== 'undefined' ? window.innerHeight : 768) / uiScale

        const width = Math.min(winWidth, Math.max(280, screenWidth - 24))
        const height = Math.min(winHeight, Math.max(200, screenHeight - 80))
        const x = Math.max(12, Math.round((screenWidth - width) / 2))
        const y = Math.max(30, Math.round((screenHeight - height) / 2))

        const newWindow = {
          ...appConfig,
          id: appConfig.id,
          appId: appConfig.id,
          title: appConfig.title,
          x,
          y,
          width,
          height,
          space: appConfig.space || 1,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ,
        }

        return [...prevWindows, newWindow]
      })

      return newZ
    })
  }, [uiScale])

  const closeWindow = useCallback(
    (windowId) => {
      setWindows((prevWindows) => {
        const filtered = prevWindows.filter((w) => w.id !== windowId)
        if (activeWindowId === windowId) {
          const remaining = filtered.filter((w) => !w.isMinimized)
          setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null)
        }
        return filtered
      })
    },
    [activeWindowId]
  )

  const minimizeWindow = useCallback((windowId) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      )
    )
  }, [])

  const updateWindowPosition = useCallback((windowId, x, y) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) => (w.id === windowId ? { ...w, x, y } : w))
    )
  }, [])

  const updateWindowSize = useCallback((windowId, width, height) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              width: Math.max(260, width),
              height: Math.max(180, height),
            }
          : w
      )
    )
  }, [])

  const toggleMaximizeWindow = useCallback((windowId) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) => {
        if (w.id !== windowId) return w

        if (w.isMaximized) {
          const prev = w.prevBounds || {
            x: 60,
            y: 60,
            width: 440,
            height: 320,
          }
          return {
            ...w,
            x: prev.x,
            y: prev.y,
            width: prev.width,
            height: prev.height,
            isMaximized: false,
            prevBounds: null,
          }
        }

        const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1024) / uiScale
        const screenH = (typeof window !== 'undefined' ? window.innerHeight : 768) / uiScale

        return {
          ...w,
          prevBounds: {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          },
          x: 0,
          y: 24,
          width: screenW,
          height: screenH - 24,
          isMaximized: true,
        }
      })
    )
  }, [uiScale])

  const snapWindow = useCallback((windowId, snapType) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) => {
        if (w.id !== windowId) return w

        const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1024) / uiScale
        const screenH = (typeof window !== 'undefined' ? window.innerHeight : 768) / uiScale
        const availableHeight = screenH - 24

        if (!w.prevBounds) {
          w.prevBounds = {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          }
        }

        if (snapType === 'left') {
          return {
            ...w,
            x: 0,
            y: 24,
            width: Math.floor(screenW / 2),
            height: availableHeight,
            isMaximized: false,
          }
        }

        if (snapType === 'right') {
          const halfW = Math.floor(screenW / 2)
          return {
            ...w,
            x: halfW,
            y: 24,
            width: screenW - halfW,
            height: availableHeight,
            isMaximized: false,
          }
        }

        if (snapType === 'top' || snapType === 'maximize') {
          return {
            ...w,
            x: 0,
            y: 24,
            width: screenW,
            height: availableHeight,
            isMaximized: true,
          }
        }

        return w
      })
    )
  }, [uiScale])

  const setWindowSpace = useCallback((windowId, space) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) => (w.id === windowId ? { ...w, space } : w))
    )
  }, [])

  const resetSession = useCallback(() => {
    storageService.removeItem(STORAGE_KEY_WINDOWS)
    storageService.removeItem(STORAGE_KEY_ACTIVE_WINDOW)
    setWindows(initialWindows)
    setActiveWindowId(initialWindows.length > 0 ? initialWindows[0].id : null)
  }, [initialWindows])

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    snapWindow,
    updateWindowPosition,
    updateWindowSize,
    setWindowSpace,
    resetSession,
  }
}
