import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService } from '../services/storageService.js'

export function useScreenSaver() {
  const [isScreenSaverActive, setIsScreenSaverActive] = useState(false)
  const [screenSaverMode, setScreenSaverModeState] = useState(() =>
    storageService.getItem('os_screensaver_mode', 'matrix')
  )
  const [screenSaverTimeoutMinutes, setScreenSaverTimeoutMinutesState] = useState(() =>
    storageService.getItem('os_screensaver_timeout', 3)
  )

  const timerRef = useRef(null)

  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (screenSaverTimeoutMinutes <= 0) return

    timerRef.current = setTimeout(() => {
      setIsScreenSaverActive(true)
    }, screenSaverTimeoutMinutes * 60 * 1000)
  }, [screenSaverTimeoutMinutes])

  useEffect(() => {
    if (isScreenSaverActive) return

    resetInactivityTimer()

    const handleUserActivity = () => {
      resetInactivityTimer()
    }

    window.addEventListener('mousemove', handleUserActivity, { passive: true })
    window.addEventListener('mousedown', handleUserActivity, { passive: true })
    window.addEventListener('keydown', handleUserActivity, { passive: true })
    window.addEventListener('touchstart', handleUserActivity, { passive: true })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('mousedown', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
      window.removeEventListener('touchstart', handleUserActivity)
    }
  }, [isScreenSaverActive, resetInactivityTimer])

  const setScreenSaverMode = useCallback((mode) => {
    setScreenSaverModeState(mode)
    storageService.setItem('os_screensaver_mode', mode)
  }, [])

  const setScreenSaverTimeoutMinutes = useCallback((minutes) => {
    setScreenSaverTimeoutMinutesState(minutes)
    storageService.setItem('os_screensaver_timeout', minutes)
  }, [])

  const startScreenSaver = useCallback(() => {
    setIsScreenSaverActive(true)
  }, [])

  const dismissScreenSaver = useCallback(() => {
    setIsScreenSaverActive(false)
    resetInactivityTimer()
  }, [resetInactivityTimer])

  return {
    isScreenSaverActive,
    screenSaverMode,
    screenSaverTimeoutMinutes,
    setScreenSaverMode,
    setScreenSaverTimeoutMinutes,
    startScreenSaver,
    dismissScreenSaver,
  }
}
