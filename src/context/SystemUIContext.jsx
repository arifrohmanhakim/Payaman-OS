import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { soundService } from '../services/soundService.js'
import { useScreenSaver } from '../hooks/useScreenSaver.js'

const SystemUIContext = createContext(null)

export function SystemUIProvider({ children }) {
  const [systemPhase, setSystemPhase] = useState('booting') // 'booting' | 'welcome' | 'desktop'
  const [activeModal, setActiveModal] = useState(null)
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)

  const {
    isScreenSaverActive,
    screenSaverMode,
    screenSaverTimeoutMinutes,
    setScreenSaverMode,
    setScreenSaverTimeoutMinutes,
    startScreenSaver,
    dismissScreenSaver,
  } = useScreenSaver()

  const reboot = useCallback(() => {
    setSystemPhase('booting')
  }, [])

  const enterWelcome = useCallback(() => {
    setSystemPhase('welcome')
  }, [])

  const enterDesktop = useCallback(() => {
    setSystemPhase('desktop')
  }, [])

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

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if (isCmdOrCtrl && (e.code === 'Space' || e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        toggleSpotlight()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [toggleSpotlight])

  const value = useMemo(
    () => ({
      systemPhase,
      activeModal,
      isLaunchpadOpen,
      isSpotlightOpen,
      isScreenSaverActive,
      screenSaverMode,
      screenSaverTimeoutMinutes,
      reboot,
      enterWelcome,
      enterDesktop,
      showModal,
      closeModal,
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      openSpotlight,
      closeSpotlight,
      toggleSpotlight,
      setScreenSaverMode,
      setScreenSaverTimeoutMinutes,
      startScreenSaver,
      dismissScreenSaver,
    }),
    [
      systemPhase,
      activeModal,
      isLaunchpadOpen,
      isSpotlightOpen,
      isScreenSaverActive,
      screenSaverMode,
      screenSaverTimeoutMinutes,
      reboot,
      enterWelcome,
      enterDesktop,
      showModal,
      closeModal,
      openLaunchpad,
      closeLaunchpad,
      toggleLaunchpad,
      openSpotlight,
      closeSpotlight,
      toggleSpotlight,
      setScreenSaverMode,
      setScreenSaverTimeoutMinutes,
      startScreenSaver,
      dismissScreenSaver,
    ]
  )

  return <SystemUIContext.Provider value={value}>{children}</SystemUIContext.Provider>
}

export function useSystemUIContext() {
  const context = useContext(SystemUIContext)
  if (!context) {
    throw new Error('useSystemUIContext must be used within SystemUIProvider')
  }
  return context
}
