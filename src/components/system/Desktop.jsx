import { useState } from 'react'
import MenuBar from '../MenuBar.jsx'
import DesktopIcon from '../DesktopIcon.jsx'
import Window from '../Window.jsx'
import ModalDialog from '../ModalDialog.jsx'
import Dock from './Dock.jsx'
import Launchpad from './Launchpad.jsx'
import ErrorBoundary from '../common/ErrorBoundary.jsx'
import { useOS } from '../../hooks/useOS.js'
import { useDesktopIcons } from '../../hooks/useDesktopIcons.js'
import { getDesktopApps, getAppById } from '../../apps/appRegistry.js'

export default function Desktop() {
  const [selectedIconId, setSelectedIconId] = useState(null)
  const {
    windows,
    activeWindowId,
    activeModal,
    theme,
    pattern,
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
  } = useOS()

  const desktopApps = getDesktopApps()
  const { getIconPosition, setIconPosition } = useDesktopIcons()

  const handleMenuAction = (action, activeAppId) => {
    switch (action) {
      case 'launchpad':
        toggleLaunchpad()
        break
      case 'about':
        openApp('about')
        break
      case 'preferences':
        openApp('preferences')
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
          message: 'Payaman OS will reload your desktop session.',
          onConfirm: () => {
            window.location.reload()
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

  const renderWindowContent = (appId, windowId) => {
    const appDef = getAppById(appId)
    if (!appDef || !appDef.component) {
      return null
    }
    const AppComponent = appDef.component
    return (
      <ErrorBoundary>
        <AppComponent onClose={() => closeWindow(windowId)} />
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
        }
      }}
      className={`relative w-screen h-screen overflow-hidden font-mono text-[var(--os-fg)] select-none ${patternClass}`}
    >
      <MenuBar onSelectMenuAction={handleMenuAction} />

      <main className="absolute inset-0 pt-6 pointer-events-none">
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedIconId(null)
              focusWindow(null)
            }
          }}
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
              onSelect={(id) => setSelectedIconId(id)}
              onOpen={(id) => openApp(id)}
              onPositionChange={setIconPosition}
            />
          ))}
        </div>
      </main>

      {windows.map((win) => (
        <Window
          key={win.id}
          windowData={win}
          isActive={activeWindowId === win.id}
          onFocus={focusWindow}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={toggleMaximizeWindow}
          onPositionChange={updateWindowPosition}
          onSizeChange={updateWindowSize}
        >
          {renderWindowContent(win.appId, win.id)}
        </Window>
      ))}

      <Dock />

      <Launchpad />

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
