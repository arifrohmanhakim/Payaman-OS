import { memo, useCallback, Suspense } from 'react'
import Window from '../../Window.jsx'
import ErrorBoundary from '../../common/ErrorBoundary.jsx'
import AppLoadingFallback from '../../common/AppLoadingFallback.jsx'
import { getAppById } from '../../../apps/appRegistry.js'

const WindowAppContent = memo(function WindowAppContent({
  appId,
  windowId,
  windowData,
  onClose,
}) {
  const appDef = getAppById(appId)
  if (!appDef || !appDef.component) {
    return null
  }
  const AppComponent = appDef.component
  const handleClose = useCallback(() => {
    onClose(windowId)
  }, [onClose, windowId])

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback title={appDef.title} />}>
        <AppComponent onClose={handleClose} windowData={windowData} />
      </Suspense>
    </ErrorBoundary>
  )
})

export default memo(function DesktopWindowsLayer({
  windows,
  activeSpace,
  activeWindowId,
  onFocusWindow,
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onSnapWindow,
  onPositionChange,
  onSizeChange,
  onContextMenu,
}) {
  const filteredWindows = windows.filter(
    (win) => (win.space || 1) === (activeSpace || 1)
  )

  return (
    <>
      {filteredWindows.map((win) => (
        <Window
          key={win.id}
          windowData={win}
          isActive={activeWindowId === win.id}
          onFocus={onFocusWindow}
          onClose={onCloseWindow}
          onMinimize={onMinimizeWindow}
          onMaximize={onMaximizeWindow}
          onSnap={onSnapWindow}
          onPositionChange={onPositionChange}
          onSizeChange={onSizeChange}
          onContextMenu={onContextMenu}
        >
          <WindowAppContent
            appId={win.appId}
            windowId={win.id}
            windowData={win}
            onClose={onCloseWindow}
          />
        </Window>
      ))}
    </>
  )
})
