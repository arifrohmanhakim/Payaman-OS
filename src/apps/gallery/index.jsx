import { useEffect } from 'react'
import { useGallery } from './useGallery.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function GalleryApp() {
  const {
    photos,
    loading,
    error,
    query,
    searchInputValue,
    selectedPhoto,
    selectedIndex,
    isMonochrome,
    setSearchInputValue,
    handleSearch,
    loadPhotos,
    openLightbox,
    closeLightbox,
    selectNext,
    selectPrev,
    toggleMonochrome,
  } = useGallery()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhoto) {
        if (e.key === 'ArrowRight') {
          selectNext()
        } else if (e.key === 'ArrowLeft') {
          selectPrev()
        } else if (e.key === 'Escape') {
          closeLightbox()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto, selectNext, selectPrev, closeLightbox])

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3 relative">
      {/* Toolbar Atas */}
      <header className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 flex-1 max-w-sm">
          <Input
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Search Unsplash photos..."
            className="text-xs py-1"
          />
          <Button type="submit" variant="default" className="py-1">
            Search
          </Button>
          {query && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setSearchInputValue('')
                loadPhotos('')
              }}
              className="py-1"
              title="Reset search"
            >
              Reset
            </Button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            onClick={toggleMonochrome}
            className="py-1"
            title="Toggle photo visual style"
          >
            {isMonochrome ? 'Mode: B&W' : 'Mode: Color'}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => loadPhotos(query)}
            className="py-1"
            title="Reload photos"
          >
            ↻ Refresh
          </Button>
        </div>
      </header>

      {/* Main Container Foto Grid */}
      <main className="flex-1 overflow-y-auto p-3 bg-[var(--os-bg)]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-60">
            <div className="w-8 h-8 border-2 border-[var(--os-border)] border-t-transparent animate-spin rounded-full" />
            <span>Loading photos from Unsplash...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div className="border-2 border-[var(--os-border)] p-4 max-w-md bg-[var(--os-bg)] os-window-shadow">
              <span className="font-bold text-sm block mb-1">Failed to Load Gallery</span>
              <p className="opacity-80 text-xs mb-3">{error}</p>
              <Button onClick={() => loadPhotos(query)}>Try Again</Button>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center opacity-60">
            No photos found for &quot;{query}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="group border-2 border-[var(--os-border)] bg-[var(--os-bg)] os-window-shadow cursor-pointer transition-transform duration-100 hover:-translate-y-0.5 flex flex-col overflow-hidden"
              >
                <div className="aspect-square bg-neutral-200 overflow-hidden relative">
                  <img
                    src={photo.urls.small || photo.urls.thumb}
                    alt={photo.title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-200 ${
                      isMonochrome
                        ? 'grayscale contrast-125 group-hover:grayscale-0'
                        : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] px-2 py-0.5 text-[10px] font-bold shadow-[2px_2px_0px_var(--os-shadow)]">
                      Zoom
                    </span>
                  </div>
                </div>

                <footer className="p-1.5 border-t border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center text-[10px]">
                  <span className="truncate max-w-[100px] font-bold" title={photo.user.name}>
                    {photo.user.name}
                  </span>
                  <span className="opacity-60 shrink-0">♥ {photo.likes}</span>
                </footer>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
        <span>{photos.length} photos displayed</span>
        <span>
          Photos by{' '}
          <a
            href="https://unsplash.com/?utm_source=payaman_os&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-100"
          >
            Unsplash
          </a>
        </span>
      </footer>

      {/* Lightbox Modal (Tampilan Foto Besar) */}
      {selectedPhoto && (
        <div
          onClick={closeLightbox}
          className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow max-w-2xl w-full max-h-[92%] flex flex-col overflow-hidden text-[var(--os-fg)]"
          >
            {/* Header Lightbox */}
            <header className="h-7 border-b-2 border-[var(--os-border)] px-2.5 flex items-center justify-between bg-[var(--os-bg)] shrink-0">
              <span className="font-bold truncate text-xs">
                {selectedPhoto.title || 'Unsplash Photo'} ({selectedIndex + 1}/{photos.length})
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={closeLightbox}
                className="w-4 h-4 border border-current flex items-center justify-center font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
              >
                ×
              </button>
            </header>

            {/* Container Gambar Besar */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative min-h-[220px]">
              <img
                src={selectedPhoto.urls.regular || selectedPhoto.urls.full}
                alt={selectedPhoto.title}
                className={`max-w-full max-h-[55vh] object-contain transition-all duration-200 ${
                  isMonochrome ? 'grayscale contrast-125' : ''
                }`}
              />

              {/* Tombol Navigasi Kiri / Kanan */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  selectPrev()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] w-8 h-8 flex items-center justify-center font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 shadow-[2px_2px_0px_var(--os-shadow)]"
                title="Previous Photo (Left Arrow)"
              >
                ←
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  selectNext()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] w-8 h-8 flex items-center justify-center font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 shadow-[2px_2px_0px_var(--os-shadow)]"
                title="Next Photo (Right Arrow)"
              >
                →
              </button>
            </div>

            {/* Panel Detail & Atribusi Foto */}
            <footer className="border-t-2 border-[var(--os-border)] p-3 bg-[var(--os-bg)] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="space-y-0.5">
                <div className="font-bold text-xs">
                  Photographer:{' '}
                  <a
                    href={`${selectedPhoto.user.profileUrl}?utm_source=payaman_os&utm_medium=referral`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    {selectedPhoto.user.name}
                  </a>
                </div>
                {selectedPhoto.description && (
                  <p className="text-[10px] opacity-70 line-clamp-1 max-w-sm">
                    {selectedPhoto.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${selectedPhoto.link}?utm_source=payaman_os&utm_medium=referral`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 text-xs font-bold border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                >
                  Open in Unsplash ↗
                </a>
                <Button variant="default" onClick={closeLightbox}>
                  Close
                </Button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
