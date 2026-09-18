import { useThemeContext } from '../context/ThemeContext.jsx'
import { useDockContext } from '../context/DockContext.jsx'
import { useSystemUIContext } from '../context/SystemUIContext.jsx'
import { useWindowManagerContext } from '../context/WindowManagerContext.jsx'

export function useOS() {
  const theme = useThemeContext()
  const dock = useDockContext()
  const systemUI = useSystemUIContext()
  const windowManager = useWindowManagerContext()

  return {
    ...theme,
    ...dock,
    ...systemUI,
    ...windowManager,
  }
}

export {
  useThemeContext as useTheme,
  useDockContext as useDockSettings,
  useSystemUIContext as useSystemUI,
  useWindowManagerContext as useOSWindowManager,
}
