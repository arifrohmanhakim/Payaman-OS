import { useState, useRef, useEffect } from 'react'
import { useMaps } from './useMaps.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function MapsApp() {
  const {
    currentView,
    savedPlaces,
    mapFilter,
    layer,
    searchQuery,
    searchResults,
    isSearching,
    isLocating,
    statusMessage,
    embedUrl,
    zoomIn,
    zoomOut,
    setLocation,
    handleSearchChange,
    selectSearchResult,
    locateUser,
    saveCurrentPlace,
    removePlace,
    toggleFilter,
    toggleLayer,
  } = useMaps()

  const [showBookmarks, setShowBookmarks] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleMenuAction = (e) => {
      const { action } = e.detail || {}
      if (action === 'maps:search') {
        searchInputRef.current?.focus()
      } else if (action === 'maps:zoom_in') {
        zoomIn()
      } else if (action === 'maps:zoom_out') {
        zoomOut()
      } else if (action === 'maps:my_location') {
        locateUser()
      } else if (action === 'maps:toggle_filter') {
        toggleFilter()
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [zoomIn, zoomOut, locateUser, toggleFilter])

  const isCurrentSaved = savedPlaces.some(
    (p) =>
      p.name.toLowerCase() === currentView.name.toLowerCase() &&
      Math.abs(p.latitude - currentView.latitude) < 0.01
  )

  const filterStyle =
    mapFilter === 'retro'
      ? { filter: 'grayscale(100%) contrast(115%) brightness(95%)' }
      : {}

  return (
    <div className="w-full h-full flex flex-col bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-2 border-b-2 border-[var(--os-border)] flex flex-wrap items-center justify-between gap-2 shrink-0 bg-[var(--os-bg)]">
        {/* Search Field */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search address, landmark, city..."
          />

          {/* Autocomplete Dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow z-50 max-h-48 overflow-y-auto">
              {isSearching && (
                <div className="px-3 py-2 text-xs opacity-60 text-center">
                  Searching OpenStreetMap...
                </div>
              )}
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.name}-${item.latitude}-${idx}`}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] flex flex-col border-b border-[var(--os-border)]/20 last:border-none"
                >
                  <span className="font-bold truncate">{item.name}</span>
                  <span className="text-[10px] opacity-70 truncate">{item.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            onClick={zoomIn}
            title="Zoom In"
            className="w-7 h-7 flex items-center justify-center font-bold text-sm p-0"
          >
            +
          </Button>
          <Button
            variant="default"
            onClick={zoomOut}
            title="Zoom Out"
            className="w-7 h-7 flex items-center justify-center font-bold text-sm p-0"
          >
            -
          </Button>

          <Button
            variant="default"
            onClick={locateUser}
            disabled={isLocating}
            title="My Location (GPS)"
            className="px-2 py-1 text-xs"
          >
            {isLocating ? 'Locating...' : '📍 GPS'}
          </Button>

          <Button
            variant="default"
            onClick={toggleLayer}
            title="Switch Map Tile Source"
            className="px-2 py-1 text-xs"
          >
            {layer === 'standard' ? '🗺️ Standard' : '🚲 Cycle'}
          </Button>

          <Button
            variant="default"
            onClick={toggleFilter}
            title="Toggle Monochromatic Retro Filter"
            className="px-2 py-1 text-xs"
          >
            {mapFilter === 'retro' ? '📺 Retro' : '🎨 Color'}
          </Button>

          <Button
            variant="default"
            onClick={saveCurrentPlace}
            title="Bookmark Location"
            className="px-2 py-1 text-xs"
          >
            {isCurrentSaved ? '★ Saved' : '☆ Save'}
          </Button>

          <Button
            variant={showBookmarks ? 'primary' : 'default'}
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="px-2 py-1 text-xs"
          >
            Bookmarks ({savedPlaces.length})
          </Button>
        </div>
      </div>

      {/* Quick City Navigation Strip */}
      <div className="px-2 py-1 border-b border-[var(--os-border)]/40 bg-[var(--os-fg)]/5 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="opacity-60 text-[10px] uppercase font-bold shrink-0">Quick Jump:</span>
        {savedPlaces.slice(0, 6).map((place) => (
          <button
            key={`${place.name}-${place.latitude}`}
            type="button"
            onClick={() => setLocation(place.name, place.latitude, place.longitude, place.zoom || 13)}
            className={`px-2 py-0.5 border text-[10px] truncate max-w-28 shrink-0 ${
              currentView.name === place.name
                ? 'border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                : 'border-[var(--os-border)]/30 hover:border-[var(--os-border)]'
            }`}
          >
            {place.name}
          </button>
        ))}
        {!isCurrentSaved && (
          <button
            type="button"
            onClick={saveCurrentPlace}
            className="px-2 py-0.5 border border-dashed border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[10px] shrink-0 ml-auto"
          >
            + Bookmark
          </button>
        )}
      </div>

      {/* Status banner if any */}
      {statusMessage && (
        <div className="bg-[var(--os-fg)]/10 border-b border-[var(--os-border)] px-3 py-1 text-xs text-center">
          {statusMessage}
        </div>
      )}

      {/* Main Map Frame & Optional Bookmarks Drawer */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* OpenStreetMap Interactive Embed Viewport */}
        <iframe
          title={`OpenStreetMap - ${currentView.name}`}
          src={embedUrl}
          style={filterStyle}
          className="w-full h-full border-none transition-all duration-300"
          loading="lazy"
          allow="geolocation"
        />

        {/* Saved Places Drawer overlay */}
        {showBookmarks && (
          <div className="absolute top-0 right-0 bottom-0 w-64 bg-[var(--os-bg)] border-l-2 border-[var(--os-border)] os-window-shadow flex flex-col z-40">
            <div className="p-2 border-b border-[var(--os-border)] flex items-center justify-between font-bold">
              <span>Saved Places</span>
              <button
                type="button"
                onClick={() => setShowBookmarks(false)}
                className="px-1.5 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {savedPlaces.map((place) => (
                <div
                  key={`${place.name}-${place.latitude}`}
                  className="p-1.5 border border-[var(--os-border)]/40 hover:border-[var(--os-border)] flex items-center justify-between cursor-pointer group text-xs"
                  onClick={() => {
                    setLocation(place.name, place.latitude, place.longitude, place.zoom || 13)
                    setShowBookmarks(false)
                  }}
                >
                  <div className="truncate flex-1">
                    <div className="font-bold truncate">{place.name}</div>
                    <div className="text-[9px] opacity-60">
                      {place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlace(place.name)
                    }}
                    title="Remove bookmark"
                    className="opacity-40 group-hover:opacity-100 hover:text-red-600 px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Coordinates & Attribution Bar */}
      <div className="px-3 py-1 border-t-2 border-[var(--os-border)] flex items-center justify-between text-[10px] opacity-70 bg-[var(--os-bg)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold">{currentView.name}</span>
          <span>Lat: {currentView.latitude.toFixed(4)}°</span>
          <span>Lon: {currentView.longitude.toFixed(4)}°</span>
          <span>Zoom: {currentView.zoom}x</span>
        </div>
        <div className="truncate">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:opacity-100">OpenStreetMap</a> contributors
        </div>
      </div>
    </div>
  )
}
