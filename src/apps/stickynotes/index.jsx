import { useStickyNotes } from './useStickyNotes.js'
import { STICKY_COLORS } from './stickyNotesData.js'

export default function StickyNotesApp({ onClose }) {
  const { stickies, createSticky, deleteSticky } = useStickyNotes()

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none">
      {/* Header */}
      <div className="p-3 border-b-2 border-[var(--os-border)] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black">Desktop Stickies Manager</h2>
          <p className="text-[10px] opacity-70 mt-0.5">
            Stickies are pinned directly to your desktop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            createSticky()
            onClose?.()
          }}
          className="px-3 py-1.5 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold text-xs hover:opacity-90 active:scale-95 border border-[var(--os-border)] shadow-[2px_2px_0px_var(--os-shadow)] cursor-pointer"
        >
          + New Sticky
        </button>
      </div>

      {/* Active Stickies List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
          Active Notes on Desktop ({stickies.length})
        </div>

        {stickies.length === 0 ? (
          <div className="py-8 text-center opacity-60">
            <p className="font-bold mb-2">No active stickies on desktop</p>
            <button
              type="button"
              onClick={() => {
                createSticky()
                onClose?.()
              }}
              className="px-3 py-1 border-2 border-[var(--os-border)] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
            >
              + Create First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stickies.map((note) => {
              const colorDef =
                STICKY_COLORS.find((c) => c.id === note.color) || STICKY_COLORS[0]
              return (
                <div
                  key={note.id}
                  className={`p-2.5 border-2 ${colorDef.borderColor} ${colorDef.bg} ${colorDef.textColor} shadow-[2px_2px_0px_rgba(0,0,0,0.25)] flex flex-col justify-between`}
                >
                  <div className="line-clamp-3 text-[11px] leading-snug whitespace-pre-wrap">
                    {note.text || '(Empty sticky note)'}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-current/20 text-[9px]">
                    <span className="opacity-70 font-bold uppercase">
                      {colorDef.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteSticky(note.id)}
                      className="px-1.5 py-0.5 border border-current hover:bg-red-500 hover:text-white cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="p-2 border-t border-[var(--os-border)]/40 text-[9px] opacity-60 text-center">
        💡 Tip: Sticky notes live directly on your desktop! You can move, resize, and edit them freely.
      </div>
    </div>
  )
}
