import { useState, useEffect, useMemo } from 'react'
import Button from '../ui/Button.jsx'
import AppIconGraphic from './AppIconGraphic.jsx'
import { getFileCategory, getFileExtension, formatFileSize } from '../../utils/fileTypes.js'

export default function FileViewerModal({
  file,
  onClose,
  onOpenInWrite,
}) {
  const [zoom, setZoom] = useState(1)
  const [isMaximized, setIsMaximized] = useState(false)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [copyFeedback, setCopyFeedback] = useState('')
  const [markdownView, setMarkdownView] = useState(false)

  const filename = file?.name || 'berkas'
  const mimeType = file?.mimeType || ''
  const category = useMemo(
    () => getFileCategory(filename, mimeType),
    [filename, mimeType]
  )
  const ext = useMemo(() => getFileExtension(filename), [filename])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Data content / url
  const fileUrl = file?.url || file?.blobUrl || null
  const textContent = typeof file?.content === 'string' ? file.content : ''

  // Download handler
  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    if (textContent) {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleCopyText = async () => {
    if (!textContent) return
    try {
      await navigator.clipboard.writeText(textContent)
      setCopyFeedback('Tersalin!')
      setTimeout(() => setCopyFeedback(''), 2000)
    } catch {
      setCopyFeedback('Gagal salin')
      setTimeout(() => setCopyFeedback(''), 2000)
    }
  }

  // Icon type mapping
  const iconGraphicType = useMemo(() => {
    if (category === 'image') return 'image'
    if (category === 'pdf') return 'pdf'
    if (category === 'audio' || category === 'video') return 'media'
    if (category === 'text' && ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)) {
      return 'code'
    }
    return 'document'
  }, [category, ext])

  const renderSimpleMarkdown = (text) => {
    const lines = text.split('\n')
    return (
      <div className="space-y-2 font-mono text-xs">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-base font-bold border-b border-[var(--os-border)] pb-1 pt-2">
                {line.slice(2)}
              </h1>
            )
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-bold pt-1">
                {line.slice(3)}
              </h2>
            )
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold pt-1">
                {line.slice(4)}
              </h3>
            )
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex gap-2 pl-2">
                <span>•</span>
                <span>{line.slice(2)}</span>
              </div>
            )
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-[var(--os-fg)] pl-2 italic opacity-80">
                {line.slice(2)}
              </blockquote>
            )
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />
          }
          return (
            <p key={idx} className="leading-relaxed">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 select-none">
      <div
        className={`bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow flex flex-col font-mono text-xs text-[var(--os-fg)] transition-all ${
          isMaximized ? 'w-full h-full max-w-none' : 'w-full max-w-3xl h-[85vh] max-h-[750px]'
        }`}
      >
        {/* Window Title Bar */}
        <header className="h-7 border-b-2 border-[var(--os-border)] px-2.5 flex items-center justify-between bg-[var(--os-bg)] shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <AppIconGraphic iconType={iconGraphicType} className="w-4 h-4 shrink-0" />
            <span className="font-bold truncate text-[11px]">{filename}</span>
            <span className="text-[10px] px-1 border border-[var(--os-border)] uppercase opacity-75 shrink-0">
              {ext || category}
            </span>
            {file?.size ? (
              <span className="text-[10px] opacity-60 shrink-0">
                ({formatFileSize(file.size)})
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              title={isMaximized ? 'Pulihkan ukuran' : 'Perbesar layar'}
              className="w-4 h-4 border border-current flex items-center justify-center font-bold text-[9px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Tutup (Esc)"
              className="w-4 h-4 border border-current flex items-center justify-center font-bold text-[10px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
            >
              ×
            </button>
          </div>
        </header>

        {/* Action Toolbar */}
        <div className="border-b border-[var(--os-border)] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 bg-[var(--os-bg)] text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {category === 'image' && (
              <>
                <Button
                  variant="default"
                  className="py-0.5 px-2 text-[10px]"
                  onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                >
                  - Zoom
                </Button>
                <span className="font-bold text-[10px] min-w-[45px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="default"
                  className="py-0.5 px-2 text-[10px]"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                >
                  + Zoom
                </Button>
                <Button
                  variant="default"
                  className="py-0.5 px-2 text-[10px]"
                  onClick={() => setZoom(1)}
                >
                  Reset
                </Button>
                {imageDimensions && (
                  <span className="opacity-60 text-[10px] ml-1">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
              </>
            )}

            {category === 'text' && ext === 'md' && (
              <Button
                variant={markdownView ? 'primary' : 'default'}
                className="py-0.5 px-2 text-[10px]"
                onClick={() => setMarkdownView((v) => !v)}
              >
                {markdownView ? 'Lihat Teks Asli' : 'Pratinjau Format'}
              </Button>
            )}

            {category === 'text' && (
              <Button
                variant="default"
                className="py-0.5 px-2 text-[10px]"
                onClick={handleCopyText}
              >
                {copyFeedback || 'Salin Teks'}
              </Button>
            )}

            {category === 'text' && onOpenInWrite && (
              <Button
                variant="default"
                className="py-0.5 px-2 text-[10px]"
                onClick={() => {
                  onClose?.()
                  onOpenInWrite(textContent)
                }}
              >
                Edit di Catatan
              </Button>
            )}

            {fileUrl && (category === 'pdf' || category === 'doc') && (
              <Button
                variant="default"
                className="py-0.5 px-2 text-[10px]"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                Buka di Tab Baru ↗
              </Button>
            )}

            {file?.webViewLink && file.webViewLink !== '#' && (
              <Button
                variant="default"
                className="py-0.5 px-2 text-[10px]"
                onClick={() => window.open(file.webViewLink, '_blank')}
              >
                Buka di Google Drive ↗
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="default"
              className="py-0.5 px-2 text-[10px]"
              onClick={handleDownload}
            >
              Unduh Berkas 💾
            </Button>
          </div>
        </div>

        {/* Content Viewer Area */}
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
                className="max-w-full max-h-full object-contain border border-[var(--os-border)] shadow transition-transform duration-100"
              />
            </div>
          ) : category === 'pdf' ? (
            fileUrl ? (
              <iframe
                src={fileUrl}
                title={filename}
                className="w-full h-full border-0 bg-white"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AppIconGraphic iconType="pdf" className="w-12 h-12" />
                <p>Tidak dapat memuat pratinjau PDF langsung.</p>
                {file?.webViewLink && (
                  <Button
                    variant="primary"
                    onClick={() => window.open(file.webViewLink, '_blank')}
                  >
                    Buka di Google Drive
                  </Button>
                )}
              </div>
            )
          ) : category === 'doc' ? (
            fileUrl ? (
              <iframe
                src={
                  fileUrl.startsWith('http')
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
                    : fileUrl
                }
                title={filename}
                className="w-full h-full border-0 bg-white"
              />
            ) : textContent ? (
              <div className="w-full h-full p-4 overflow-auto select-text whitespace-pre-wrap leading-relaxed">
                {textContent}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AppIconGraphic iconType="document" className="w-12 h-12" />
                <div className="font-bold">{filename}</div>
                <p className="opacity-75 max-w-md">
                  Dokumen Office ({ext.toUpperCase()}) dapat diunduh atau dibuka melalui aplikasi Google Docs.
                </p>
                <div className="flex gap-2">
                  {file?.webViewLink && (
                    <Button
                      variant="primary"
                      onClick={() => window.open(file.webViewLink, '_blank')}
                    >
                      Buka di Google Drive
                    </Button>
                  )}
                  <Button variant="default" onClick={handleDownload}>
                    Unduh Dokumen
                  </Button>
                </div>
              </div>
            )
          ) : category === 'audio' ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <AppIconGraphic iconType="media" className="w-16 h-16" />
              <div className="font-bold text-sm">{filename}</div>
              <audio controls src={fileUrl} className="w-full max-w-md mt-2" />
            </div>
          ) : category === 'video' ? (
            <div className="h-full flex flex-col items-center justify-center p-4 bg-black/90">
              <video
                controls
                src={fileUrl}
                className="max-w-full max-h-full border border-[var(--os-border)]"
              />
            </div>
          ) : category === 'text' ? (
            markdownView && ext === 'md' ? (
              <div className="w-full h-full p-4 overflow-auto select-text bg-[var(--os-bg)]">
                {renderSimpleMarkdown(textContent)}
              </div>
            ) : (
              <div className="w-full h-full flex overflow-auto select-text bg-[var(--os-bg)]">
                {/* Line Numbers */}
                <div className="p-3 select-none text-right opacity-35 border-r border-[var(--os-border)] font-mono text-[11px] bg-[var(--os-bg)]">
                  {textContent.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code / Text Body */}
                <div className="flex-1 p-3 overflow-auto whitespace-pre font-mono text-[11px] leading-relaxed">
                  {textContent || '(Berkas kosong)'}
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <AppIconGraphic iconType="document" className="w-14 h-14" />
              <div className="font-bold">{filename}</div>
              <p className="opacity-75 max-w-sm">
                Format berkas tidak mendukung pratinjau langsung. Anda dapat mengunduh berkas ini ke komputer.
              </p>
              <Button variant="primary" onClick={handleDownload}>
                Unduh Berkas
              </Button>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <footer className="h-7 border-t border-[var(--os-border)] px-3 flex items-center justify-between bg-[var(--os-bg)] text-[10px] opacity-75 shrink-0">
          <span>Kategori: {category.toUpperCase()}</span>
          <span>{textContent ? `${textContent.split('\n').length} baris | ${textContent.length} karakter` : ''}</span>
          <span>Payaman File Viewer</span>
        </footer>
      </div>
    </div>
  )
}
