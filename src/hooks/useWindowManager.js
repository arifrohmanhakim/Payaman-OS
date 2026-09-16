import { useState, useCallback } from 'react'

export function useWindowManager(initialWindows = []) {
  const [windows, setWindows] = useState(initialWindows)
  const [activeWindowId, setActiveWindowId] = useState(
    initialWindows.length > 0 ? initialWindows[0].id : null
  )
  const [nextZIndex, setNextZIndex] = useState(20)

  const focusWindow = useCallback((windowId) => {
    setActiveWindowId(windowId)
    setNextZIndex((prevZ) => {
      const updatedZ = prevZ + 1
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, zIndex: updatedZ } : w))
      )
      return updatedZ
    })
  }, [])

  const openWindow = useCallback(
    (appConfig) => {
      setWindows((prevWindows) => {
        const existing = prevWindows.find((w) => w.appId === appConfig.id)
        if (existing) {
          focusWindow(existing.id)
          return prevWindows.map((w) =>
            w.id === existing.id ? { ...w, isMinimized: false } : w
          )
        }

        const newZ = nextZIndex + 1
        setNextZIndex(newZ)
        setActiveWindowId(appConfig.id)

        const offset = (prevWindows.length % 5) * 28
        const newWindow = {
          id: appConfig.id,
          appId: appConfig.id,
          title: appConfig.title,
          x: 60 + offset,
          y: 60 + offset,
          width: appConfig.defaultWidth || 400,
          height: appConfig.defaultHeight || 300,
          isMinimized: false,
          zIndex: newZ,
        }

        return [...prevWindows, newWindow]
      })
    },
    [focusWindow, nextZIndex]
  )

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

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    updateWindowPosition,
    updateWindowSize,
  }
}
