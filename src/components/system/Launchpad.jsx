import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { appRegistry } from '../../apps/appRegistry.js'
import { useOS } from '../../hooks/useOS.js'
import { soundService } from '../../services/soundService.js'
import AppIconGraphic from '../common/AppIconGraphic.jsx'

const ITEMS_PER_PAGE = 18

function LaunchpadOverlay() {
  const { closeLaunchpad, openApp } = useOS()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const searchInputRef = useRef(null)
  const lastWheelTimeRef = useRef(0)
  const touchStartXRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return appRegistry
    return appRegistry.filter(
      (app) =>
        app.title.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages - 1)

  const pages = useMemo(() => {
    const result = []
    for (let i = 0; i < totalPages; i += 1) {
      result.push(filteredApps.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE))
    }
    return result
  }, [filteredApps, totalPages])

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const current = Math.min(prev, totalPages - 1)
      if (current < totalPages - 1) {
        soundService.playClick()
        return current + 1
      }
      return current
    })
  }, [totalPages])

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => {
      const current = Math.min(prev, totalPages - 1)
      if (current > 0) {
        soundService.playClick()
        return current - 1
      }
      return current
    })
  }, [totalPages])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLaunchpad()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeLaunchpad, goToNextPage, goToPrevPage])

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

  const handleWheel = (e) => {
    const now = Date.now()
    if (now - lastWheelTimeRef.current < 350) return

    if (Math.abs(e.deltaX) > 25 || Math.abs(e.deltaY) > 40) {
      lastWheelTimeRef.current = now
      if (e.deltaX > 25 || e.deltaY > 40) {
        goToNextPage()
      } else {
        goToPrevPage()
      }
    }
  }

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNextPage()
      } else {
        goToPrevPage()
      }
    }
  }

  return (
    <section
      aria-label="Payaman OS Launchpad"
      className="fixed inset-0 z-45 flex flex-col items-center justify-between pt-10 pb-12 px-4 sm:px-8 select-none bg-[var(--os-bg)]/90 backdrop-blur-md transition-all duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeLaunchpad()
        }
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header: Search Bar & Close Button */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-4 relative z-20 shrink-0">
        <div className="flex-1 max-w-sm mx-auto relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs text-[var(--os-fg)]/60 font-mono">
            &gt;
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(0)
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search applications..."
            className="w-full pl-8 pr-8 py-1.5 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow focus:outline-none focus:ring-1 focus:ring-[var(--os-border)] placeholder:text-[var(--os-fg)]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(0)
                searchInputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-2 flex items-center px-1 text-xs text-[var(--os-fg)]/60 hover:text-[var(--os-fg)]"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={closeLaunchpad}
          aria-label="Close Launchpad"
          className="absolute right-0 top-0 px-2.5 py-1 text-xs font-mono border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] os-window-shadow active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          Close [Esc]
        </button>
      </div>

      {/* Main Horizontal Pager Slider Viewport */}
      <div className="w-full max-w-5xl flex-1 relative flex items-center justify-center overflow-hidden my-4">
        {/* Left Side Arrow Button */}
        {totalPages > 1 && (
          <button
            type="button"
            disabled={safeCurrentPage === 0}
            onClick={goToPrevPage}
            aria-label="Previous page"
            className="absolute left-1 sm:left-2 z-30 w-8 h-8 rounded-full border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-base flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all cursor-pointer os-window-shadow"
          >
            ‹
          </button>
        )}

        {/* Right Side Arrow Button */}
        {totalPages > 1 && (
          <button
            type="button"
            disabled={safeCurrentPage === totalPages - 1}
            onClick={goToNextPage}
            aria-label="Next page"
            className="absolute right-1 sm:right-2 z-30 w-8 h-8 rounded-full border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-base flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all cursor-pointer os-window-shadow"
          >
            ›
          </button>
        )}

        {/* Sliding Pages Container */}
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--os-border)]/40 text-center text-xs font-mono">
            <p className="mb-1 font-bold text-sm">No applications found</p>
            <p className="opacity-60">No applications matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div
            className="flex w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
          >
            {pages.map((pageApps, pageIndex) => (
              <div
                key={pageIndex}
                className="w-full h-full shrink-0 flex items-center justify-center p-2 sm:p-6"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeLaunchpad()
                  }
                }}
              >
                <div className="grid grid-cols-4 sm:grid-cols-6 grid-rows-3 gap-y-4 sm:gap-y-6 md:gap-y-7 gap-x-3 sm:gap-x-6 md:gap-x-8 justify-items-center items-center w-full max-w-4xl py-2">
                  {pageApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleLaunchApp(app.id)}
                      className="group flex flex-col items-center justify-center p-2 w-20 sm:w-24 border-2 border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/5 hover:os-window-shadow transition-all duration-150 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:border-[var(--os-border)] cursor-pointer"
                    >
                      <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center p-2 bg-[var(--os-bg)] border-2 border-[var(--os-border)] group-hover:bg-[var(--os-fg)]/10 transition-colors pointer-events-none">
                        <AppIconGraphic iconType={app.iconType} className="w-9 h-9 sm:w-10 sm:h-10" />
                      </div>
                      <span className="mt-1.5 text-[11px] font-mono font-bold text-center text-[var(--os-fg)] leading-tight line-clamp-1 max-w-[85px] pointer-events-none">
                        {app.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Pager Controls: macOS-style Pagination Dots & Footer */}
      <div className="flex flex-col items-center gap-2 shrink-0 z-20">
        {totalPages > 1 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--os-bg)]/80 border border-[var(--os-border)]/40 rounded-full">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundService.playClick()
                  setCurrentPage(idx)
                }}
                title={`Go to page ${idx + 1}`}
                className={`w-2 h-2 rounded-full border border-[var(--os-border)] transition-all cursor-pointer ${
                  safeCurrentPage === idx
                    ? 'bg-[var(--os-fg)] scale-125'
                    : 'bg-transparent opacity-40 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-[10px] font-mono text-[var(--os-fg)]/50 tracking-wider">
          PAYAMAN OS • LAUNCHPAD {totalPages > 1 ? `(${safeCurrentPage + 1}/${totalPages})` : ''}
        </div>
      </div>
    </section>
  )
}

export default function Launchpad() {
  const { isLaunchpadOpen } = useOS()

  if (!isLaunchpadOpen) return null

  return <LaunchpadOverlay />
}
