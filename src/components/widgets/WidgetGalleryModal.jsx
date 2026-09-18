import { AVAILABLE_WIDGETS } from '../../hooks/useDesktopWidgets.js'
import AppIconGraphic from '../common/AppIconGraphic.jsx'
import { soundService } from '../../services/soundService.js'

export default function WidgetGalleryModal({
  isOpen,
  onClose,
  onAddWidget,
  onResetWidgets,
  onClearWidgets,
}) {
  if (!isOpen) return null

  const handleAdd = (type) => {
    soundService.playClick()
    onAddWidget?.(type)
    onClose?.()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 font-mono text-xs select-none text-[var(--os-fg)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-dialog-shadow flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header Titlebar */}
        <header className="h-6 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] os-titlebar-stripes flex items-center justify-between px-2 shrink-0">
          <span className="font-bold text-xs bg-[var(--os-bg)] px-1 border-x border-[var(--os-border)]">
            Desktop Widgets Gallery
          </span>
          <button
            type="button"
            onClick={() => {
              soundService.playClick()
              onClose()
            }}
            className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[9px] font-bold cursor-pointer"
          >
            ×
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-3.5 flex-1 overflow-y-auto space-y-3">
          <div className="text-[11px] opacity-75">
            Pilih aksesoris desktop retro untuk disematkan langsung di kanvas Payaman OS:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_WIDGETS.map((widget) => (
              <div
                key={widget.type}
                className="border-2 border-[var(--os-border)] p-2.5 bg-[var(--os-bg)] flex flex-col justify-between gap-2 hover:bg-[var(--os-fg)]/5 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 border border-[var(--os-border)] flex items-center justify-center bg-[var(--os-bg)] shrink-0">
                    <AppIconGraphic iconType={widget.iconType} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs truncate">{widget.title}</h3>
                    <p className="text-[10px] opacity-70 leading-tight mt-0.5">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-[var(--os-border)]/40 text-[9px]">
                  <span className="opacity-60">{widget.defaultWidth}×{widget.defaultHeight}px</span>
                  <button
                    type="button"
                    onClick={() => handleAdd(widget.type)}
                    className="px-2 py-0.5 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold border border-[var(--os-border)] hover:opacity-90 active:scale-95 cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
                  >
                    + Add to Desktop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="h-9 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] px-3 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                soundService.playClick()
                onResetWidgets?.()
                onClose()
              }}
              className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Reset Default
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playClick()
                onClearWidgets?.()
                onClose()
              }}
              className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundService.playClick()
              onClose()
            }}
            className="px-3 py-0.5 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-xs cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
