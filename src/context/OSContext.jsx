import { useState, useCallback, useMemo } from 'react'
import { getAppById } from '../apps/appRegistry.js'
import { soundService } from '../services/soundService.js'
import { storageService } from '../services/storageService.js'
import { useWindowManager } from '../hooks/useWindowManager.js'
import { DEFAULT_DOCK_SETTINGS } from '../constants/dock.js'
import { OSContext } from './OSContextInstance.js'

const getInitialWindows = () => {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768

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

export function OSProvider({ children }) {
  const [systemPhase, setSystemPhase] = useState('booting') // 'booting' | 'welcome' | 'desktop'
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
  const [customWallpaper, setCustomWallpaperState] = useState(() => {
    return storageService.getItem('os_custom_wallpaper', null)
  })
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false)

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
    resetSession,
  } = useWindowManager(getInitialWindows())

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
    (appId, customProps = {}) => {
      soundService.playClick()
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

  const showModal = useCallback((modalConfig) => {
    soundService.playErrorAlert()
    setActiveModal(modalConfig)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const openLaunchpad = useCallback(() => {
    soundService.playClick()
    setIsLaunchpadOpen(true)
  }, [])

  const closeLaunchpad = useCallback(() => {
    soundService.playClick()
    setIsLaunchpadOpen(false)
  }, [])

  const toggleLaunchpad = useCallback(() => {
    soundService.playClick()
    setIsLaunchpadOpen((prev) => !prev)
  }, [])

  const setCustomWallpaper = useCallback((wallpaperUrl) => {
    setCustomWallpaperState(wallpaperUrl)
    storageService.setItem('os_custom_wallpaper', wallpaperUrl)
    soundService.playClick()
  }, [])

  const clearCustomWallpaper = useCallback(() => {
    setCustomWallpaperState(null)
    storageService.removeItem('os_custom_wallpaper')
    soundService.playClick()
  }, [])

  const reboot = useCallback(() => {
    setSystemPhase('booting')
  }, [])

  const enterWelcome = useCallback(() => {
    setSystemPhase('welcome')
  }, [])

  const enterDesktop = useCallback(() => {
    setSystemPhase('desktop')
  }, [])

  const contextValue = useMemo(
    () => ({
      systemPhase,
      reboot,
      enterWelcome,
      enterDesktop,
      windows,
      activeWindowId,
      activeModal,
      theme,
      pattern,
      customWallpaper,
      dockSettings,
      isLaunchpadOpen,
      setTheme,
      setPattern,
      setCustomWallpaper,
      clearCustomWallpaper,
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
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      resetSession,
    }),
    [
      systemPhase,
      reboot,
      enterWelcome,
      enterDesktop,
      windows,
      activeWindowId,
      activeModal,
      theme,
      pattern,
      customWallpaper,
      dockSettings,
      isLaunchpadOpen,
      setTheme,
      setPattern,
      setCustomWallpaper,
      clearCustomWallpaper,
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
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      resetSession,
    ]
  )

  return <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>
}
