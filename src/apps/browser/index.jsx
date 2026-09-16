import { useState } from 'react'
import { useBrowser } from './useBrowser.js'
import { HOME_PAGE_URL, isKnownFrameRestrictedDomain } from './bookmarksData.js'

export default function BrowserApp() {
  const {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    canGoBack,
    canGoForward,
    bookmarks,
    addressInputRef,
    navigateTo,
    goBack,
    goForward,
    reload,
    goHome,
    openNewTab,
    closeTab,
    setTabLoaded,
    isBookmarked,
    toggleBookmark,
    openInExternal,
  } = useBrowser()

  const currentTabKey = activeTab ? `${activeTab.id}:${activeTab.url}` : ''
  const [prevTabKey, setPrevTabKey] = useState(currentTabKey)
  const [urlInputValue, setUrlInputValue] = useState(
    activeTab?.url === HOME_PAGE_URL ? '' : (activeTab?.url || '')
  )
  const [showPortalInfo, setShowPortalInfo] = useState(false)
  const [bypassedUrls, setBypassedUrls] = useState([])

  if (prevTabKey !== currentTabKey) {
    setPrevTabKey(currentTabKey)
    setUrlInputValue(activeTab?.url === HOME_PAGE_URL ? '' : (activeTab?.url || ''))
  }

  const handleSubmitUrl = (e) => {
    e.preventDefault()
    if (!urlInputValue.trim()) return
    navigateTo(urlInputValue)
  }

  const bookmarked = isBookmarked(activeTab?.url)

  return (
    <div className="flex flex-col h-full font-mono text-[var(--os-fg)] text-xs select-none -m-3 bg-[var(--os-bg)]">
      {/* 1. Tab Bar */}
      <div className="flex items-center border-b border-[var(--os-border)] bg-[var(--os-bg)] px-1 pt-1 gap-1 overflow-x-auto shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group relative flex items-center justify-between gap-1.5 px-2.5 py-1 text-xs border border-b-0 border-[var(--os-border)] max-w-44 min-w-28 cursor-default truncate transition-none ${
                isActive
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                  : 'bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10'
              }`}
            >
              <span className="truncate flex-1 text-[11px]">{tab.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className={`w-3.5 h-3.5 flex items-center justify-center text-[10px] rounded-xs ${
                  isActive
                    ? 'hover:bg-[var(--os-bg)] hover:text-[var(--os-fg)]'
                    : 'hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]'
                }`}
                title="Close Tab"
              >
                ×
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => openNewTab()}
          className="px-2 py-0.5 text-xs font-bold border border-b-0 border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
          title="New Tab (⌘T)"
        >
          +
        </button>
      </div>

      {/* 2. Navigation & Address Bar */}
      <div className="flex items-center gap-1.5 p-1.5 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={goBack}
            className="w-6 h-6 border border-[var(--os-border)] flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-[var(--os-fg)] hover:not-disabled:text-[var(--os-bg)]"
            title="Back (⌘[)"
          >
            ◀
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={goForward}
            className="w-6 h-6 border border-[var(--os-border)] flex items-center justify-center font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-[var(--os-fg)] hover:not-disabled:text-[var(--os-bg)]"
            title="Forward (⌘])"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={reload}
            className="w-6 h-6 border border-[var(--os-border)] flex items-center justify-center text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
            title="Reload Page (⌘R)"
          >
            🔄
          </button>
          <button
            type="button"
            onClick={goHome}
            className="w-6 h-6 border border-[var(--os-border)] flex items-center justify-center text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
            title="Home Page"
          >
            🏠
          </button>
        </div>

        {/* Omnibox Address Input */}
        <form onSubmit={handleSubmitUrl} className="flex-1 flex items-center relative">
          <div className="absolute left-2 text-[11px] opacity-60 pointer-events-none">
            {activeTab?.url.startsWith('https://') ? '🔒' : '🌐'}
          </div>

          <input
            ref={addressInputRef}
            type="text"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Type a web address or search query..."
            className="w-full pl-7 pr-8 py-1 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] focus:outline-none focus:ring-1 focus:ring-[var(--os-fg)]"
          />

          {activeTab?.url !== HOME_PAGE_URL && (
            <button
              type="button"
              onClick={toggleBookmark}
              className="absolute right-2 text-xs opacity-75 hover:opacity-100"
              title={bookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          )}
        </form>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleSubmitUrl}
            className="px-2 py-1 text-xs font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
          >
            Go
          </button>

          {activeTab?.url !== HOME_PAGE_URL && (
            <button
              type="button"
              onClick={() => openInExternal()}
              className="px-1.5 py-1 text-xs border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
              title="Open in External Browser ↗"
            >
              ↗
            </button>
          )}
        </div>
      </div>

      {/* 3. Bookmarks Quick-Access Bar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg)] overflow-x-auto text-[11px] shrink-0">
        <span className="opacity-50 text-[10px] uppercase font-bold shrink-0 mr-1">
          Sites:
        </span>
        {bookmarks.slice(0, 7).map((bm) => (
          <button
            key={bm.id}
            type="button"
            onClick={() => navigateTo(bm.url)}
            className="px-1.5 py-0.5 border border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 truncate shrink-0 max-w-36 flex items-center gap-1"
            title={`${bm.title} (${bm.url})`}
          >
            <span>{bm.icon || '🔖'}</span>
            <span className="truncate">{bm.title}</span>
          </button>
        ))}
      </div>

      {/* 4. Active Viewport */}
      <div className="relative flex-1 w-full h-full bg-[var(--os-bg)] overflow-hidden">
        {activeTab?.url === HOME_PAGE_URL ? (
          /* Home Portal Page */
          <div className="h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full max-w-xl space-y-6 text-center">
              <div className="space-y-2 pt-2">
                <div className="inline-block p-3 border-2 border-[var(--os-border)] text-3xl font-bold">
                  🌐
                </div>
                <h1 className="text-lg font-bold tracking-tight">Payaman Web Explorer</h1>
                <p className="text-xs opacity-75">
                  Retro-compatible web browsing & global Internet search
                </p>
              </div>

              {/* Large Search Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!urlInputValue.trim()) return
                  navigateTo(urlInputValue)
                }}
                className="flex items-center border-2 border-[var(--os-border)] shadow-xs"
              >
                <input
                  type="text"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  placeholder="Search the Web with DuckDuckGo or enter URL..."
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-[var(--os-fg)] text-[var(--os-bg)] hover:opacity-90"
                >
                  Search
                </button>
              </form>

              {/* Recommended Directory Grid */}
              <div className="space-y-2 text-left">
                <div className="text-[11px] font-bold uppercase opacity-70 border-b border-[var(--os-border)] pb-1">
                  Recommended Web Portals
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bookmarks.map((site) => (
                    <div
                      key={site.id}
                      onClick={() => navigateTo(site.url)}
                      className="p-2 border border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 cursor-pointer flex items-start gap-2 group transition-none"
                    >
                      <span className="text-base mt-0.5">{site.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs group-hover:underline truncate">
                          {site.title}
                        </div>
                        <div className="text-[10px] opacity-70 line-clamp-1">
                          {site.description || site.url}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frame Notice Alert */}
              <div className="p-3 border border-[var(--os-border)] bg-[var(--os-bg)] text-[11px] text-left space-y-1.5 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="font-bold">ℹ️ Note on Web Browsing</span>
                  <button
                    type="button"
                    onClick={() => setShowPortalInfo((prev) => !prev)}
                    className="underline text-[10px]"
                  >
                    {showPortalInfo ? 'Hide Details' : 'Details'}
                  </button>
                </div>
                <p className="text-[10px] leading-relaxed opacity-75">
                  Some large websites (e.g. Google, GitHub) block embedded iframes via
                  security headers (<code className="font-bold">X-Frame-Options</code>). For those sites, use the <code className="font-bold">↗</code> button in the address bar to open them directly in your real browser.
                </p>
                {showPortalInfo && (
                  <p className="text-[10px] leading-relaxed opacity-75 border-t border-[var(--os-border)] pt-1.5">
                    Sites like Wikipedia, DuckDuckGo Lite, FrogFind, 68k.news, OpenStreetMap, and public documentation render directly inside this window.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : isKnownFrameRestrictedDomain(activeTab?.url) &&
          !bypassedUrls.includes(activeTab?.url) ? (
          /* Restricted Domain Notice (Google, YouTube, GitHub, etc.) */
          <div className="h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-md w-full border-2 border-[var(--os-border)] p-5 space-y-4 bg-[var(--os-bg)] os-window-shadow">
              <div className="inline-block p-2.5 border-2 border-[var(--os-border)] text-2xl font-bold">
                🛡️
              </div>

              <div className="space-y-1">
                <h2 className="text-sm font-bold tracking-tight">
                  Embedded Connection Restricted
                </h2>
                <div className="text-[11px] font-mono opacity-70 truncate px-2 py-0.5 border border-[var(--os-border)] bg-[var(--os-fg)]/5">
                  {activeTab?.url}
                </div>
              </div>

              <p className="text-[11px] leading-relaxed opacity-80 text-left">
                Major sites like <strong>Google</strong>, <strong>GitHub</strong>, and <strong>YouTube</strong> intentionally block other web applications from displaying their content inside an embedded window (<code className="font-bold">X-Frame-Options: SAMEORIGIN</code>) to protect user accounts from clickjacking.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => openInExternal(activeTab?.url)}
                  className="w-full py-2 px-3 text-xs font-bold bg-[var(--os-fg)] text-[var(--os-bg)] hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <span>↗ Open in External Browser Tab</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(
                        urlInputValue.replace(/^https?:\/\/(www\.)?google\.com\/?(\?q=)?/i, '') || 'payaman os'
                      )}`
                    )
                  }
                  className="w-full py-1.5 px-3 text-xs font-semibold border border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 flex items-center justify-center gap-1.5"
                >
                  <span>🔍 Search via DuckDuckGo Lite (Embed-Friendly)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      `http://frogfind.com/?q=${encodeURIComponent(
                        urlInputValue.replace(/^https?:\/\/(www\.)?google\.com\/?(\?q=)?/i, '') || 'retro web'
                      )}`
                    )
                  }
                  className="w-full py-1.5 px-3 text-xs font-semibold border border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 flex items-center justify-center gap-1.5"
                >
                  <span>🐸 Search via FrogFind (Vintage Web)</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--os-border)]/50 text-[10px] opacity-60">
                <button
                  type="button"
                  onClick={() =>
                    setBypassedUrls((prev) => [...prev, activeTab?.url])
                  }
                  className="underline hover:opacity-100"
                >
                  Attempt loading iframe anyway
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Real Embedded Iframe Viewport */
          <div className="relative w-full h-full flex flex-col">
            {/* Top Assistant Bar for Embedded View */}
            <div className="flex items-center justify-between px-2 py-0.5 text-[10px] border-b border-[var(--os-border)] bg-[var(--os-bg)] opacity-80 shrink-0">
              <span className="truncate">Navigating: {activeTab?.url}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openInExternal(activeTab?.url)}
                  className="underline hover:font-bold"
                >
                  Open in New Tab ↗
                </button>
              </div>
            </div>

            {/* Iframe */}
            <div className="relative flex-1 w-full h-full">
              <iframe
                key={`${activeTab?.id}-${activeTab?.url}`}
                src={activeTab?.url}
                title={activeTab?.title || 'Browser Viewport'}
                onLoad={() => setTabLoaded(activeTab?.id)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                className="w-full h-full border-none bg-white"
              />

              {activeTab?.isLoading && (
                <div className="absolute inset-0 bg-[var(--os-bg)]/80 flex items-center justify-center font-bold text-xs pointer-events-none">
                  <div className="p-3 border-2 border-[var(--os-border)] bg-[var(--os-bg)] flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Connecting to host...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar Bottom */}
      <div className="flex items-center justify-between px-2 py-0.5 border-t border-[var(--os-border)] bg-[var(--os-bg)] text-[10px] opacity-70 shrink-0">
        <span className="truncate">
          {activeTab?.isLoading
            ? 'Loading web document...'
            : activeTab?.url === HOME_PAGE_URL
              ? 'Ready • Payaman Web Portal'
              : 'Done • Secure Viewport'}
        </span>
        <span className="shrink-0">{tabs.length} open tab{tabs.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
