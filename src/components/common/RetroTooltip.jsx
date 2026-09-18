import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function RetroTooltip() {
  const [tooltipData, setTooltipData] = useState(null)
  const timerRef = useRef(null)
  const currentTargetRef = useRef(null)

  useEffect(() => {
    const handleMouseOver = (e) => {
      // Cari elemen terdekat yang memiliki title atau data-tooltip
      const target = e.target.closest('[title], [data-tooltip], [data-retro-tooltip]')
      if (!target) {
        if (currentTargetRef.current) {
          clearTimeout(timerRef.current)
          setTooltipData(null)
          currentTargetRef.current = null
        }
        return
      }

      // Ambil teks tooltip
      let text = target.getAttribute('data-tooltip') || target.getAttribute('data-retro-tooltip')
      if (!text && target.hasAttribute('title')) {
        text = target.getAttribute('title')
        // Pindahkan title ke data-retro-tooltip agar tooltip default browser tidak muncul
        target.setAttribute('data-retro-tooltip', text)
        target.removeAttribute('title')
      }

      if (!text || !text.trim()) return

      currentTargetRef.current = target
      clearTimeout(timerRef.current)

      const mouseX = e.clientX
      const mouseY = e.clientY

      timerRef.current = setTimeout(() => {
        setTooltipData({
          text: text.trim(),
          x: mouseX,
          y: mouseY,
        })
      }, 180)
    }

    const handleMouseMove = (e) => {
      if (currentTargetRef.current && !tooltipData) {
        // Update koordinat kursor sebelum tooltip muncul
        const mouseX = e.clientX
        const mouseY = e.clientY
        clearTimeout(timerRef.current)
        const target = currentTargetRef.current
        const text = target.getAttribute('data-tooltip') || target.getAttribute('data-retro-tooltip')
        if (text) {
          timerRef.current = setTimeout(() => {
            setTooltipData({
              text: text.trim(),
              x: mouseX,
              y: mouseY,
            })
          }, 150)
        }
      }
    }

    const handleMouseOut = (e) => {
      const related = e.relatedTarget
      if (currentTargetRef.current && (!related || !currentTargetRef.current.contains(related))) {
        clearTimeout(timerRef.current)
        setTooltipData(null)
        currentTargetRef.current = null
      }
    }

    const handleMouseDown = () => {
      clearTimeout(timerRef.current)
      setTooltipData(null)
    }

    document.addEventListener('mouseover', handleMouseOver, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseout', handleMouseOut, true)
    document.addEventListener('mousedown', handleMouseDown, true)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('mousedown', handleMouseDown, true)
      clearTimeout(timerRef.current)
    }
  }, [tooltipData])

  if (!tooltipData || !tooltipData.text) return null

  // Pisahkan pintasan shortcut jika ada format "Label (Shortcut)" atau "Label [Shortcut]"
  let label = tooltipData.text
  let shortcut = null

  const parenMatch = tooltipData.text.match(/^(.*?)\s*(\(([^)]+)\)|\[([^\]]+)\])$/)
  if (parenMatch && parenMatch[1].trim()) {
    label = parenMatch[1].trim()
    shortcut = parenMatch[3] || parenMatch[4]
  }

  // Hitung posisi aman dalam viewport
  const padding = 8
  const estimatedW = 160
  const estimatedH = 32
  let posX = tooltipData.x + 12
  let posY = tooltipData.y + 18

  if (posX + estimatedW > window.innerWidth - padding) {
    posX = Math.max(padding, tooltipData.x - estimatedW)
  }
  if (posY + estimatedH > window.innerHeight - padding) {
    posY = Math.max(padding, tooltipData.y - estimatedH - 12)
  }

  return createPortal(
    <div
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
      }}
      className="fixed z-[999999] pointer-events-none font-mono select-none animate-in fade-in zoom-in-95 duration-75"
    >
      <div className="flex items-center gap-1.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] px-2 py-0.5 text-[10px] leading-tight font-bold shadow-[2px_2px_0px_var(--os-shadow)] whitespace-nowrap">
        <span>{label}</span>
        {shortcut && (
          <span className="text-[9px] font-normal border border-[var(--os-border)] px-1 py-0 bg-[var(--os-fg)]/5 opacity-80">
            {shortcut}
          </span>
        )}
      </div>
    </div>,
    document.body
  )
}
