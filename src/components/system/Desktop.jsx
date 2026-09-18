import { useState, useCallback, useEffect, useRef } from 'react'
import MenuBar from '../MenuBar.jsx'
import DesktopIcon from '../DesktopIcon.jsx'
import Window from '../Window.jsx'
import ModalDialog from '../ModalDialog.jsx'
import Dock from './Dock.jsx'
import Launchpad from './Launchpad.jsx'
import SpotlightSearch from './SpotlightSearch.jsx'
import ScreenSaver from './ScreenSaver.jsx'
import AppSwitcher from './AppSwitcher.jsx'
import ErrorBoundary from '../common/ErrorBoundary.jsx'
import ContextMenu from '../common/ContextMenu.jsx'
import DesktopPetSprite from '../../apps/pet/DesktopPetSprite.jsx'
import DesktopStickyNotes from '../../apps/stickynotes/DesktopStickyNotes.jsx'
import { soundService } from '../../services/soundService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { useOS } from '../../hooks/useOS.js'
import { useDesktopIcons } from '../../hooks/useDesktopIcons.js'
import { getDesktopApps, getAppById } from '../../apps/appRegistry.js'

export default function Desktop() {
  const [selectedIconId, setSelectedIconId] = useState(null)
  const [isDragOverFile, setIsDragOverFile] = useState(false)
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  })

  const [switcher, setSwitcher] = useState({
    isOpen: false,
    selectedIndex: 0,
  })

  const {
    windows,
    activeWindowId,
    activeModal,
    theme,
    customThemeColors,
    pattern,
    customWallpaper,
    displaySettings,
    activeSpace,
    setActiveSpace,
    crtScanlines,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    snapWindow,
    updateWindowPosition,
    updateWindowSize,
    showModal,
    closeModal,
    toggleLaunchpad,
    toggleSpotlight,
    isScreenSaverActive,
    screenSaverMode,
    startScreenSaver,
    dismissScreenSaver,
    resetSession,
    reboot,
  } = useOS()

  const uiScale = displaySettings?.scale || 1.15
  const desktopApps = getDesktopApps()
  const {
    getIconPosition,
    setIconPosition,
    cleanUpIcons,
    sortIconsByName,
    resetPositions,
  } = useDesktopIcons(uiScale)

  const windowsRef = useRef(windows)
  const switcherRef = useRef(switcher)
  const activeWindowIdRef = useRef(activeWindowId)
  const activeModalRef = useRef(activeModal)
  const contextMenuRef = useRef(contextMenu)

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
    const handleKeyDown = (e) => {
      // 1. Esc Key (Close modal, context menu, switcher, etc.)
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
  }, [snapWindow, focusWindow, openApp, closeModal])

  const handleMenuAction = (action, activeAppId) => {
    switch (action) {
      case 'screensaver':
      case 'start_screensaver':
        startScreenSaver()
        break
      case 'toggle_fullscreen':
      case 'fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        }
        break
      case 'displays':
        openApp('preferences', { initialTab: 'display' })
        break
      case 'spotlight':
        toggleSpotlight()
        break
      case 'launchpad':
        toggleLaunchpad()
        break
      case 'about':
      case 'about_os':
        openApp('about', { targetAppId: 'system', title: 'About Payaman OS' })
        break
      case 'about_finder':
        openApp('about', { targetAppId: 'finder', title: 'About Finder' })
        break
      case 'about_app': {
        const appDef = getAppById(activeAppId)
        const appTitle = appDef?.title || activeAppId || 'Payaman OS'
        openApp('about', {
          targetAppId: activeAppId || 'system',
          title: `About ${appTitle}`,
        })
        break
      }
      case 'help_os':
        openApp('about', {
          targetAppId: 'system',
          title: 'Payaman OS Help',
          initialTab: 'help',
        })
        break
      case 'help_app': {
        const appDef = getAppById(activeAppId)
        const appTitle = appDef?.title || activeAppId || 'Payaman OS'
        openApp('about', {
          targetAppId: activeAppId || 'system',
          title: `${appTitle} Help`,
          initialTab: 'help',
        })
        break
      }
      case 'portfolio':
      case 'profile':
      case 'developer':
        openApp('portfolio')
        break
      case 'preferences':
        openApp('preferences')
        break
      case 'itunes':
      case 'music':
        openApp('itunes')
        break
      case 'pet':
      case 'desktoppet':
        openApp('pet')
        break
      case 'browser':
        openApp('browser')
        break
      case 'weather':
        openApp('weather')
        break
      case 'maps':
        openApp('maps')
        break
      case 'chat':
      case 'payamanchat':
        openApp('chat')
        break
      case 'files':
      case 'open_files':
        openApp('files')
        break
      case 'gallery':
        openApp('gallery')
        break
      case 'photobot':
        openApp('photobot')
        break
      case 'paint':
        openApp('paint')
        break
      case 'new_note':
        openApp('write')
        break
      case 'calendar':
        openApp('calendar')
        break
      case 'calculator':
        openApp('calc')
        break
      case 'sheets':
      case 'payamancalc':
      case 'spreadsheet':
        openApp('sheets')
        break
      case 'minesweeper':
        openApp('minesweeper')
        break
      case 'stickynotes':
      case 'stickies':
        openApp('stickynotes')
        break
      case 'snake':
        openApp('snake')
        break
      case 'terminal':
        openApp('terminal')
        break
      case 'wastebasket':
        openApp('wastebasket')
        break
      case 'close_active':
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        break
      case 'minimize_active':
        if (activeWindowId) {
          minimizeWindow(activeWindowId)
        }
        break
      case 'zoom_active':
        if (activeWindowId) {
          toggleMaximizeWindow(activeWindowId)
        }
        break
      case 'bring_all_front':
        if (activeWindowId) {
          focusWindow(activeWindowId)
        }
        break
      case 'clean_desktop':
        setSelectedIconId(null)
        break
      case 'reset_session':
        showModal({
          type: 'reset_session',
          title: 'Reset Window Session',
          message: 'Do you want to restore desktop window arrangement to default?',
          onConfirm: () => {
            resetSession()
            closeModal()
          },
        })
        break
      case 'empty_trash':
        showModal({
          type: 'empty_trash',
          title: 'Empty Trash',
          message: 'Are you sure you want to permanently delete all items in trash?',
          onConfirm: () => {
            closeModal()
          },
        })
        break
      case 'restart':
        showModal({
          type: 'restart',
          title: 'Restart System',
          message: 'Payaman OS will reboot the session.',
          onConfirm: () => {
            reboot()
            closeModal()
          },
        })
        break
      case 'go_home':
      case 'go_documents':
      case 'go_system':
      case 'go_root':
        openApp('files')
        break
      default:
        break
    }

    window.dispatchEvent(
      new CustomEvent('payaman-menu-action', {
        detail: { action, activeAppId },
      })
    )
  }

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev))
  }, [])

  const handleDesktopContextMenu = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      soundService.playClick()
      setSelectedIconId(null)

      setContextMenu({
        isOpen: true,
        x: Math.round(e.clientX / uiScale),
        y: Math.round(e.clientY / uiScale),
        items: [
          {
            label: 'New Folder',
            shortcut: '⇧⌘N',
            onSelect: () => openApp('files'),
          },
          {
            label: 'New Note',
            shortcut: '⌘N',
            onSelect: () => openApp('write'),
          },
          { divider: true },
          {
            label: 'Clean Up Icons',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
          {
            label: 'Sort by Name (A-Z)',
            onSelect: () => {
              sortIconsByName()
              soundService.playClick()
            },
          },
          { divider: true },
          {
            label: 'Change Appearance...',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'appearance' }),
          },
          {
            label: 'Start Screen Saver',
            onSelect: () => startScreenSaver(),
          },
        ],
      })
    },
    [
      openApp,
      cleanUpIcons,
      sortIconsByName,
      startScreenSaver,
      uiScale,
    ]
  )

  const handleIconContextMenu = useCallback(
    (e, iconId) => {
      e.preventDefault()
      e.stopPropagation()
      soundService.playClick()
      setSelectedIconId(iconId)

      const appDef = getAppById(iconId)
      const appTitle = appDef?.title || iconId

      setContextMenu({
        isOpen: true,
        x: Math.round(e.clientX / uiScale),
        y: Math.round(e.clientY / uiScale),
        items: [
          {
            header: appTitle,
          },
          {
            label: `Open ${appTitle}`,
            shortcut: '↵',
            onSelect: () => openApp(iconId),
          },
          {
            label: 'Get Info...',
            shortcut: '⌘I',
            onSelect: () =>
              openApp('about', {
                targetAppId: iconId,
                title: `About ${appTitle}`,
              }),
          },
          { divider: true },
          {
            label: 'Clean Up Icons',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
        ],
      })
    },
    [openApp, cleanUpIcons, uiScale]
  )

  const handleWindowContextMenu = useCallback(
    (e, windowData) => {
      soundService.playClick()
      focusWindow(windowData.id)

      setContextMenu({
        isOpen: true,
        x: Math.round(e.clientX / uiScale),
        y: Math.round(e.clientY / uiScale),
        items: [
          {
            header: windowData.title,
          },
          {
            label: 'Minimize',
            shortcut: '⌘M',
            onSelect: () => minimizeWindow(windowData.id),
          },
          {
            label: windowData.isMaximized ? 'Restore Window' : 'Maximize',
            shortcut: '⌘+',
            onSelect: () => toggleMaximizeWindow(windowData.id),
          },
          { divider: true },
          {
            label: 'Tile Left (Split Screen)',
            shortcut: '⌥←',
            onSelect: () => snapWindow(windowData.id, 'left'),
          },
          {
            label: 'Tile Right (Split Screen)',
            shortcut: '⌥→',
            onSelect: () => snapWindow(windowData.id, 'right'),
          },
          { divider: true },
          {
            label: 'Close Window',
            shortcut: '⌘W',
            onSelect: () => closeWindow(windowData.id),
          },
        ],
      })
    },
    [focusWindow, minimizeWindow, toggleMaximizeWindow, snapWindow, closeWindow, uiScale]
  )

  const handleDockItemContextMenu = useCallback(
    (e, appId) => {
      soundService.playClick()
      const appDef = getAppById(appId)
      const appTitle = appDef?.title || appId
      const existingWindow = windows.find((w) => w.appId === appId)
      const isOpen = Boolean(existingWindow)
      const isMinimized = existingWindow?.isMinimized

      setContextMenu({
        isOpen: true,
        x: Math.round(e.clientX / uiScale),
        y: Math.round(e.clientY / uiScale),
        items: [
          {
            header: appTitle,
          },
          {
            label: isOpen
              ? isMinimized
                ? 'Restore Window'
                : 'Bring to Front'
              : `Open ${appTitle}`,
            shortcut: '↵',
            onSelect: () => {
              openApp(appId)
            },
          },
          ...(isOpen
            ? [
                {
                  label: 'Close Window',
                  shortcut: '⌘W',
                  onSelect: () => {
                    if (existingWindow) closeWindow(existingWindow.id)
                  },
                },
              ]
            : []),
          { divider: true },
          {
            label: 'Get Info...',
            shortcut: '⌘I',
            onSelect: () =>
              openApp('about', {
                targetAppId: appId,
                title: `About ${appTitle}`,
              }),
          },
          {
            label: 'Dock Preferences...',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'dock' }),
          },
        ],
      })
    },
    [windows, openApp, closeWindow, uiScale]
  )

  const handleDockCanvasContextMenu = useCallback(
    (e) => {
      soundService.playClick()
      setContextMenu({
        isOpen: true,
        x: Math.round(e.clientX / uiScale),
        y: Math.round(e.clientY / uiScale),
        items: [
          {
            header: 'Dock Options',
          },
          {
            label: 'Dock Preferences...',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'dock' }),
          },
          { divider: true },
          {
            label: 'Clean Up Icons',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
        ],
      })
    },
    [openApp, cleanUpIcons, uiScale]
  )

  const handleDropFiles = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOverFile(false)

      const files = Array.from(e.dataTransfer.files || [])
      if (files.length === 0) return

      soundService.playClick()

      files.forEach((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''

        // 1. Spreadsheet (.xlsx, .xls, .csv)
        if (['xlsx', 'xls', 'csv'].includes(ext)) {
          fileSystemService.writeFile(`/home/arif/dokumen/${file.name}`, `[Imported Spreadsheet: ${file.name}]`)
          openApp('sheets', { importedFile: file, fileName: file.name })
          return
        }

        // 2. Images (.png, .jpg, .jpeg, .gif, .svg, .webp)
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
          const reader = new FileReader()
          reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target?.result
            if (dataUrl) {
              fileSystemService.writeFile(`/home/arif/dokumen/${file.name}`, dataUrl)
              openApp('gallery', { previewUrl: dataUrl, title: file.name })
            }
          }
          reader.readAsDataURL(file)
          return
        }

        // 3. Text / Markdown / Code / Document files
        const reader = new FileReader()
        reader.onload = (loadEvt) => {
          const text = loadEvt.target?.result
          if (typeof text === 'string') {
            fileSystemService.writeFile(`/home/arif/dokumen/${file.name}`, text)
            openApp('write', { initialContent: text, fileName: file.name })
          }
        }
        reader.readAsText(file)
      })

      showModal({
        type: 'file_imported',
        title: 'File Imported',
        message: `Successfully imported ${files.length} file(s) into Payaman OS (/home/arif/dokumen/).`,
        onConfirm: () => closeModal(),
      })
    },
    [openApp, showModal, closeModal]
  )

  const renderWindowContent = (appId, windowId, windowData) => {
    const appDef = getAppById(appId)
    if (!appDef || !appDef.component) {
      return null
    }
    const AppComponent = appDef.component
    return (
      <ErrorBoundary>
        <AppComponent
          onClose={() => closeWindow(windowId)}
          windowData={windowData}
        />
      </ErrorBoundary>
    )
  }

  const patternClass = `pattern-${pattern || 'halftone'}`
  const filteredWindows = windows.filter(
    (win) => (win.space || 1) === (activeSpace || 1)
  )

  return (
    <div
      data-theme={theme || 'classic'}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOverFile(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDragOverFile(false)
        }
      }}
      onDrop={handleDropFiles}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedIconId(null)
          focusWindow(null)
          closeContextMenu()
        }
      }}
      style={{
        zoom: uiScale !== 1.0 ? uiScale : undefined,
        width: uiScale !== 1.0 ? `calc(100vw / ${uiScale})` : '100vw',
        height: uiScale !== 1.0 ? `calc(100vh / ${uiScale})` : '100vh',
        ...(theme === 'custom' && customThemeColors
          ? {
              '--os-fg': customThemeColors.fg,
              '--os-bg': customThemeColors.bg,
              '--os-desktop-bg': customThemeColors.desktopBg,
              '--os-border': customThemeColors.fg,
              '--os-shadow': customThemeColors.fg,
              '--os-active-stripe': customThemeColors.fg,
            }
          : {}),
      }}
      className={`fixed inset-0 overflow-hidden font-mono text-[var(--os-fg)] select-none ${
        customWallpaper ? 'bg-neutral-900' : patternClass
      } ${crtScanlines ? 'crt-scanlines' : ''}`}
    >
      {/* Real File Drag & Drop Overlay Zone */}
      {isDragOverFile && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none p-6">
          <div className="border-4 border-dashed border-[var(--os-fg)] bg-[var(--os-bg)] text-[var(--os-fg)] p-8 text-center os-dialog-shadow space-y-2">
            <div className="text-3xl font-bold">📥</div>
            <div className="text-sm font-bold uppercase tracking-wider">
              Drop Files to Payaman OS
            </div>
            <div className="text-xs opacity-75">
              Supports Excel (.xlsx, .csv), Images (.png, .jpg), and Text (.txt, .md)
            </div>
          </div>
        </div>
      )}

      {customWallpaper && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url(${customWallpaper})` }}
        >
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        </div>
      )}

      <MenuBar onSelectMenuAction={handleMenuAction} />

      <main className="absolute inset-0 pt-6 pointer-events-none">
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedIconId(null)
              focusWindow(null)
              closeContextMenu()
            }
          }}
          onContextMenu={handleDesktopContextMenu}
          className="relative w-full h-full pointer-events-auto"
        >
          {desktopApps.map((app, index) => (
            <DesktopIcon
              key={app.id}
              id={app.id}
              title={app.title}
              iconType={app.iconType}
              position={getIconPosition(app.id, index)}
              isSelected={selectedIconId === app.id}
              onSelect={(id) => {
                setSelectedIconId(id)
                closeContextMenu()
              }}
              onOpen={(id) => openApp(id)}
              onPositionChange={setIconPosition}
              onContextMenu={handleIconContextMenu}
            />
          ))}
        </div>
      </main>

      {filteredWindows.map((win) => (
        <Window
          key={win.id}
          windowData={win}
          isActive={activeWindowId === win.id}
          onFocus={(id) => {
            focusWindow(id)
            closeContextMenu()
          }}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={toggleMaximizeWindow}
          onSnap={snapWindow}
          onPositionChange={updateWindowPosition}
          onSizeChange={updateWindowSize}
          onContextMenu={handleWindowContextMenu}
        >
          {renderWindowContent(win.appId, win.id, win)}
        </Window>
      ))}

      {/* Floating Desktop Pet */}
      <DesktopPetSprite />

      {/* Floating Desktop Sticky Notes */}
      <DesktopStickyNotes />

      <Dock
        onItemContextMenu={handleDockItemContextMenu}
        onCanvasContextMenu={handleDockCanvasContextMenu}
      />

      <Launchpad />

      <SpotlightSearch />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={closeContextMenu}
      />

      <ModalDialog
        isOpen={Boolean(activeModal)}
        title={activeModal?.title}
        message={activeModal?.message}
        onConfirm={activeModal?.onConfirm}
        onCancel={closeModal}
      />

      <ScreenSaver
        isActive={isScreenSaverActive}
        onDismiss={dismissScreenSaver}
        mode={screenSaverMode}
      />

      <AppSwitcher
        isOpen={switcher.isOpen}
        windows={windows}
        selectedIndex={switcher.selectedIndex}
      />
    </div>
  )
}
