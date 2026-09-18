import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { storageService } from '../services/storageService.js'
import { soundService } from '../services/soundService.js'
import { DEFAULT_DISPLAY_SETTINGS } from '../constants/display.js'
import { DEFAULT_CUSTOM_THEME } from '../constants/theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return storageService.getItem('os_theme', 'classic')
  })
  const [customThemeColors, setCustomThemeColorsState] = useState(() => {
    return storageService.getItem('os_custom_theme', DEFAULT_CUSTOM_THEME)
  })
  const [pattern, setPatternState] = useState(() => {
    return storageService.getItem('os_pattern', 'halftone')
  })
  const [displaySettings, setDisplaySettingsState] = useState(() => {
    const saved = storageService.getItem('os_display_settings', {})
    return { ...DEFAULT_DISPLAY_SETTINGS, ...saved }
  })
  const [customWallpaper, setCustomWallpaperState] = useState(() => {
    return storageService.getItem('os_custom_wallpaper', null)
  })
  const [crtScanlines, setCrtScanlinesState] = useState(() => {
    return storageService.getItem('os_crt_scanlines', false)
  })

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

  const updateDisplaySettings = useCallback((newSettings) => {
    setDisplaySettingsState((prev) => {
      const updated =
        typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings }
      storageService.setItem('os_display_settings', updated)
      return updated
    })
    soundService.playClick()
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

  const value = useMemo(
    () => ({
      theme,
      customThemeColors,
      pattern,
      displaySettings,
      customWallpaper,
      crtScanlines,
      uiScale: displaySettings?.scale || 1.15,
      setTheme,
      setCustomThemeColors,
      setPattern,
      updateDisplaySettings,
      setCustomWallpaper,
      clearCustomWallpaper,
      setCrtScanlines,
      toggleCrtScanlines,
    }),
    [
      theme,
      customThemeColors,
      pattern,
      displaySettings,
      customWallpaper,
      crtScanlines,
      setTheme,
      setCustomThemeColors,
      setPattern,
      updateDisplaySettings,
      setCustomWallpaper,
      clearCustomWallpaper,
      setCrtScanlines,
      toggleCrtScanlines,
    ]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
