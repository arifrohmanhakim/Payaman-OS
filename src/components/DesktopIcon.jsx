import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useOS.js'
import AppIconGraphic from './common/AppIconGraphic.jsx'

export default function DesktopIcon({
  id,
  title,
  iconType,
  isSelected,
  position = { x: 24, y: 44 },
  onSelect,
  onOpen,
  onPositionChange,
  onContextMenu,
}) {
  const { displaySettings } = useTheme()
  const uiScale = displaySettings?.scale || 1.15
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    originX: position.x,
    originY: position.y,
    hasMoved: false,
  })

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDragging) return
      const clientX = event.clientX / uiScale
      const clientY = event.clientY / uiScale
      const deltaX = clientX - dragRef.current.startX
      const deltaY = clientY - dragRef.current.startY

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.hasMoved = true
      }

      if (dragRef.current.hasMoved && onPositionChange) {
        onPositionChange(
          id,
          dragRef.current.originX + deltaX,
          dragRef.current.originY + deltaY
        )
      }
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      if (!dragRef.current.hasMoved) {
        onSelect(id)
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
  }, [isDragging, id, onPositionChange, onSelect, uiScale])

  const handleMouseDown = (event) => {
    if (event.button !== 0) return
    event.stopPropagation()
    setIsDragging(true)
    const clientX = event.clientX / uiScale
    const clientY = event.clientY / uiScale
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      originX: position.x,
      originY: position.y,
      hasMoved: false,
    }
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onSelect?.(id)
    onContextMenu?.(event, id)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onOpen(id)
      }}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: isDragging ? 50 : 5,
      }}
      className={`absolute top-0 left-0 flex flex-col items-center justify-center p-2 group w-24 text-center select-none transition-none cursor-default ${
        isSelected
          ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
          : 'text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10'
      } ${isDragging ? 'opacity-80' : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-center pointer-events-none">
        <AppIconGraphic iconType={iconType} className="w-10 h-10" />
      </div>
      <span
        className={`text-xs font-mono px-1 py-0.5 leading-tight font-medium pointer-events-none ${
          isSelected
            ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
            : 'text-[var(--os-fg)] bg-[var(--os-bg)]/80'
        }`}
      >
        {title}
      </span>
    </div>
  )
}
