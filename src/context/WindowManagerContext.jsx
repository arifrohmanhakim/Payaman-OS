import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { getAppById } from '../apps/appRegistry.js'
import { soundService } from '../services/soundService.js'
import { storageService } from '../services/storageService.js'
import { useWindowManager } from '../hooks/useWindowManager.js'
import { useThemeContext } from './ThemeContext.jsx'

const WindowManagerContext = createContext(null)

const getInitialWindows = (uiScale = 1.0) => {
  const screenWidth = (typeof window !== 'undefined' ? window.innerWidth : 1024) / uiScale
  const screenHeight = (typeof window !== 'undefined' ? window.innerHeight : 768) / uiScale

  const aboutW = 320
  const aboutH = 310

  return [
    {
      id: 'about',
      appId: 'about',
      title: 'About Payaman OS',
      x: Math.max(12, Math.round((screenWidth - aboutW) / 2)),
      y: Math.max(30, Math.round((screenHeight - aboutH) / 2)),
      width: aboutW,
      height: aboutH,
      isMinimized: false,
      zIndex: 10,
    },
  ]
}

export function WindowManagerProvider({ children }) {
  const { uiScale } = useThemeContext()

  const [activeSpace, setActiveSpaceState] = useState(() => {
    return storageService.getItem('os_active_space', 1)
  })

  const {
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
  } = useWindowManager(getInitialWindows(uiScale), uiScale)

  const setActiveSpace = useCallback((spaceNum) => {
    soundService.playClick()
    setActiveSpaceState(spaceNum)
    storageService.setItem('os_active_space', spaceNum)
  }, [])

  const openApp = useCallback(
    (appId, customProps = {}) => {
      soundService.playClick()
      if (appId === 'stickynotes' || appId === 'stickies') {
        window.dispatchEvent(
          new CustomEvent('payaman-create-sticky-note', { detail: customProps })
        )
        return
      }
      const appDef = getAppById(appId)
      if (appDef) {
        openWindow({ ...appDef, ...customProps })
      }
    },
    [openWindow]
  )

  const handleCloseWindow = useCallback(
    (windowId) => {
      soundService.playClick()
      closeWindow(windowId)
    },
    [closeWindow]
  )

  const handleMinimizeWindow = useCallback(
    (windowId) => {
      soundService.playClick()
      minimizeWindow(windowId)
    },
    [minimizeWindow]
  )

  const handleToggleMaximizeWindow = useCallback(
    (windowId) => {
      soundService.playClick()
      toggleMaximizeWindow(windowId)
    },
    [toggleMaximizeWindow]
  )

  const value = useMemo(
    () => ({
      windows,
      activeWindowId,
      activeSpace,
      setActiveSpace,
      openApp,
      closeWindow: handleCloseWindow,
      focusWindow,
      minimizeWindow: handleMinimizeWindow,
      toggleMaximizeWindow: handleToggleMaximizeWindow,
      snapWindow,
      updateWindowPosition,
      updateWindowSize,
      setWindowSpace,
      resetSession,
    }),
    [
      windows,
      activeWindowId,
      activeSpace,
      setActiveSpace,
      openApp,
      handleCloseWindow,
      focusWindow,
      handleMinimizeWindow,
      handleToggleMaximizeWindow,
      snapWindow,
      updateWindowPosition,
      updateWindowSize,
      setWindowSpace,
      resetSession,
    ]
  )

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export function useWindowManagerContext() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManagerContext must be used within WindowManagerProvider')
  }
  return context
}
