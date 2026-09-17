import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useOS } from '../../hooks/useOS.js'

export default function ContextMenu({
  isOpen,
  x = 0,
  y = 0,
  items = [],
  onClose,
}) {
  const { displaySettings } = useOS()
  const uiScale = displaySettings?.scale || 1.15
  const menuRef = useRef(null)
  const [adjustedPos, setAdjustedPos] = useState({ x, y })

  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return

    const menuEl = menuRef.current
    const padding = 8
    const screenW = window.innerWidth / uiScale
    const screenH = window.innerHeight / uiScale
    const menuW = menuEl.offsetWidth
    const menuH = menuEl.offsetHeight

    let targetX = x
    let targetY = y

    if (targetX + menuW > screenW - padding) {
      targetX = Math.max(padding, screenW - menuW - padding)
    }

    if (targetY + menuH > screenH - padding) {
      targetY = Math.max(padding, screenH - menuH - padding)
    }

    setAdjustedPos({ x: targetX, y: targetY })
  }, [isOpen, x, y, items, uiScale])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const handleScroll = () => {
      onClose?.()
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, onClose])

  if (!isOpen || !items || items.length === 0) {
    return null
  }

  return (
    <div
      ref={menuRef}
      style={{
        top: `${adjustedPos.y}px`,
        left: `${adjustedPos.x}px`,
      }}
      className="fixed z-[9999] bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-48 py-1 font-mono text-xs select-none shadow-[3px_3px_0px_var(--os-shadow)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`sep-${index}`}
              className="my-1 border-t border-[var(--os-border)]/40 mx-1"
            />
          )
        }

        if (item.header) {
          return (
            <div
              key={`header-${index}`}
              className="px-3 py-1 text-[10px] uppercase font-bold opacity-60 tracking-wider"
            >
              {item.header}
            </div>
          )
        }

        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation()
              if (item.disabled) return
              onClose?.()
              item.onSelect?.()
            }}
            className={`w-full flex items-center justify-between px-3 py-1 text-xs font-mono cursor-default text-left transition-none ${
              item.disabled
                ? 'opacity-35 cursor-not-allowed'
                : 'hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] active:text-[var(--os-bg)]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {item.icon && <span className="text-xs shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-[10px] opacity-60 ml-3 font-normal shrink-0">
                {item.shortcut}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
