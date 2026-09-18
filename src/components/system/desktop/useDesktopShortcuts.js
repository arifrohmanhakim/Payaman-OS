import { useEffect, useRef } from 'react'
import { soundService } from '../../../services/soundService.js'
import { getAppById } from '../../../apps/appRegistry.js'

export function useDesktopShortcuts({
  windows,
  activeWindowId,
  activeModal,
  contextMenu,
  selectedIconId,
  desktopQuickLookFile,
  switcher,
  setSwitcher,
  setContextMenu,
  closeModal,
  setActiveSpace,
  snapWindow,
  setDesktopQuickLookFile,
  openApp,
  focusWindow,
}) {
  const windowsRef = useRef(windows)
  const switcherRef = useRef(switcher)
  const activeWindowIdRef = useRef(activeWindowId)
  const activeModalRef = useRef(activeModal)
  const contextMenuRef = useRef(contextMenu)
  const selectedIconIdRef = useRef(selectedIconId)
  const desktopQuickLookFileRef = useRef(desktopQuickLookFile)

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  useEffect(() => {
    switcherRef.current = switcher
  }, [switcher])

  useEffect(() => {
    activeWindowIdRef.current = activeWindowId
  }, [activeWindowId])

  useEffect(() => {
    activeModalRef.current = activeModal
  }, [activeModal])

  useEffect(() => {
    contextMenuRef.current = contextMenu
  }, [contextMenu])

  useEffect(() => {
    selectedIconIdRef.current = selectedIconId
  }, [selectedIconId])

  useEffect(() => {
    desktopQuickLookFileRef.current = desktopQuickLookFile
  }, [desktopQuickLookFile])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Esc Key
      if (e.key === 'Escape') {
        if (switcherRef.current.isOpen) {
          setSwitcher({ isOpen: false, selectedIndex: 0 })
          return
        }
        if (contextMenuRef.current.isOpen) {
          setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev))
          return
        }
        if (activeModalRef.current) {
          closeModal()
          return
        }
      }

      // 2. Alt + Tab / Cmd + Tab (App Switcher)
      if ((e.altKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault()
        const winList = windowsRef.current
        if (winList.length === 0) return

        soundService.playClick()
        setSwitcher((prev) => {
          if (!prev.isOpen) {
            const currentIdx = winList.findIndex((w) => w.id === activeWindowIdRef.current)
            const initialIdx = (currentIdx + (e.shiftKey ? -1 : 1) + winList.length) % winList.length
            return {
              isOpen: true,
              selectedIndex: initialIdx,
            }
          }
          const nextIdx = (prev.selectedIndex + (e.shiftKey ? -1 : 1) + winList.length) % winList.length
          return {
            ...prev,
            selectedIndex: nextIdx,
          }
        })
        return
      }

      // 3. Ctrl + 1 / 2 / 3 (Switch Virtual Spaces)
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault()
        setActiveSpace(parseInt(e.key, 10))
        return
      }

      // 4. Alt + Arrow Keys (Window Snapping / Tile)
      if (e.altKey && activeWindowIdRef.current) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          soundService.playClick()
          snapWindow(activeWindowIdRef.current, 'left')
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          soundService.playClick()
          snapWindow(activeWindowIdRef.current, 'right')
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          soundService.playClick()
          snapWindow(activeWindowIdRef.current, 'top')
        }
      }

      // 5. Spacebar (Desktop Icon Quick Look)
      if ((e.code === 'Space' || e.key === ' ') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (desktopQuickLookFileRef.current) {
          e.preventDefault()
          setDesktopQuickLookFile(null)
          return
        }

        if (selectedIconIdRef.current && !activeWindowIdRef.current) {
          e.preventDefault()
          const appDef = getAppById(selectedIconIdRef.current)
          if (appDef) {
            setDesktopQuickLookFile({
              id: appDef.id,
              name: appDef.title,
              title: appDef.title,
              type: 'app',
              category: appDef.category || 'app',
              description: `Payaman OS Built-in Application (${appDef.title})`,
              iconType: appDef.iconType,
            })
          }
        }
      }
    }

    const handleKeyUp = (e) => {
      if ((e.key === 'Alt' || e.key === 'Meta') && switcherRef.current.isOpen) {
        const winList = windowsRef.current
        const targetIndex = switcherRef.current.selectedIndex
        const targetWin = winList[targetIndex]
        setSwitcher({ isOpen: false, selectedIndex: 0 })

        if (targetWin) {
          soundService.playClick()
          if (targetWin.isMinimized) {
            openApp(targetWin.appId)
          }
          focusWindow(targetWin.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [snapWindow, focusWindow, openApp, closeModal, setActiveSpace, setSwitcher, setContextMenu, setDesktopQuickLookFile])
}
