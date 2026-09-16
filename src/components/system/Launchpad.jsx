import { useState, useEffect, useRef } from 'react'
import { appRegistry } from '../../apps/appRegistry.js'
import { useOS } from '../../hooks/useOS.js'
import AppIconGraphic from '../common/AppIconGraphic.jsx'

function LaunchpadOverlay() {
  const { closeLaunchpad, openApp } = useOS()
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLaunchpad()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeLaunchpad])

  const filteredApps = appRegistry.filter((app) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return (
      app.title.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query)
    )
  })

  const handleLaunchApp = (appId) => {
    openApp(appId)
    closeLaunchpad()
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredApps.length > 0) {
      e.preventDefault()
      handleLaunchApp(filteredApps[0].id)
    }
  }

  return (
    <section
      aria-label="Launchpad Payaman OS"
      className="fixed inset-0 z-45 flex flex-col items-center justify-start pt-14 pb-20 px-6 select-none bg-[var(--os-bg)]/90 backdrop-blur-md transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeLaunchpad()
        }
      }}
    >
      <div className="absolute top-8 right-8 flex items-center gap-2">
        <button
          type="button"
          onClick={closeLaunchpad}
          aria-label="Tutup Launchpad"
          className="px-3 py-1 text-xs font-mono border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] os-window-shadow active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          Tutup [Esc]
        </button>
      </div>

      <div className="w-full max-w-md mt-4 mb-8 flex flex-col items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs text-[var(--os-fg)]/60 font-mono">
            &gt;
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari aplikasi... (tekan Enter untuk buka)"
            className="w-full pl-8 pr-8 py-2 text-sm font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow focus:outline-none focus:ring-1 focus:ring-[var(--os-border)] placeholder:text-[var(--os-fg)]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                searchInputRef.current?.focus()
              }}
              aria-label="Bersihkan pencarian"
              className="absolute inset-y-0 right-2 flex items-center px-1.5 text-xs text-[var(--os-fg)]/60 hover:text-[var(--os-fg)]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div
        className="w-full max-w-4xl flex-1 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeLaunchpad()
          }
        }}
      >
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[var(--os-border)]/40 p-8 text-center text-xs font-mono">
            <p className="mb-2 text-sm font-bold">Aplikasi tidak ditemukan</p>
            <p className="text-[var(--os-fg)]/60">
              Tidak ada aplikasi yang cocok dengan "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8 justify-items-center p-4">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleLaunchApp(app.id)}
                className="group flex flex-col items-center justify-start p-3 w-24 sm:w-28 rounded-xl border-2 border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/5 hover:os-window-shadow transition-all duration-150 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:border-[var(--os-border)]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-2 rounded-lg bg-[var(--os-bg)] border border-[var(--os-border)] group-hover:bg-[var(--os-fg)]/10 transition-colors">
                  <AppIconGraphic iconType={app.iconType} className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <span className="mt-2.5 text-xs font-mono font-medium text-center text-[var(--os-fg)] leading-tight line-clamp-2">
                  {app.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 text-[10px] font-mono text-[var(--os-fg)]/50 tracking-wider">
        PAYAMAN OS • LAUNCHPAD
      </div>
    </section>
  )
}

export default function Launchpad() {
  const { isLaunchpadOpen } = useOS()

  if (!isLaunchpadOpen) return null

  return <LaunchpadOverlay />
}
