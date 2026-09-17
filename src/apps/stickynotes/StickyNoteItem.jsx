import { useState, useRef, useEffect, useCallback } from 'react'
import { STICKY_COLORS } from './stickyNotesData.js'

export default function StickyNoteItem({
  note,
  uiScale = 1.0,
  onUpdate,
  onDelete,
  onBringToFront,
  onCreateNew,
}) {
  const { id, text, color = 'yellow', x, y, width = 230, height = 230, zIndex = 10 } = note
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startWidth: 0,
    startHeight: 0,
  })

  const activeColorDef =
    STICKY_COLORS.find((c) => c.id === color) || STICKY_COLORS[0]

  // Dragging logic
  const handleHeaderMouseDown = (e) => {
    if (e.button !== 0) return
    onBringToFront(id)
    setIsDragging(true)
    const clientX = e.clientX / uiScale
    const clientY = e.clientY / uiScale
    dragOffsetRef.current = {
      x: clientX - x,
      y: clientY - y,
    }
    e.stopPropagation()
  }

  // Resizing logic
  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    onBringToFront(id)
    setIsResizing(true)
    const clientX = e.clientX / uiScale
    const clientY = e.clientY / uiScale
    resizeStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startWidth: width,
      startHeight: height,
    }
  }

  // Window mousemove & mouseup listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      const clientX = e.clientX / uiScale
      const clientY = e.clientY / uiScale

      if (isDragging) {
        const nextX = Math.max(10, clientX - dragOffsetRef.current.x)
        const nextY = Math.max(30, clientY - dragOffsetRef.current.y)
        onUpdate(id, { x: Math.round(nextX), y: Math.round(nextY) })
      } else if (isResizing) {
        const deltaX = clientX - resizeStartRef.current.mouseX
        const deltaY = clientY - resizeStartRef.current.mouseY

        const nextWidth = Math.max(180, resizeStartRef.current.startWidth + deltaX)
        const nextHeight = Math.max(160, resizeStartRef.current.startHeight + deltaY)

        onUpdate(id, {
          width: Math.round(nextWidth),
          height: Math.round(nextHeight),
        })
      }
    }

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false)
      if (isResizing) setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, id, onUpdate, uiScale])

  const handleInsertText = useCallback(
    (snippet) => {
      const updated = text ? `${text}\n${snippet}` : snippet
      onUpdate(id, { text: updated })
    },
    [id, text, onUpdate]
  )

  const handleInsertDate = useCallback(() => {
    const now = new Date()
    const dateStr = `[${now.toLocaleDateString('id-ID', {
      dateStyle: 'short',
    })} ${now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })}] `
    handleInsertText(dateStr)
  }, [handleInsertText])

  return (
    <div
      onMouseDown={() => onBringToFront(id)}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: zIndex || 10,
      }}
      className={`absolute top-0 left-0 flex flex-col font-mono text-xs select-none border-2 ${activeColorDef.borderColor} ${activeColorDef.bg} ${activeColorDef.textColor} shadow-[3px_3px_0px_rgba(0,0,0,0.35)] transition-opacity duration-150 ${
        isDragging ? 'opacity-90' : 'opacity-100'
      }`}
    >
      {/* Header Bar */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`h-7 px-1.5 flex items-center justify-between border-b-2 ${activeColorDef.borderColor} ${activeColorDef.headerBg} cursor-grab active:cursor-grabbing shrink-0`}
      >
        <div className="flex items-center gap-1">
          {/* New Note Button */}
          <button
            type="button"
            title="New sticky note"
            onClick={(e) => {
              e.stopPropagation()
              onCreateNew({ x: x + 25, y: y + 25, color })
            }}
            className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-current hover:bg-black/10 active:scale-95 cursor-pointer rounded-xs"
          >
            +
          </button>

          {/* Color Chooser Dot */}
          <div className="relative">
            <button
              type="button"
              title="Change note color"
              onClick={(e) => {
                e.stopPropagation()
                setIsColorMenuOpen((prev) => !prev)
              }}
              className="w-4 h-4 flex items-center justify-center border border-current hover:bg-black/10 active:scale-95 cursor-pointer rounded-xs text-[9px] font-bold"
            >
              •••
            </button>

            {/* Color Palette Flyout */}
            {isColorMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-5 left-0 z-50 p-1.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] shadow-[2px_2px_0px_var(--os-shadow)] flex gap-1 items-center"
              >
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      onUpdate(id, { color: c.id })
                      setIsColorMenuOpen(false)
                    }}
                    className={`w-4 h-4 border border-black/60 rounded-xs cursor-pointer hover:scale-115 transition-transform ${c.bg} ${
                      c.id === color ? 'ring-1 ring-black ring-offset-1' : ''
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note Grip Title Line */}
        <div className="flex-1 mx-2 flex items-center justify-center pointer-events-none opacity-40">
          <div className="h-0.5 w-8 bg-current rounded-full" />
        </div>

        {/* Close / Delete Button */}
        <button
          type="button"
          title="Delete sticky note"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-current hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 cursor-pointer rounded-xs"
        >
          ×
        </button>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 p-2 flex flex-col min-h-0 overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => onUpdate(id, { text: e.target.value })}
          onFocus={() => {
            onBringToFront(id)
            setIsFocused(true)
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Take a note..."
          className="w-full flex-1 bg-transparent resize-none focus:outline-none font-mono text-xs leading-relaxed placeholder:opacity-40 overflow-y-auto"
        />

        {/* Quick Toolbar (Shown when focused or hovered) */}
        <div
          className={`flex items-center justify-between pt-1 border-t border-current/20 text-[10px] shrink-0 transition-opacity duration-150 ${
            isFocused ? 'opacity-100' : 'opacity-40 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleInsertText('• ')}
              className="px-1 py-0.2 border border-current/40 hover:bg-black/10 cursor-pointer rounded-xs"
              title="Bullet list"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => handleInsertText('[ ] ')}
              className="px-1 py-0.2 border border-current/40 hover:bg-black/10 cursor-pointer rounded-xs"
              title="Checkbox"
            >
              [ ]
            </button>
            <button
              type="button"
              onClick={handleInsertDate}
              className="px-1 py-0.2 border border-current/40 hover:bg-black/10 cursor-pointer rounded-xs"
              title="Insert date/time"
            >
              🕒
            </button>
          </div>

          <span className="text-[9px] opacity-60">
            {text.length} chars
          </span>
        </div>
      </div>

      {/* Resize Handle at Bottom-Right */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-current opacity-60" />
      </div>
    </div>
  )
}
