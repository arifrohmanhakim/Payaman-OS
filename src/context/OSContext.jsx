import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAppById } from '../apps/appRegistry.js'
import { soundService } from '../services/soundService.js'
import { storageService } from '../services/storageService.js'
import { useWindowManager } from '../hooks/useWindowManager.js'
import { useScreenSaver } from '../hooks/useScreenSaver.js'
import { DEFAULT_DOCK_SETTINGS } from '../constants/dock.js'
import { DEFAULT_DISPLAY_SETTINGS } from '../constants/display.js'
import { DEFAULT_CUSTOM_THEME } from '../constants/theme.js'
import { OSContext } from './OSContextInstance.js'

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

export function OSProvider({ children }) {
  const [systemPhase, setSystemPhase] = useState('booting') // 'booting' | 'welcome' | 'desktop'
  const [activeModal, setActiveModal] = useState(null)
  const [theme, setThemeState] = useState(() => {
    return storageService.getItem('os_theme', 'classic')
  })
  const [customThemeColors, setCustomThemeColorsState] = useState(() => {
    return storageService.getItem('os_custom_theme', DEFAULT_CUSTOM_THEME)
  })
  const [pattern, setPatternState] = useState(() => {
    return storageService.getItem('os_pattern', 'halftone')
  })
  const [dockSettings, setDockSettingsState] = useState(() => {
    const saved = storageService.getItem('os_dock_settings', {})
    return { ...DEFAULT_DOCK_SETTINGS, ...saved }
  })
  const [displaySettings, setDisplaySettingsState] = useState(() => {
    const saved = storageService.getItem('os_display_settings', {})
    return { ...DEFAULT_DISPLAY_SETTINGS, ...saved }
  })
  const [customWallpaper, setCustomWallpaperState] = useState(() => {
    return storageService.getItem('os_custom_wallpaper', null)
  })
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)

  const uiScale = displaySettings?.scale || 1.15

  const [activeSpace, setActiveSpaceState] = useState(() => {
    return storageService.getItem('os_active_space', 1)
  })
  const [crtScanlines, setCrtScanlinesState] = useState(() => {
    return storageService.getItem('os_crt_scanlines', false)
  })

  const {
    isScreenSaverActive,
    screenSaverMode,
    screenSaverTimeoutMinutes,
    setScreenSaverMode,
    setScreenSaverTimeoutMinutes,
    startScreenSaver,
    dismissScreenSaver,
  } = useScreenSaver()

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

  const setCrtScanlines = useCallback((enabled) => {
    soundService.playClick()
    setCrtScanlinesState(enabled)
    storageService.setItem('os_crt_scanlines', enabled)
  }, [])

  const toggleCrtScanlines = useCallback(() => {
    setCrtScanlinesState((prev) => {
      const next = !prev
      soundService.playClick()
      storageService.setItem('os_crt_scanlines', next)
      return next
    })
  }, [])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    storageService.setItem('os_theme', newTheme)
    soundService.playClick()
  }, [])

  const setCustomThemeColors = useCallback((colors) => {
    setCustomThemeColorsState((prev) => {
      const updated = typeof colors === 'function' ? colors(prev) : { ...prev, ...colors }
      storageService.setItem('os_custom_theme', updated)
      return updated
    })
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

  const updateDisplaySettings = useCallback((newSettings) => {
    setDisplaySettingsState((prev) => {
      const updated =
        typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings }
      storageService.setItem('os_display_settings', updated)
      return updated
    })
    soundService.playClick()
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

  const openSpotlight = useCallback(() => {
    soundService.playClick()
    setIsSpotlightOpen(true)
  }, [])

  const closeSpotlight = useCallback(() => {
    soundService.playClick()
    setIsSpotlightOpen(false)
  }, [])

  const toggleSpotlight = useCallback(() => {
    soundService.playClick()
    setIsSpotlightOpen((prev) => !prev)
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

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Cmd+Space, Ctrl+Space, Cmd+K, Ctrl+K
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if (isCmdOrCtrl && (e.code === 'Space' || e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        toggleSpotlight()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [toggleSpotlight])

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
      customThemeColors,
      pattern,
      customWallpaper,
      dockSettings,
      displaySettings,
      activeSpace,
      crtScanlines,
      isLaunchpadOpen,
      isSpotlightOpen,
      setActiveSpace,
      setCrtScanlines,
      toggleCrtScanlines,
      setTheme,
      setCustomThemeColors,
      setPattern,
      setCustomWallpaper,
      clearCustomWallpaper,
      updateDockSettings,
      updateDisplaySettings,
      openApp,
      closeWindow: handleCloseWindow,
      focusWindow,
      minimizeWindow: handleMinimizeWindow,
      toggleMaximizeWindow: handleToggleMaximizeWindow,
      snapWindow,
      updateWindowPosition,
      updateWindowSize,
      setWindowSpace,
      showModal,
      closeModal,
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      openSpotlight,
      closeSpotlight,
      toggleSpotlight,
      isScreenSaverActive,
      screenSaverMode,
      screenSaverTimeoutMinutes,
      setScreenSaverMode,
      setScreenSaverTimeoutMinutes,
      startScreenSaver,
      dismissScreenSaver,
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
      customThemeColors,
      pattern,
      customWallpaper,
      dockSettings,
      displaySettings,
      activeSpace,
      crtScanlines,
      isLaunchpadOpen,
      isSpotlightOpen,
      setActiveSpace,
      setCrtScanlines,
      toggleCrtScanlines,
      setTheme,
      setCustomThemeColors,
      setPattern,
      setCustomWallpaper,
      clearCustomWallpaper,
      updateDockSettings,
      updateDisplaySettings,
      openApp,
      handleCloseWindow,
      focusWindow,
      handleMinimizeWindow,
      handleToggleMaximizeWindow,
      snapWindow,
      updateWindowPosition,
      updateWindowSize,
      setWindowSpace,
      showModal,
      closeModal,
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      openSpotlight,
      closeSpotlight,
      toggleSpotlight,
      isScreenSaverActive,
      screenSaverMode,
      screenSaverTimeoutMinutes,
      setScreenSaverMode,
      setScreenSaverTimeoutMinutes,
      startScreenSaver,
      dismissScreenSaver,
      resetSession,
    ]
  )

  return <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>
}
