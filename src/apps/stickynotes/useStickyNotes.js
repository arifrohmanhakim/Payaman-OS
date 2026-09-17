import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService } from '../../services/storageService.js'
import { soundService } from '../../services/soundService.js'
import { INITIAL_STICKY_NOTES, STICKY_COLORS } from './stickyNotesData.js'

const STORAGE_KEY = 'os_desktop_stickies'

export function useStickyNotes() {
  const [stickies, setStickies] = useState(() => {
    const saved = storageService.getItem(STORAGE_KEY, null)
    if (Array.isArray(saved) && saved.length > 0) {
      return saved
    }
    return INITIAL_STICKY_NOTES
  })

  const maxZRef = useRef(
    stickies.reduce((max, s) => Math.max(max, s.zIndex || 10), 10)
  )

  const bringToFront = useCallback((id) => {
    maxZRef.current += 1
    const nextZ = maxZRef.current
    setStickies((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, zIndex: nextZ } : s))
      storageService.setItem(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const createSticky = useCallback((options = {}) => {
    soundService.playClick()
    maxZRef.current += 1
    const nextZ = maxZRef.current

    setStickies((prev) => {
      const randomColor =
        options.color ||
        STICKY_COLORS[Math.floor(Math.random() * (STICKY_COLORS.length - 2))].id

      const lastSticky = prev[prev.length - 1]
      const nextX = options.x ?? (lastSticky ? Math.min(window.innerWidth - 260, lastSticky.x + 30) : 100)
      const nextY = options.y ?? (lastSticky ? Math.min(window.innerHeight - 280, lastSticky.y + 30) : 100)

      const newNote = {
        id: `sticky-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: options.text || '',
        color: randomColor,
        x: Math.max(16, nextX),
        y: Math.max(36, nextY),
        width: options.width || 230,
        height: options.height || 230,
        zIndex: nextZ,
        isPinned: Boolean(options.isPinned),
        updatedAt: Date.now(),
      }

      const updated = [...prev, newNote]
      storageService.setItem(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const updateSticky = useCallback((id, fields) => {
    setStickies((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, ...fields, updatedAt: Date.now() } : s
      )
      storageService.setItem(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const deleteSticky = useCallback((id) => {
    soundService.playClick()
    setStickies((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      storageService.setItem(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  // Listen to external create event (e.g. from MenuBar, Dock, Spotlight, Context Menu)
  useEffect(() => {
    const handleCreateEvent = (e) => {
      const customProps = e.detail || {}
      createSticky(customProps)
    }

    window.addEventListener('payaman-create-sticky-note', handleCreateEvent)
    return () => window.removeEventListener('payaman-create-sticky-note', handleCreateEvent)
  }, [createSticky])

  return {
    stickies,
    createSticky,
    updateSticky,
    deleteSticky,
    bringToFront,
  }
}
