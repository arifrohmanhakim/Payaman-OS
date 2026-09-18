import { memo } from 'react'
import AppIconGraphic from '../../../components/common/AppIconGraphic.jsx'

export default memo(function FileSidebar({
  storageSource,
  currentPath,
  storageStats,
  gdrive,
  quickLinks,
  onSelectStorageSource,
  onNavigateTo,
}) {
  return (
    <aside className="w-40 border-r-2 border-[var(--os-border)] bg-[var(--os-bg)] p-2 space-y-3 overflow-y-auto shrink-0 hidden sm:block">
      {/* Pilihan Sumber Penyimpanan */}
      <div>
        <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
          Storage
        </span>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectStorageSource('local')}
            className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 cursor-default ${
              storageSource === 'local'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
            }`}
          >
            <AppIconGraphic iconType="preferences" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Local (VFS)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectStorageSource('gdrive')}
            className={`w-full text-left px-1.5 py-1 text-xs flex items-center justify-between gap-1 cursor-default ${
              storageSource === 'gdrive'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <AppIconGraphic iconType="cloud" className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Google Drive</span>
            </span>
            {gdrive.isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
            )}
          </button>
        </div>
      </div>

      {/* Bagian Lokal (Shortcuts & Stats) vs Google Drive (Account) */}
      {storageSource === 'local' ? (
        <>
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
              Shortcuts
            </span>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const isActive = currentPath === link.path
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => onNavigateTo(link.path)}
                    className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 cursor-default ${
                      isActive
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                        : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    <AppIconGraphic iconType="folder" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[var(--os-border)] pt-2 text-[10px] opacity-70">
            <div>VFS Storage:</div>
            <div className="font-bold">
              {storageStats.usedKb} KB / {storageStats.totalKb} KB
            </div>
          </div>
        </>
      ) : (
        <div className="border-t border-[var(--os-border)] pt-2 text-[10px] space-y-2">
          <div>Connected Account:</div>
          {gdrive.userProfile?.email ? (
            <div className="truncate font-bold text-[10px]" title={gdrive.userProfile.email}>
              {gdrive.userProfile.email}
            </div>
          ) : (
            <div className="opacity-60">Not connected</div>
          )}
          {gdrive.isConnected && (
            <button
              type="button"
              onClick={gdrive.disconnect}
              className="w-full text-center px-1 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[10px]"
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </aside>
  )
})
