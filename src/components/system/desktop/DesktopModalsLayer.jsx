import { memo } from 'react'
import Dock from '../Dock.jsx'
import Launchpad from '../Launchpad.jsx'
import SpotlightSearch from '../SpotlightSearch.jsx'
import ScreenSaver from '../ScreenSaver.jsx'
import AppSwitcher from '../AppSwitcher.jsx'
import ModalDialog from '../../ModalDialog.jsx'
import ContextMenu from '../../common/ContextMenu.jsx'
import DesktopPetSprite from '../../../apps/pet/DesktopPetSprite.jsx'
import WidgetGalleryModal from '../../widgets/WidgetGalleryModal.jsx'
import QuickLookModal from '../../common/QuickLookModal.jsx'
import RetroTooltip from '../../common/RetroTooltip.jsx'

export default memo(function DesktopModalsLayer({
  windows,
  activeModal,
  closeModal,
  isScreenSaverActive,
  screenSaverMode,
  dismissScreenSaver,
  switcher,
  contextMenu,
  closeContextMenu,
  isWidgetGalleryOpen,
  setIsWidgetGalleryOpen,
  widgetsActions,
  desktopQuickLookFile,
  setDesktopQuickLookFile,
  openApp,
  onDockItemContextMenu,
  onDockCanvasContextMenu,
}) {
  return (
    <>
      {/* Floating Desktop Pet */}
      <DesktopPetSprite />

      {/* Dock */}
      <Dock
        onItemContextMenu={onDockItemContextMenu}
        onCanvasContextMenu={onDockCanvasContextMenu}
      />

      {/* Launchpad & Spotlight */}
      <Launchpad />
      <SpotlightSearch />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={closeContextMenu}
      />

      {/* System Modal Dialog */}
      <ModalDialog
        isOpen={Boolean(activeModal)}
        title={activeModal?.title}
        message={activeModal?.message}
        onConfirm={activeModal?.onConfirm}
        onCancel={closeModal}
      />

      {/* Screen Saver */}
      <ScreenSaver
        isActive={isScreenSaverActive}
        onDismiss={dismissScreenSaver}
        mode={screenSaverMode}
      />

      {/* App Switcher (Alt+Tab) */}
      <AppSwitcher
        isOpen={switcher.isOpen}
        windows={windows}
        selectedIndex={switcher.selectedIndex}
      />

      {/* Desktop Widgets Selection Modal */}
      <WidgetGalleryModal
        isOpen={isWidgetGalleryOpen}
        onClose={() => setIsWidgetGalleryOpen(false)}
        onAddWidget={widgetsActions.addWidget}
        onResetWidgets={widgetsActions.resetWidgets}
        onClearWidgets={widgetsActions.clearAllWidgets}
      />

      {/* Desktop Quick Look Modal */}
      <QuickLookModal
        file={desktopQuickLookFile}
        isOpen={Boolean(desktopQuickLookFile)}
        onClose={() => setDesktopQuickLookFile(null)}
        onOpenWithApp={(f) => {
          if (f.id) openApp(f.id)
        }}
      />

      {/* Global Retro Tooltip System */}
      <RetroTooltip />
    </>
  )
})
