import { useState, useCallback } from 'react'
import MenuBar from '../MenuBar.jsx'
import DesktopIcon from '../DesktopIcon.jsx'
import Window from '../Window.jsx'
import ModalDialog from '../ModalDialog.jsx'
import Dock from './Dock.jsx'
import Launchpad from './Launchpad.jsx'
import ErrorBoundary from '../common/ErrorBoundary.jsx'
import ContextMenu from '../common/ContextMenu.jsx'
import DesktopPetSprite from '../../apps/pet/DesktopPetSprite.jsx'
import { soundService } from '../../services/soundService.js'
import { useOS } from '../../hooks/useOS.js'
import { useDesktopIcons } from '../../hooks/useDesktopIcons.js'
import { getDesktopApps, getAppById } from '../../apps/appRegistry.js'

export default function Desktop() {
  const [selectedIconId, setSelectedIconId] = useState(null)
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  })

  const {
    windows,
    activeWindowId,
    activeModal,
    theme,
    pattern,
    customWallpaper,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    showModal,
    closeModal,
    toggleLaunchpad,
    resetSession,
    reboot,
  } = useOS()

  const desktopApps = getDesktopApps()
  const { getIconPosition, setIconPosition, resetPositions } = useDesktopIcons()

  const handleMenuAction = (action, activeAppId) => {
    switch (action) {
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
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            label: 'Developer Portfolio',
            icon: '👤',
            shortcut: '⌘P',
            onSelect: () => openApp('portfolio'),
          },
          {
            label: 'New Folder',
            icon: '📁',
            shortcut: '⇧⌘N',
            onSelect: () => openApp('files'),
          },
          {
            label: 'New Note',
            icon: '📝',
            shortcut: '⌘N',
            onSelect: () => openApp('write'),
          },
          {
            label: 'Open iTunes',
            icon: '🎵',
            onSelect: () => openApp('itunes'),
          },
          {
            label: 'Open Terminal',
            icon: '⚡',
            onSelect: () => openApp('terminal'),
          },
          {
            label: 'Open Browser',
            icon: '🌐',
            shortcut: '⌘B',
            onSelect: () => openApp('browser'),
          },
          { divider: true },
          {
            label: 'Clean Up Desktop',
            icon: '🧹',
            onSelect: () => {
              resetPositions()
              soundService.playClick()
            },
          },
          {
            label: 'Reset Window Session...',
            icon: '↺',
            onSelect: () => {
              showModal({
                type: 'reset_session',
                title: 'Reset Window Session',
                message: 'Do you want to restore desktop window arrangement to default?',
                onConfirm: () => {
                  resetSession()
                  closeModal()
                },
              })
            },
          },
          { divider: true },
          {
            label: 'Desktop Preferences...',
            icon: '🎨',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences'),
          },
          {
            label: 'About Payaman OS',
            icon: 'ℹ️',
            onSelect: () =>
              openApp('about', {
                targetAppId: 'system',
                title: 'About Payaman OS',
              }),
          },
        ],
      })
    },
    [openApp, resetPositions, resetSession, showModal, closeModal]
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
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            header: appTitle,
          },
          {
            label: `Open ${appTitle}`,
            icon: '🚀',
            shortcut: '↵',
            onSelect: () => openApp(iconId),
          },
          {
            label: 'Get Info...',
            icon: 'ℹ️',
            shortcut: '⌘I',
            onSelect: () =>
              openApp('about', {
                targetAppId: iconId,
                title: `About ${appTitle}`,
              }),
          },
          { divider: true },
          {
            label: 'Clean Up Desktop',
            icon: '🧹',
            onSelect: () => {
              resetPositions()
              soundService.playClick()
            },
          },
          {
            label: 'Close Active Windows',
            icon: '✕',
            disabled: !activeWindowId,
            onSelect: () => {
              if (activeWindowId) closeWindow(activeWindowId)
            },
          },
        ],
      })
    },
    [openApp, resetPositions, activeWindowId, closeWindow]
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

  return (
    <div
      data-theme={theme || 'classic'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedIconId(null)
          focusWindow(null)
          closeContextMenu()
        }
      }}
      onContextMenu={handleDesktopContextMenu}
      className={`relative w-screen h-screen overflow-hidden font-mono text-[var(--os-fg)] select-none ${
        customWallpaper ? 'bg-neutral-900' : patternClass
      }`}
    >
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

      {windows.map((win) => (
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
          onPositionChange={updateWindowPosition}
          onSizeChange={updateWindowSize}
        >
          {renderWindowContent(win.appId, win.id, win)}
        </Window>
      ))}

      {/* Floating Desktop Pet */}
      <DesktopPetSprite />

      <Dock />

      <Launchpad />

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
    </div>
  )
}
