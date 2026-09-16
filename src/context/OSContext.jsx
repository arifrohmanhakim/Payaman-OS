import { useState, useCallback, useMemo } from 'react'
import { getAppById } from '../apps/appRegistry.js'
import { soundService } from '../services/soundService.js'
import { storageService } from '../services/storageService.js'
import { useWindowManager } from '../hooks/useWindowManager.js'
import { DEFAULT_DOCK_SETTINGS } from '../constants/dock.js'
import { OSContext } from './OSContextInstance.js'

const INITIAL_WINDOWS = [
  {
    id: 'about',
    appId: 'about',
    title: 'Tentang Payaman OS',
    x: 80,
    y: 70,
    width: 320,
    height: 310,
    isMinimized: false,
    zIndex: 10,
  },
  {
    id: 'preferences',
    appId: 'preferences',
    title: 'Preferensi Sistem',
    x: 340,
    y: 90,
    width: 500,
    height: 380,
    isMinimized: false,
    zIndex: 11,
  },
]

export function OSProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null)
  const [theme, setThemeState] = useState(() => {
    return storageService.getItem('os_theme', 'classic')
  })
  const [pattern, setPatternState] = useState(() => {
    return storageService.getItem('os_pattern', 'halftone')
  })
  const [dockSettings, setDockSettingsState] = useState(() => {
    const saved = storageService.getItem('os_dock_settings', {})
    return { ...DEFAULT_DOCK_SETTINGS, ...saved }
  })

  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowManager(INITIAL_WINDOWS)

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    storageService.setItem('os_theme', newTheme)
    soundService.playClick()
  }, [])

  const setPattern = useCallback((newPattern) => {
    setPatternState(newPattern)
    storageService.setItem('os_pattern', newPattern)
    soundService.playClick()
  }, [])

  const updateDockSettings = useCallback((newSettings) => {
    setDockSettingsState((prev) => {
      const updated =
        typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings }
      storageService.setItem('os_dock_settings', updated)
      return updated
    })
    soundService.playClick()
  }, [])

  const openApp = useCallback(
    (appId) => {
      soundService.playClick()
      const appDef = getAppById(appId)
      if (appDef) {
        openWindow(appDef)
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

  const showModal = useCallback((modalConfig) => {
    soundService.playErrorAlert()
    setActiveModal(modalConfig)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      windows,
      activeWindowId,
      activeModal,
      theme,
      pattern,
      dockSettings,
      setTheme,
      setPattern,
      updateDockSettings,
      openApp,
      closeWindow: handleCloseWindow,
      focusWindow,
      minimizeWindow: handleMinimizeWindow,
      toggleMaximizeWindow: handleToggleMaximizeWindow,
      updateWindowPosition,
      updateWindowSize,
      showModal,
      closeModal,
    }),
    [
      windows,
      activeWindowId,
      activeModal,
      theme,
      pattern,
      dockSettings,
      setTheme,
      setPattern,
      updateDockSettings,
      openApp,
      handleCloseWindow,
      focusWindow,
      handleMinimizeWindow,
      handleToggleMaximizeWindow,
      updateWindowPosition,
      updateWindowSize,
      showModal,
      closeModal,
    ]
  )

  return <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>
}
