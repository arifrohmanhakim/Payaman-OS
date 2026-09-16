import { usePhotobot } from './usePhotobot.js'
import Button from '../../components/ui/Button.jsx'

export default function PhotobotApp() {
  const {
    videoRef,
    cameraState,
    errorMessage,
    currentFilter,
    countdown,
    isFlashing,
    captures,
    selectedCapture,
    statusMessage,
    setCurrentFilter,
    startCamera,
    triggerCountdownAndSnap,
    downloadPhoto,
    saveToVFS,
    deleteCapture,
    setSelectedCapture,
    filters,
  } = usePhotobot()

  const currentFilterObj = filters.find((f) => f.id === currentFilter)

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3 relative overflow-hidden">
      {/* Flash Effect Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Viewfinder Kamera */}
      <div className="flex-1 bg-neutral-900 relative flex items-center justify-center overflow-hidden border-b-2 border-[var(--os-border)]">
        {/* Elemen Video Selalu Ada di DOM agar ref terikat sejak awal */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={(e) => {
            e.currentTarget.play().catch(() => {})
          }}
          className={`w-full h-full object-cover transform -scale-x-100 ${
            cameraState === 'streaming' ? 'block' : 'hidden'
          } ${currentFilterObj?.cssClass || ''}`}
        />

        {cameraState === 'streaming' ? (
          <>
            {/* Viewfinder Crosshair Retro */}
            <div className="absolute inset-4 pointer-events-none border border-white/30 flex items-center justify-center">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white absolute top-0 left-0" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-white absolute top-0 right-0" />
              <div className="w-6 h-6 border-b-2 border-l-2 border-white absolute bottom-0 left-0" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-white absolute bottom-0 right-0" />
              <div className="w-3 h-3 border border-white/40 rounded-full" />
            </div>

            {/* Filter Badge & Live Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
              <span className="bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-bold tracking-wider animate-pulse">
                ● LIVE
              </span>
              <span className="bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] px-2 py-0.5 text-[10px] font-bold shadow-[2px_2px_0px_var(--os-shadow)]">
                Filter: {currentFilterObj?.name}
              </span>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
                <span className="text-8xl font-bold text-white animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-white space-y-3 max-w-sm z-10">
            <div className="text-3xl">📷</div>
            <div className="font-bold text-sm">
              {cameraState === 'idle'
                ? 'Connecting to Webcam...'
                : 'Camera Access Unavailable'}
            </div>
            {errorMessage && <p className="text-xs text-neutral-300">{errorMessage}</p>}
            <Button onClick={startCamera}>Reload Camera</Button>
          </div>
        )}
      </div>

      {/* Control Panel Bawah */}
      <div className="p-2.5 bg-[var(--os-bg)] space-y-2 shrink-0 border-b border-[var(--os-border)]">
        {/* Pemilih Filter Retro */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const isSelected = currentFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCurrentFilter(filter.id)}
                className={`px-2 py-1 text-[11px] font-bold border-2 border-[var(--os-border)] transition-none whitespace-nowrap cursor-default ${
                  isSelected
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] ring-1 ring-[var(--os-fg)] ring-offset-1'
                    : 'bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10'
                }`}
              >
                {filter.name}
              </button>
            )
          })}
        </div>

        {/* Shutter Button Besar */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled={cameraState !== 'streaming' || countdown !== null}
            onClick={triggerCountdownAndSnap}
            className="w-full sm:w-80 py-2 border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed os-window-shadow transition-none"
          >
            <span>📸</span>
            <span>{countdown !== null ? `CAPTURING PHOTO (${countdown})...` : 'TAKE PHOTO (3S TIMER)'}</span>
          </button>
        </div>
      </div>

      {/* Filmstrip Riwayat Jepretan */}
      <div className="h-20 bg-[var(--os-bg)] p-2 flex items-center gap-2 overflow-x-auto shrink-0">
        {captures.length === 0 ? (
          <div className="w-full text-center text-[10px] opacity-50">
            No photos yet. Click &quot;Take Photo&quot; above.
          </div>
        ) : (
          captures.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedCapture(photo)}
              className="h-16 w-16 border-2 border-[var(--os-border)] overflow-hidden shrink-0 hover:ring-2 hover:ring-[var(--os-fg)] transition-none cursor-pointer relative group"
            >
              <img
                src={photo.dataUrl}
                alt="Capture"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center opacity-0 group-hover:opacity-100 truncate">
                View
              </span>
            </button>
          ))
        )}
      </div>

      {/* Status Bar */}
      <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
        <span>{captures.length} photos saved in session</span>
        <span>{statusMessage || 'Ready to capture'}</span>
      </footer>

      {/* Modal Preview Foto Hasil Jepretan */}
      {selectedCapture && (
        <div
          onClick={() => setSelectedCapture(null)}
          className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow max-w-lg w-full max-h-[90%] flex flex-col overflow-hidden text-[var(--os-fg)]"
          >
            <header className="h-7 border-b-2 border-[var(--os-border)] px-3 flex items-center justify-between bg-[var(--os-bg)] shrink-0">
              <span className="font-bold text-xs">Photo Capture: {selectedCapture.id}</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedCapture(null)}
                className="w-4 h-4 border border-current flex items-center justify-center font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
              >
                ×
              </button>
            </header>

            <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-hidden">
              <img
                src={selectedCapture.dataUrl}
                alt="Detail Capture"
                className="max-h-[50vh] max-w-full object-contain border border-neutral-700"
              />
            </div>

            <footer className="border-t-2 border-[var(--os-border)] p-2.5 bg-[var(--os-bg)] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="text-[10px] opacity-70">
                {new Date(selectedCapture.timestamp).toLocaleString('id-ID')} ({selectedCapture.filter})
              </span>

              <div className="flex items-center gap-1.5">
                <Button variant="default" onClick={() => saveToVFS(selectedCapture)}>
                  Save to VFS
                </Button>
                <Button variant="default" onClick={() => downloadPhoto(selectedCapture)}>
                  Download PNG
                </Button>
                <Button variant="default" onClick={() => deleteCapture(selectedCapture.id)}>
                  Delete
                </Button>
                <Button variant="default" onClick={() => setSelectedCapture(null)}>
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
