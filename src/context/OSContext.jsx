import { ThemeProvider } from './ThemeContext.jsx'
import { SystemUIProvider } from './SystemUIContext.jsx'
import { DockProvider } from './DockContext.jsx'
import { WindowManagerProvider } from './WindowManagerContext.jsx'

export function OSProvider({ children }) {
  return (
    <ThemeProvider>
      <SystemUIProvider>
        <DockProvider>
          <WindowManagerProvider>
            {children}
          </WindowManagerProvider>
        </DockProvider>
      </SystemUIProvider>
    </ThemeProvider>
  )
}
