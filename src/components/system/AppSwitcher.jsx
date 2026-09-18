import AppIconGraphic from '../common/AppIconGraphic.jsx'

export default function AppSwitcher({
  isOpen,
  windows = [],
  selectedIndex = 0,
}) {
  if (!isOpen || windows.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs select-none pointer-events-none">
      <div className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-dialog-shadow p-3 min-w-[280px] max-w-[90vw] text-[var(--os-fg)] font-mono">
        <div className="text-[10px] font-bold text-center pb-2 border-b border-[var(--os-border)]/40 mb-2 uppercase tracking-wider">
          Task Switcher (Alt + Tab)
        </div>

        <div className="flex items-center justify-center gap-2 overflow-x-auto p-1">
          {windows.map((win, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <div
                key={win.id}
                className={`flex flex-col items-center justify-center p-2.5 w-20 min-h-[76px] transition-none text-center ${
                  isSelected
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] ring-2 ring-[var(--os-border)]'
                    : 'bg-[var(--os-bg)] text-[var(--os-fg)] opacity-70 border border-transparent'
                }`}
              >
                <AppIconGraphic
                  iconType={win.iconType || win.appId}
                  className="w-8 h-8 mb-1.5"
                />
                <span className="text-[10px] font-bold truncate max-w-[72px] leading-tight">
                  {win.title}
                </span>
                {win.isMinimized && (
                  <span
                    className={`text-[8px] mt-0.5 px-1 ${
                      isSelected
                        ? 'bg-[var(--os-bg)] text-[var(--os-fg)]'
                        : 'bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    minimized
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-[9px] text-center opacity-60 mt-2">
          Release Alt / Cmd key to switch to selected window
        </div>
      </div>
    </div>
  )
}
