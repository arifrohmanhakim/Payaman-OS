import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { storageService } from '../services/storageService.js'
import { soundService } from '../services/soundService.js'
import { DEFAULT_DOCK_SETTINGS } from '../constants/dock.js'

const DockContext = createContext(null)

export function DockProvider({ children }) {
  const [dockSettings, setDockSettingsState] = useState(() => {
    const saved = storageService.getItem('os_dock_settings', {})
    return { ...DEFAULT_DOCK_SETTINGS, ...saved }
  })

  const updateDockSettings = useCallback((newSettings) => {
    setDockSettingsState((prev) => {
      const updated =
        typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings }
      storageService.setItem('os_dock_settings', updated)
      return updated
    })
    soundService.playClick()
  }, [])

  const value = useMemo(
    () => ({
      dockSettings,
      updateDockSettings,
    }),
    [dockSettings, updateDockSettings]
  )

  return <DockContext.Provider value={value}>{children}</DockContext.Provider>
}

export function useDockContext() {
  const context = useContext(DockContext)
  if (!context) {
    throw new Error('useDockContext must be used within DockProvider')
  }
  return context
}
