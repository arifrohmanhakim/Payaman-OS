import { useState, useCallback } from 'react'
import MenuBar from '../MenuBar.jsx'
import DesktopIconsLayer from './desktop/DesktopIconsLayer.jsx'
import DesktopWindowsLayer from './desktop/DesktopWindowsLayer.jsx'
import DesktopModalsLayer from './desktop/DesktopModalsLayer.jsx'
import { useTheme, useOSWindowManager, useSystemUI } from '../../hooks/useOS.js'
import { useDesktopIcons } from '../../hooks/useDesktopIcons.js'
import { useDesktopWidgets } from '../../hooks/useDesktopWidgets.js'
import { getDesktopApps } from '../../apps/appRegistry.js'
import { useDesktopShortcuts } from './desktop/useDesktopShortcuts.js'
import { useDesktopContextMenu } from './desktop/useDesktopContextMenu.js'
import { useDesktopFileDrop } from './desktop/useDesktopFileDrop.js'
import { useDesktopMenuActions } from './desktop/useDesktopMenuActions.js'

export default function Desktop() {
  const [selectedIconId, setSelectedIconId] = useState(null)
  const [isWidgetGalleryOpen, setIsWidgetGalleryOpen] = useState(false)
  const [desktopQuickLookFile, setDesktopQuickLookFile] = useState(null)
  const [switcher, setSwitcher] = useState({ isOpen: false, selectedIndex: 0 })

  const {
    theme,
    customThemeColors,
    pattern,
    customWallpaper,
    displaySettings,
    crtScanlines,
  } = useTheme()

  const {
    windows,
    activeWindowId,
    activeModal,
    activeSpace,
    setActiveSpace,
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
  } = useOSWindowManager()

  const {
    toggleLaunchpad,
    toggleSpotlight,
    isScreenSaverActive,
    screenSaverMode,
    startScreenSaver,
    dismissScreenSaver,
    resetSession,
    reboot,
  } = useSystemUI()

  const uiScale = displaySettings?.scale || 1.15
  const desktopApps = getDesktopApps()

  const {
    getIconPosition,
    setIconPosition,
    cleanUpIcons,
    sortIconsByName,
  } = useDesktopIcons(uiScale)

  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    resetWidgets,
    clearAllWidgets,
  } = useDesktopWidgets(uiScale)

  const {
    contextMenu,
    setContextMenu,
    closeContextMenu,
    handleDesktopContextMenu,
    handleIconContextMenu,
    handleWindowContextMenu,
    handleDockItemContextMenu,
    handleDockCanvasContextMenu,
  } = useDesktopContextMenu({
    windows,
    openApp,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    snapWindow,
    cleanUpIcons,
    sortIconsByName,
    startScreenSaver,
    showModal,
    closeModal,
    setSelectedIconId,
    setDesktopQuickLookFile,
    setIsWidgetGalleryOpen,
  })

  useDesktopShortcuts({
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
  })

  const {
    isDragOverFile,
    handleDragOver,
    handleDragLeave,
    handleDropFiles,
  } = useDesktopFileDrop({ openApp, showModal, closeModal })

  const { handleMenuAction } = useDesktopMenuActions({
    activeWindowId,
    startScreenSaver,
    toggleSpotlight,
    toggleLaunchpad,
    openApp,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    focusWindow,
    showModal,
    closeModal,
    resetSession,
    reboot,
    setSelectedIconId,
    setIsWidgetGalleryOpen,
  })

  const handleFocusWindow = useCallback(
    (id) => {
      focusWindow(id)
      closeContextMenu()
    },
    [focusWindow, closeContextMenu]
  )

  const handleSelectIcon = useCallback(
    (id) => {
      setSelectedIconId(id)
      closeContextMenu()
    },
    [closeContextMenu]
  )

  const handleBackgroundClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        setSelectedIconId(null)
        focusWindow(null)
        closeContextMenu()
      }
    },
    [focusWindow, closeContextMenu]
  )

  const patternClass = `pattern-${pattern || 'halftone'}`

  return (
    <div
      data-theme={theme || 'classic'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropFiles}
      onClick={handleBackgroundClick}
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
      {/* File Drag & Drop Overlay Zone */}
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

      {/* Custom Wallpaper */}
      {customWallpaper && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url(${customWallpaper})` }}
        >
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        </div>
      )}

      {/* Top Menu Bar */}
      <MenuBar onSelectMenuAction={handleMenuAction} />

      {/* Desktop Icons, Widgets, Stickies Layer */}
      <DesktopIconsLayer
        desktopApps={desktopApps}
        selectedIconId={selectedIconId}
        widgets={widgets}
        uiScale={uiScale}
        getIconPosition={getIconPosition}
        setIconPosition={setIconPosition}
        updateWidgetPosition={updateWidgetPosition}
        removeWidget={removeWidget}
        onSelectIcon={handleSelectIcon}
        onOpenApp={openApp}
        onContextMenu={handleDesktopContextMenu}
        onIconContextMenu={handleIconContextMenu}
      />

      {/* Floating Windows Layer */}
      <DesktopWindowsLayer
        windows={windows}
        activeSpace={activeSpace}
        activeWindowId={activeWindowId}
        onFocusWindow={handleFocusWindow}
        onCloseWindow={closeWindow}
        onMinimizeWindow={minimizeWindow}
        onMaximizeWindow={toggleMaximizeWindow}
        onSnapWindow={snapWindow}
        onPositionChange={updateWindowPosition}
        onSizeChange={updateWindowSize}
        onContextMenu={handleWindowContextMenu}
      />

      {/* Overlays, Modals, System UI, Dock Layer */}
      <DesktopModalsLayer
        windows={windows}
        activeModal={activeModal}
        closeModal={closeModal}
        isScreenSaverActive={isScreenSaverActive}
        screenSaverMode={screenSaverMode}
        dismissScreenSaver={dismissScreenSaver}
        switcher={switcher}
        contextMenu={contextMenu}
        closeContextMenu={closeContextMenu}
        isWidgetGalleryOpen={isWidgetGalleryOpen}
        setIsWidgetGalleryOpen={setIsWidgetGalleryOpen}
        widgetsActions={{ addWidget, resetWidgets, clearAllWidgets }}
        desktopQuickLookFile={desktopQuickLookFile}
        setDesktopQuickLookFile={setDesktopQuickLookFile}
        openApp={openApp}
        onDockItemContextMenu={handleDockItemContextMenu}
        onDockCanvasContextMenu={handleDockCanvasContextMenu}
      />
    </div>
  )
}
