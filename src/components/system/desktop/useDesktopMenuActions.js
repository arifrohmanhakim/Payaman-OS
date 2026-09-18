import { useCallback } from 'react'
import { soundService } from '../../../services/soundService.js'
import { fileSystemService } from '../../../services/fileSystemService.js'
import { getAppById } from '../../../apps/appRegistry.js'

export function useDesktopMenuActions({
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
}) {
  const handleMenuAction = useCallback(
    (action, activeAppId) => {
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
              fileSystemService.emptyTrash()
              soundService.playTrashEmpty()
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
        case 'desktop_widgets':
        case 'widgets':
          setIsWidgetGalleryOpen(true)
          break
        default:
          break
      }

      window.dispatchEvent(
        new CustomEvent('payaman-menu-action', {
          detail: { action, activeAppId },
        })
      )
    },
    [
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
    ]
  )

  return { handleMenuAction }
}
