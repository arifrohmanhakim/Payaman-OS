import StickyNoteItem from './StickyNoteItem.jsx'
import { useStickyNotes } from './useStickyNotes.js'
import { useTheme } from '../../hooks/useOS.js'

export default function DesktopStickyNotes() {
  const { stickies, createSticky, updateSticky, deleteSticky, bringToFront } =
    useStickyNotes()
  const { displaySettings } = useTheme()
  const uiScale = displaySettings?.scale || 1.15

  if (!stickies || stickies.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-2 overflow-hidden">
      {stickies.map((note) => (
        <div key={note.id} className="pointer-events-auto">
          <StickyNoteItem
            note={note}
            uiScale={uiScale}
            onUpdate={updateSticky}
            onDelete={deleteSticky}
            onBringToFront={bringToFront}
            onCreateNew={createSticky}
          />
        </div>
      ))}
    </div>
  )
}
