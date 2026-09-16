import { useState } from 'react'
import MenuBar from '../MenuBar.jsx'
import DesktopIcon from '../DesktopIcon.jsx'
import Window from '../Window.jsx'
import ModalDialog from '../ModalDialog.jsx'
import Dock from './Dock.jsx'
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
  } = useOS()

  const desktopApps = getDesktopApps()
  const { getIconPosition, setIconPosition } = useDesktopIcons()

  const handleMenuAction = (action) => {
    switch (action) {
      case 'about':
        openApp('about')
        break
      case 'preferences':
        openApp('preferences')
        break
      case 'new_note':
        openApp('write')
        break
      case 'calculator':
        openApp('calc')
        break
      case 'terminal':
        openApp('terminal')
        break
      case 'close_active':
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        break
      case 'clean_desktop':
        setSelectedIconId(null)
        break
      case 'empty_trash':
        showModal({
          type: 'empty_trash',
          title: 'Kosongkan Tong Sampah',
          message: 'Apakah Anda yakin ingin menghapus semua berkas secara permanen?',
          onConfirm: () => {
            closeModal()
          },
        })
        break
      case 'restart':
        showModal({
          type: 'restart',
          title: 'Mulai Ulang Sistem',
          message: 'Payaman OS akan memuat ulang sesi desktop Anda.',
          onConfirm: () => {
            window.location.reload()
          },
        })
        break
      default:
        break
    }
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
      onClick={() => setSelectedIconId(null)}
      className={`relative w-screen h-screen overflow-hidden font-mono text-[var(--os-fg)] select-none ${patternClass}`}
    >
      <MenuBar onSelectMenuAction={handleMenuAction} />

      <main className="absolute inset-0 pt-6 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
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
