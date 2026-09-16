import { useState } from 'react'
import { usePaint } from './usePaint.js'
import Button from '../../components/ui/Button.jsx'

export default function PaintApp() {
  const {
    canvasRef,
    canvasWidth,
    canvasHeight,
    activeTool,
    activePatternId,
    activeColor,
    lineWidth,
    statusMessage,
    canUndo,
    canRedo,
    textPrompt,
    patterns,
    colors,
    setActiveTool,
    setActivePatternId,
    setActiveColor,
    setLineWidth,
    setTextPrompt,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleApplyText,
    undo,
    redo,
    clearCanvas,
    invertCanvas,
    saveToVFS,
    downloadImage,
  } = usePaint()

  const [textInputValue, setTextInputValue] = useState('')

  const tools = [
    {
      id: 'pencil',
      label: 'Pensil (1px)',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <path d="M17 3 L21 7 L7 21 L3 21 L3 17 Z" />
          <line x1="14" y1="6" x2="18" y2="10" />
        </svg>
      ),
    },
    {
      id: 'brush',
      label: 'Kuas Lukis',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <path d="M18 3 L21 6 L12 15 C10 17 7 18 5 18 C4 18 3 17 3 16 C3 14 4 11 6 9 Z" />
          <line x1="10" y1="7" x2="17" y2="14" />
        </svg>
      ),
    },
    {
      id: 'eraser',
      label: 'Penghapus',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <rect x="4" y="6" width="16" height="12" rx="1" />
          <line x1="12" y1="6" x2="12" y2="18" />
        </svg>
      ),
    },
    {
      id: 'bucket',
      label: 'Ember Cat (Isi Pola)',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <path d="M5 10 L10 5 L18 13 L13 18 Z" />
          <path d="M19 14 C19 17 16 19 16 21" />
          <line x1="8" y1="7" x2="15" y2="14" />
        </svg>
      ),
    },
    {
      id: 'spray',
      label: 'Semprotan Cat',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <rect x="6" y="8" width="10" height="13" rx="1" />
          <path d="M9 8 V5 H13 V8" />
          <line x1="17" y1="6" x2="19" y2="4" />
          <line x1="19" y1="8" x2="22" y2="8" />
          <line x1="18" y1="10" x2="21" y2="12" />
        </svg>
      ),
    },
    {
      id: 'line',
      label: 'Garis Lurus',
      icon: (
        <svg className="w-4 h-4 stroke-current stroke-[2]" viewBox="0 0 24 24">
          <line x1="4" y1="20" x2="20" y2="4" />
        </svg>
      ),
    },
    {
      id: 'rect',
      label: 'Persegi Garis',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" />
        </svg>
      ),
    },
    {
      id: 'rect-fill',
      label: 'Persegi Isi Pola',
      icon: (
        <svg className="w-4 h-4 stroke-current stroke-[1.5]" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" fill="currentColor" fillOpacity="0.3" />
        </svg>
      ),
    },
    {
      id: 'circle',
      label: 'Lingkaran Garis',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="8" ry="7" />
        </svg>
      ),
    },
    {
      id: 'circle-fill',
      label: 'Lingkaran Isi Pola',
      icon: (
        <svg className="w-4 h-4 stroke-current stroke-[1.5]" viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="8" ry="7" fill="currentColor" fillOpacity="0.3" />
        </svg>
      ),
    },
    {
      id: 'text',
      label: 'Tulis Teks (A)',
      icon: (
        <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
          <path d="M6 19 L12 4 L18 19" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      ),
    },
  ]

  const lineSizes = [1, 2, 4, 8]

  const getCursorStyle = () => {
    switch (activeTool) {
      case 'pencil':
      case 'brush':
      case 'spray':
        return 'crosshair'
      case 'bucket':
        return 'cell'
      case 'eraser':
        return 'not-allowed'
      case 'text':
        return 'text'
      default:
        return 'crosshair'
    }
  }

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3 bg-[var(--os-bg)]">
      {/* Toolbar Atas */}
      <header className="p-2 border-b-2 border-[var(--os-border)] flex items-center justify-between gap-2 flex-wrap bg-[var(--os-bg)]">
        <div className="flex items-center gap-1">
          <Button size="small" onClick={undo} disabled={!canUndo} title="Urungkan (Undo)">
            ↶ Undo
          </Button>
          <Button size="small" onClick={redo} disabled={!canRedo} title="Ulangi (Redo)">
            ↷ Redo
          </Button>
          <div className="w-[1px] h-4 bg-[var(--os-border)]/40 mx-1" />
          <Button size="small" onClick={clearCanvas} title="Bersihkan kanvas">
            Bersihkan
          </Button>
          <Button size="small" onClick={invertCanvas} title="Balikkan warna hitam/putih">
            Invert
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button size="small" onClick={saveToVFS} title="Simpan ke Berkas VFS (/home/arif/)">
            Simpan VFS
          </Button>
          <Button size="small" onClick={downloadImage} title="Unduh gambar PNG">
            Unduh PNG
          </Button>
        </div>
      </header>

      {/* Workspace Area: Toolbox (Kiri) + Kanvas (Tengah) */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Palet Alat 2-Kolom Klasik */}
        <aside
          aria-label="Palet Alat MacPaint"
          className="w-24 flex-shrink-0 flex flex-col gap-1 p-1 border-2 border-[var(--os-border)] bg-[var(--os-bg)] os-window-shadow rounded-sm"
        >
          <div className="text-[10px] text-center font-bold pb-1 border-b border-[var(--os-border)]/40">
            ALAT
          </div>
          <div className="grid grid-cols-2 gap-1 overflow-y-auto">
            {tools.map((t) => {
              const isActive = activeTool === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTool(t.id)}
                  title={t.label}
                  aria-label={t.label}
                  className={`h-9 flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-fg)] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.4)]'
                      : 'bg-[var(--os-bg)] text-[var(--os-fg)] border-[var(--os-border)] hover:bg-[var(--os-fg)]/10'
                  }`}
                >
                  {t.icon}
                </button>
              )
            })}
          </div>

          {/* Pemilih Ketebalan Garis */}
          <div className="mt-auto pt-2 border-t border-[var(--os-border)]/40">
            <div className="text-[9px] text-center font-bold mb-1">GARIS</div>
            <div className="flex flex-col gap-1">
              {lineSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setLineWidth(size)}
                  className={`h-5 w-full flex items-center justify-center border ${
                    lineWidth === size
                      ? 'border-[var(--os-fg)] bg-[var(--os-fg)]/15'
                      : 'border-transparent hover:border-[var(--os-border)]/50'
                  }`}
                >
                  <div
                    className="bg-[var(--os-fg)] w-full mx-2"
                    style={{ height: `${Math.min(size, 6)}px` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Area Kanvas Gambar */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-auto border-2 border-[var(--os-border)] bg-neutral-200/50 p-2 relative">
          <div className="border-2 border-[var(--os-border)] shadow-[4px_4px_0px_var(--os-shadow)] bg-white">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: getCursorStyle(), imageRendering: 'pixelated' }}
              className="block bg-white"
            />
          </div>

          {/* Modal Input Teks jika alat teks aktif */}
          {textPrompt && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
              <div className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] p-4 max-w-sm w-full os-window-shadow flex flex-col gap-3">
                <div className="font-bold text-xs">Masukkan Teks MacPaint:</div>
                <input
                  type="text"
                  autoFocus
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyText(textInputValue)
                      setTextInputValue('')
                    } else if (e.key === 'Escape') {
                      setTextPrompt(null)
                    }
                  }}
                  placeholder="Ketik teks di sini..."
                  className="px-2 py-1 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] focus:outline-none focus:ring-1 focus:ring-[var(--os-border)]"
                />
                <div className="flex justify-end gap-2">
                  <Button size="small" onClick={() => setTextPrompt(null)}>
                    Batal
                  </Button>
                  <Button
                    size="small"
                    variant="primary"
                    onClick={() => {
                      handleApplyText(textInputValue)
                      setTextInputValue('')
                    }}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Palet Warna & Pola di Bagian Bawah */}
      <footer className="p-2 border-t-2 border-[var(--os-border)] flex flex-col gap-2 bg-[var(--os-bg)]">
        {/* Baris Palet Warna */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[10px] font-bold whitespace-nowrap">WARNA:</span>

          {/* Indikator Warna Aktif */}
          <div
            title={`Warna Aktif: ${activeColor}`}
            className="w-6 h-6 flex-shrink-0 border-2 border-[var(--os-fg)] os-window-shadow rounded-xs"
            style={{ backgroundColor: activeColor }}
          />

          <div className="flex items-center gap-1 flex-wrap">
            {colors.map((c) => {
              const isSelected = activeColor.toLowerCase() === c.hex.toLowerCase()
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColor(c.hex)}
                  title={`${c.name} (${c.hex})`}
                  aria-label={c.name}
                  className={`w-5 h-5 border transition-transform ${
                    isSelected
                      ? 'border-[var(--os-fg)] scale-125 z-10 shadow-[1px_1px_0px_var(--os-shadow)] ring-1 ring-[var(--os-fg)]'
                      : 'border-[var(--os-border)]/60 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              )
            })}

            {/* Custom Color Picker */}
            <label
              title="Pilih warna bebas"
              className="w-5 h-5 border border-[var(--os-border)] bg-[var(--os-bg)] hover:border-[var(--os-fg)] flex items-center justify-center cursor-pointer text-[10px] font-bold"
            >
              +
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>

          {statusMessage && (
            <span className="ml-auto text-[10px] text-[var(--os-fg)]/80 font-mono truncate max-w-xs">
              {statusMessage}
            </span>
          )}
        </div>

        {/* Baris Palet Pola */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 border-t border-[var(--os-border)]/30 pt-1.5">
          <span className="text-[10px] font-bold whitespace-nowrap">POLA:</span>
          <div className="flex gap-1">
            {patterns.map((p) => {
              const isSelected = activePatternId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePatternId(p.id)}
                  title={p.name}
                  aria-label={p.name}
                  className={`w-6 h-6 border-2 transition-transform ${
                    isSelected
                      ? 'border-[var(--os-fg)] scale-110 shadow-[2px_2px_0px_var(--os-shadow)] z-10'
                      : 'border-[var(--os-border)]/60 hover:border-[var(--os-border)]'
                  }`}
                  style={{
                    backgroundColor:
                      p.id === 'black' ? activeColor : p.id === 'white' ? '#ffffff' : '#f5f5f5',
                    backgroundImage:
                      p.id === 'black' || p.id === 'white'
                        ? 'none'
                        : `radial-gradient(${activeColor} 1.5px, transparent 1.5px)`,
                    backgroundSize: '4px 4px',
                  }}
                />
              )
            })}
          </div>
        </div>
      </footer>
    </div>
  )
}
