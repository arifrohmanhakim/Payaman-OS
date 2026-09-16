import { OSProvider } from './context/OSContext.jsx'
import Desktop from './components/system/Desktop.jsx'

export default function App() {
  return (
    <OSProvider>
      <Desktop />
    </OSProvider>
  )
}
