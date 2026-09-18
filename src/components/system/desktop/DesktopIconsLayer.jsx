import { memo } from 'react'
import DesktopIcon from '../../DesktopIcon.jsx'
import DesktopWidgets from '../../widgets/DesktopWidgets.jsx'
import DesktopStickyNotes from '../../../apps/stickynotes/DesktopStickyNotes.jsx'

export default memo(function DesktopIconsLayer({
  desktopApps,
  selectedIconId,
  widgets,
  uiScale,
  getIconPosition,
  setIconPosition,
  updateWidgetPosition,
  removeWidget,
  onSelectIcon,
  onOpenApp,
  onContextMenu,
  onIconContextMenu,
}) {
  return (
    <main className="absolute inset-0 pt-6 pointer-events-none">
      <div
        onContextMenu={onContextMenu}
        className="relative w-full h-full pointer-events-auto"
      >
        <DesktopWidgets
          widgets={widgets}
          uiScale={uiScale}
          onPositionChange={updateWidgetPosition}
          onCloseWidget={removeWidget}
        />

        <DesktopStickyNotes />

        {desktopApps.map((app, index) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            iconType={app.iconType}
            position={getIconPosition(app.id, index)}
            isSelected={selectedIconId === app.id}
            onSelect={onSelectIcon}
            onOpen={onOpenApp}
            onPositionChange={setIconPosition}
            onContextMenu={onIconContextMenu}
          />
        ))}
      </div>
    </main>
  )
})
