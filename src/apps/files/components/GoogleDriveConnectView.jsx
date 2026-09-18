import { memo } from 'react'
import Button from '../../../components/ui/Button.jsx'
import AppIconGraphic from '../../../components/common/AppIconGraphic.jsx'

export default memo(function GoogleDriveConnectView({
  isLoading,
  errorMessage,
  onConnect,
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto">
      <div className="w-16 h-16 border-2 border-[var(--os-border)] rounded-full flex items-center justify-center p-3 os-window-shadow">
        <AppIconGraphic iconType="cloud" className="w-10 h-10" />
      </div>

      <div>
        <h3 className="text-sm font-bold">Google Drive</h3>
        <p className="text-[11px] opacity-70 mt-1">
          Connect your Google Drive account to access, view, and import files directly into Payaman OS.
        </p>
      </div>

      {errorMessage && (
        <div className="p-2 border border-red-500 bg-red-500/10 text-red-600 text-[10px] text-left w-full">
          {errorMessage}
        </div>
      )}

      <Button
        variant="primary"
        disabled={isLoading}
        onClick={onConnect}
        className="w-full py-2 flex items-center justify-center gap-2"
      >
        <AppIconGraphic iconType="preferences" className="w-3.5 h-3.5 shrink-0" />
        <span>{isLoading ? 'Connecting...' : 'Connect Google Drive'}</span>
      </Button>
    </div>
  )
})
