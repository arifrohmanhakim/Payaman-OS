import { OSProvider } from './context/OSContext.jsx'
import { useOS } from './hooks/useOS.js'
import Desktop from './components/system/Desktop.jsx'
import BootScreen from './components/system/BootScreen.jsx'
import WelcomeScreen from './components/system/WelcomeScreen.jsx'

function OSShell() {
  const { systemPhase, enterWelcome, enterDesktop, reboot } = useOS()

  if (systemPhase === 'booting') {
    return <BootScreen onBootComplete={enterWelcome} />
  }

  if (systemPhase === 'welcome') {
    return <WelcomeScreen onEnterDesktop={enterDesktop} onReboot={reboot} />
  }

  return <Desktop />
}

export default function App() {
  return (
    <OSProvider>
      <OSShell />
    </OSProvider>
  )
}
