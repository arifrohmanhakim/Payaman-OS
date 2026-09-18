import { useState, useEffect, useMemo, useRef } from 'react'
import AppIconGraphic from './AppIconGraphic.jsx'
import { getFileCategory, getFileExtension, formatFileSize } from '../../utils/fileTypes.js'
import { soundService } from '../../services/soundService.js'

export default function QuickLookModal({
  file,
  isOpen,
  onClose,
  onOpenWithApp,
}) {
  const [zoom, setZoom] = useState(1)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [markdownView, setMarkdownView] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef(null)

  const filename = file?.name || file?.title || 'Unknown'
  const mimeType = file?.mimeType || ''
  const isDir = file?.type === 'dir'
  const category = useMemo(() => {
    if (isDir) return 'folder'
    return getFileCategory(filename, mimeType)
  }, [filename, mimeType, isDir])

  const ext = useMemo(() => {
    if (isDir) return 'DIR'
    return getFileExtension(filename).toUpperCase() || category.toUpperCase()
  }, [filename, isDir, category])

  const fileUrl = file?.url || file?.blobUrl || null
  const textContent = typeof file?.content === 'string' ? file.content : ''

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.code === 'Space' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        soundService.playClick()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, onClose])

  // Reset zoom & state when file changes
  useEffect(() => {
    setZoom(1)
    setImageDimensions(null)
    setMarkdownView(false)
    setAudioPlaying(false)
  }, [file?.name, file?.id])

  if (!isOpen || !file) return null

  const iconGraphicType = (() => {
    if (isDir) return 'folder'
    if (category === 'image') return 'image'
    if (category === 'pdf') return 'pdf'
    if (category === 'audio' || category === 'video') return 'media'
    if (category === 'text' && ['JS', 'JSX', 'TS', 'TSX', 'HTML', 'CSS', 'JSON', 'PY', 'SH'].includes(ext)) {
      return 'code'
    }
    return 'document'
  })()

  const handleAudioToggle = () => {
    soundService.playClick()
    if (!audioRef.current) return
    if (audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      audioRef.current.play()
      setAudioPlaying(true)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 font-mono text-xs select-none text-[var(--os-fg)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] h-[540px] bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-dialog-shadow flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Titlebar Header */}
        <header className="h-7 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] os-titlebar-stripes flex items-center justify-between px-2.5 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden bg-[var(--os-bg)] px-1 border-x border-[var(--os-border)]">
            <AppIconGraphic iconType={iconGraphicType} className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold text-xs truncate max-w-xs">{filename}</span>
            <span className="text-[9px] px-1 border border-[var(--os-border)] font-bold">
              {ext}
            </span>
            {file?.size ? (
              <span className="text-[10px] opacity-60 shrink-0">
                {formatFileSize(file.size)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenWithApp && (
              <button
                type="button"
                onClick={() => {
                  soundService.playClick()
                  onClose()
                  onOpenWithApp(file)
                }}
                className="px-2 py-0.5 bg-[var(--os-fg)] text-[var(--os-bg)] text-[10px] font-bold border border-[var(--os-border)] hover:opacity-90 active:scale-95 cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
              >
                Open in App ↗
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundService.playClick()
                onClose()
              }}
              title="Close Quick Look (Space / Esc)"
              className="w-4 h-4 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        </header>

        {/* Action Toolbar for Images / Text */}
        {(category === 'image' || (category === 'text' && ext === 'MD')) && (
          <div className="border-b border-[var(--os-border)] px-3 py-1 bg-[var(--os-bg)] flex items-center justify-between text-[10px] shrink-0">
            {category === 'image' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                  className="px-1.5 py-0.2 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  className="px-1.5 py-0.2 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="px-1.5 py-0.2 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  100%
                </button>
                {imageDimensions && (
                  <span className="opacity-60 ml-2">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
              </div>
            )}

            {category === 'text' && ext === 'MD' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMarkdownView((prev) => !prev)}
                  className={`px-2 py-0.5 border border-[var(--os-border)] font-bold cursor-pointer ${
                    markdownView ? 'bg-[var(--os-fg)] text-[var(--os-bg)]' : 'hover:bg-[var(--os-fg)]/10'
                  }`}
                >
                  {markdownView ? 'View Raw' : 'Formatted Preview'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-[var(--os-bg)] relative flex items-stretch justify-center">
          {category === 'image' ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={fileUrl || textContent}
                alt={filename}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                onLoad={(e) => {
                  setImageDimensions({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight,
                  })
                }}
                className="max-w-full max-h-full object-contain border border-[var(--os-border)] shadow transition-transform duration-75"
              />
            </div>
          ) : category === 'audio' ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-20 h-20 border-2 border-[var(--os-border)] rounded-full flex items-center justify-center bg-[var(--os-bg)] shadow-[2px_2px_0px_var(--os-shadow)]">
                <AppIconGraphic iconType="media" className="w-10 h-10" />
              </div>
              <div>
                <div className="font-bold text-sm">{filename}</div>
                <div className="text-[10px] opacity-70 mt-0.5">Quick Look Audio Player</div>
              </div>
              <audio
                ref={audioRef}
                controls
                src={fileUrl}
                onPlay={() => setAudioPlaying(true)}
                onPause={() => setAudioPlaying(false)}
                className="w-full max-w-sm mt-2"
              />
            </div>
          ) : isDir ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 border-2 border-[var(--os-border)] flex items-center justify-center bg-[var(--os-bg)] shadow-[2px_2px_0px_var(--os-shadow)]">
                <AppIconGraphic iconType="folder" className="w-10 h-10" />
              </div>
              <div>
                <div className="font-bold text-sm">{filename}</div>
                <div className="text-[11px] opacity-70 mt-1">Virtual File System Directory</div>
              </div>
            </div>
          ) : category === 'text' ? (
            markdownView && ext === 'MD' ? (
              <div className="w-full h-full p-4 overflow-auto select-text bg-[var(--os-bg)] space-y-2">
                {textContent.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('#') ? 'font-bold text-sm border-b border-[var(--os-border)] pb-0.5' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex overflow-auto select-text bg-[var(--os-bg)] font-mono text-[11px]">
                <div className="p-3 select-none text-right opacity-35 border-r border-[var(--os-border)] bg-[var(--os-bg)] min-w-[36px]">
                  {textContent.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed">
                  {textContent || '(Berkas kosong)'}
                </div>
              </div>
            )
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <AppIconGraphic iconType="document" className="w-14 h-14" />
              <div className="font-bold text-sm">{filename}</div>
              <p className="text-[11px] opacity-75 max-w-sm">
                Pratinjau berkas {ext}. Buka dengan aplikasi pendukung atau unduh ke komputer.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar with Space / Esc Shortcut Hint */}
        <footer className="h-6 border-t-2 border-[var(--os-border)] px-3 flex items-center justify-between bg-[var(--os-bg)] text-[10px] opacity-75 shrink-0">
          <span>Quick Look</span>
          <span className="font-bold border border-[var(--os-border)] px-1.5 py-0.2 bg-[var(--os-fg)]/5">
            Press [Space] or [Esc] to dismiss
          </span>
          <span>{textContent ? `${textContent.split('\n').length} lines` : ''}</span>
        </footer>
      </div>
    </div>
  )
}
