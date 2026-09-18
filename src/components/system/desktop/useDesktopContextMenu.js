import { useState, useCallback } from 'react'
import { soundService } from '../../../services/soundService.js'
import { fileSystemService } from '../../../services/fileSystemService.js'
import { getAppById } from '../../../apps/appRegistry.js'

export function useDesktopContextMenu({
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
}) {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  })

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
            label: 'New Folder',
            icon: 'folder',
            shortcut: '⇧⌘N',
            onSelect: () => openApp('files'),
          },
          {
            label: 'New Note',
            icon: 'write',
            shortcut: '⌘N',
            onSelect: () => openApp('write'),
          },
          { divider: true },
          {
            label: 'Desktop Widgets...',
            icon: 'calculator',
            shortcut: '⌥W',
            onSelect: () => setIsWidgetGalleryOpen(true),
          },
          { divider: true },
          {
            label: 'Clean Up Icons',
            icon: 'grid',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
          {
            label: 'Sort by Name (A-Z)',
            icon: 'list',
            onSelect: () => {
              sortIconsByName()
              soundService.playClick()
            },
          },
          { divider: true },
          {
            label: 'Change Appearance...',
            icon: 'preferences',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'appearance' }),
          },
          {
            label: 'Start Screen Saver',
            icon: 'moon',
            onSelect: () => startScreenSaver(),
          },
        ],
      })
    },
    [openApp, cleanUpIcons, sortIconsByName, startScreenSaver, setIsWidgetGalleryOpen, setSelectedIconId]
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
            icon: appDef?.iconType || 'apps',
            shortcut: '↵',
            onSelect: () => openApp(iconId),
          },
          {
            label: 'Quick Look...',
            icon: 'eye',
            shortcut: 'Space',
            onSelect: () => {
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
            },
          },
          {
            label: 'Get Info...',
            icon: 'about',
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
            icon: 'grid',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
        ],
      })
    },
    [openApp, cleanUpIcons, setDesktopQuickLookFile, setSelectedIconId]
  )

  const handleWindowContextMenu = useCallback(
    (e, windowData) => {
      soundService.playClick()
      focusWindow(windowData.id)

      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            header: windowData.title,
          },
          {
            label: 'Minimize',
            icon: 'moon',
            shortcut: '⌘M',
            onSelect: () => minimizeWindow(windowData.id),
          },
          {
            label: windowData.isMaximized ? 'Restore Window' : 'Maximize',
            icon: 'grid',
            shortcut: '⌘+',
            onSelect: () => toggleMaximizeWindow(windowData.id),
          },
          { divider: true },
          {
            label: 'Tile Left (Split Screen)',
            icon: 'list',
            shortcut: '⌥←',
            onSelect: () => snapWindow(windowData.id, 'left'),
          },
          {
            label: 'Tile Right (Split Screen)',
            icon: 'list',
            shortcut: '⌥→',
            onSelect: () => snapWindow(windowData.id, 'right'),
          },
          { divider: true },
          {
            label: 'Close Window',
            icon: 'trash',
            shortcut: '⌘W',
            onSelect: () => closeWindow(windowData.id),
          },
        ],
      })
    },
    [focusWindow, minimizeWindow, toggleMaximizeWindow, snapWindow, closeWindow]
  )

  const handleDockItemContextMenu = useCallback(
    (e, appId) => {
      soundService.playClick()
      const appDef = getAppById(appId)
      const appTitle = appDef?.title || appId
      const existingWindow = windows.find((w) => w.appId === appId)
      const isOpen = Boolean(existingWindow)
      const isMinimized = existingWindow?.isMinimized

      const isTrash = appId === 'wastebasket'
      const isTrashEmpty = fileSystemService.isTrashEmpty()

      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            header: isTrash ? 'Trash' : appTitle,
          },
          {
            label: isOpen
              ? isMinimized
                ? 'Restore Window'
                : 'Bring to Front'
              : `Open ${isTrash ? 'Trash' : appTitle}`,
            icon: appDef?.iconType || 'apps',
            shortcut: '↵',
            onSelect: () => {
              openApp(appId)
            },
          },
          ...(isTrash
            ? [
                {
                  label: 'Empty Trash',
                  icon: 'trash',
                  disabled: isTrashEmpty,
                  onSelect: () => {
                    if (!isTrashEmpty) {
                      showModal({
                        type: 'empty_trash',
                        title: 'Empty Trash',
                        message: 'Are you sure you want to permanently delete all items in trash?',
                        onConfirm: () => {
                          fileSystemService.emptyTrash()
                          soundService.playTrashEmpty()
                          closeModal()
                        },
                      })
                    }
                  },
                },
              ]
            : []),
          ...(isOpen
            ? [
                {
                  label: 'Close Window',
                  icon: 'trash',
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
            icon: 'about',
            shortcut: '⌘I',
            onSelect: () =>
              openApp('about', {
                targetAppId: appId,
                title: `About ${appTitle}`,
              }),
          },
          {
            label: 'Dock Preferences...',
            icon: 'preferences',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'dock' }),
          },
        ],
      })
    },
    [windows, openApp, closeWindow, showModal, closeModal]
  )

  const handleDockCanvasContextMenu = useCallback(
    (e) => {
      soundService.playClick()
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            header: 'Dock Options',
          },
          {
            label: 'Dock Preferences...',
            icon: 'preferences',
            shortcut: '⌘,',
            onSelect: () => openApp('preferences', { initialTab: 'dock' }),
          },
          { divider: true },
          {
            label: 'Clean Up Icons',
            icon: 'grid',
            onSelect: () => {
              cleanUpIcons()
              soundService.playClick()
            },
          },
        ],
      })
    },
    [openApp, cleanUpIcons]
  )

  return {
    contextMenu,
    setContextMenu,
    closeContextMenu,
    handleDesktopContextMenu,
    handleIconContextMenu,
    handleWindowContextMenu,
    handleDockItemContextMenu,
    handleDockCanvasContextMenu,
  }
}
