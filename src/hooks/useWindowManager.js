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

        const winWidth = appConfig.defaultWidth || 400
        const winHeight = appConfig.defaultHeight || 300
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768

        const width = Math.min(winWidth, Math.max(280, screenWidth - 24))
        const height = Math.min(winHeight, Math.max(200, screenHeight - 80))
        const x = Math.max(12, Math.round((screenWidth - width) / 2))
        const y = Math.max(30, Math.round((screenHeight - height) / 2))

        const newWindow = {
          id: appConfig.id,
          appId: appConfig.id,
          title: appConfig.title,
          x,
          y,
          width,
          height,
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
          width: window.innerWidth,
          height: window.innerHeight - 24,
          isMaximized: true,
        }
      })
    )
  }, [])

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  }
}
