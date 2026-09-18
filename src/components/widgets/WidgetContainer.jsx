import { useState, useRef, useEffect } from 'react'
import { soundService } from '../../services/soundService.js'

export default function WidgetContainer({
  id,
  title,
  x,
  y,
  width,
  height,
  uiScale = 1.15,
  onPositionChange,
  onClose,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    e.stopPropagation()
    soundService.playClick()
    setIsDragging(true)
    const clientX = e.clientX / uiScale
    const clientY = e.clientY / uiScale
    dragOffsetRef.current = {
      x: clientX - x,
      y: clientY - y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const clientX = e.clientX / uiScale
      const clientY = e.clientY / uiScale
      const nextX = clientX - dragOffsetRef.current.x
      const nextY = clientY - dragOffsetRef.current.y
      onPositionChange?.(id, nextX, nextY)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, id, onPositionChange, uiScale])

  return (
    <div
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-0 left-0 bg-[var(--os-bg)] border-2 border-[var(--os-border)] shadow-[3px_3px_0px_var(--os-shadow)] flex flex-col select-none text-[var(--os-fg)] font-mono text-xs z-1 group transition-all duration-75 ${
        isDragging ? 'opacity-90 ring-1 ring-[var(--os-fg)] cursor-move' : ''
      }`}
    >
      <header
        onMouseDown={handleMouseDown}
        className="h-5 border-b border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-between px-1.5 cursor-move os-titlebar-stripes shrink-0"
      >
        <span className="text-[9px] font-bold bg-[var(--os-bg)] px-1 truncate border-x border-[var(--os-border)]">
          {title}
        </span>
        <button
          type="button"
          aria-label="Close Widget"
          title="Remove Widget"
          onClick={(e) => {
            e.stopPropagation()
            soundService.playClick()
            onClose?.(id)
          }}
          className="w-3 h-3 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer text-[8px] font-bold leading-none"
        >
          ×
        </button>
      </header>

      <div className="flex-1 p-2 bg-[var(--os-bg)] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}
