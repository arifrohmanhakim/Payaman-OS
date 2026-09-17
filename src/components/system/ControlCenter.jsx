import { useOS } from '../../hooks/useOS.js'
import { soundService } from '../../services/soundService.js'
import { THEMES } from '../../constants/theme.js'
import { DISPLAY_SCALES } from '../../constants/display.js'

export default function ControlCenter({ isOpen, onClose }) {
  const {
    theme,
    setTheme,
    crtScanlines,
    toggleCrtScanlines,
    displaySettings,
    updateDisplaySettings,
    activeSpace,
    setActiveSpace,
    startScreenSaver,
  } = useOS()

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-7 right-2 z-[9999] w-72 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow font-mono text-xs select-none p-3 space-y-3"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5">
        <span className="font-bold text-[11px] uppercase tracking-wider">
          Control Center
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-4 h-4 border border-[var(--os-border)] flex items-center justify-center text-[10px] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Virtual Space Selector */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold opacity-80">
          <span>Active Space (Desktop)</span>
          <span>Ctrl + 1/2/3</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setActiveSpace(num)}
              className={`py-1 border text-center font-bold text-[10px] cursor-pointer ${
                activeSpace === num
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                  : 'bg-[var(--os-bg)] text-[var(--os-fg)] border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
              }`}
            >
              Space {num}
            </button>
          ))}
        </div>
      </div>

      {/* CRT Scanlines Filter Toggle */}
      <div className="p-2 border border-[var(--os-border)] bg-[var(--os-fg)]/5 flex items-center justify-between">
        <div>
          <div className="font-bold text-[11px]">CRT Scanlines Filter</div>
          <div className="text-[9px] opacity-70">Retro monitor tube overlay</div>
        </div>
        <button
          type="button"
          onClick={toggleCrtScanlines}
          className={`px-2 py-0.5 border border-[var(--os-border)] text-[10px] font-bold cursor-pointer ${
            crtScanlines
              ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
              : 'bg-[var(--os-bg)] text-[var(--os-fg)] opacity-60'
          }`}
        >
          {crtScanlines ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Quick Theme Switcher */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold opacity-80">
          <span>Screen Palette</span>
          <span>CRT Theme</span>
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-0.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`p-1 text-left border text-[10px] font-bold truncate cursor-pointer ${
                (theme || 'classic') === t.id
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                  : 'border-[var(--os-border)]/40 hover:bg-[var(--os-fg)]/10'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* UI Scale Quick Selector */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold opacity-80 block">
          Display Scale (UI Size)
        </span>
        <div className="grid grid-cols-4 gap-1">
          {DISPLAY_SCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateDisplaySettings({ scale: item.scale })}
              className={`py-0.5 border text-center text-[9px] font-bold cursor-pointer ${
                (displaySettings?.scale ?? 1.15) === item.scale
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                  : 'border-[var(--os-border)]/40 hover:bg-[var(--os-fg)]/10'
              }`}
            >
              {Math.round(item.scale * 100)}%
            </button>
          ))}
        </div>
      </div>

      {/* Quick Sound / Screen Saver */}
      <div className="pt-1 border-t border-[var(--os-border)]/30 flex justify-between items-center text-[10px]">
        <button
          type="button"
          onClick={() => soundService.playBeep(880, 0.1)}
          className="px-2 py-0.5 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
        >
          Test Bell Beep
        </button>
        <button
          type="button"
          onClick={() => {
            onClose()
            startScreenSaver()
          }}
          className="px-2 py-0.5 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
        >
          Screensaver
        </button>
      </div>
    </div>
  )
}
