import { useState, useCallback, useEffect } from 'react'
import { storageService } from '../services/storageService.js'

const STORAGE_KEY_WIDGETS = 'desktop_active_widgets'

export const AVAILABLE_WIDGETS = [
  {
    type: 'clock',
    title: 'Retro Clock & Date',
    description: 'Jam analog pixel art dan tanggal kalender',
    iconType: 'calendar',
    defaultWidth: 200,
    defaultHeight: 180,
  },
  {
    type: 'system_stats',
    title: 'System Monitor',
    description: 'Pantauan CPU, RAM, VFS, dan Uptime OS',
    iconType: 'terminal',
    defaultWidth: 210,
    defaultHeight: 165,
  },
  {
    type: 'quick_notes',
    title: 'Sticky To-Do List',
    description: 'Catatan to-do cepat langsung di desktop',
    iconType: 'document',
    defaultWidth: 220,
    defaultHeight: 200,
  },
  {
    type: 'weather',
    title: 'Weather Glance',
    description: 'Prakiraan cuaca dan suhu retro 8-bit',
    iconType: 'weather',
    defaultWidth: 190,
    defaultHeight: 155,
  },
  {
    type: 'music_player',
    title: 'Mini Lo-Fi Player',
    description: 'Pemutar audio mini dengan visualizer pixel',
    iconType: 'itunes',
    defaultWidth: 220,
    defaultHeight: 155,
  },
  {
    type: 'calculator',
    title: 'Quick Calculator',
    description: 'Kalkulator retro 4-fungsi praktis',
    iconType: 'calculator',
    defaultWidth: 180,
    defaultHeight: 210,
  },
]

const DEFAULT_ACTIVE_WIDGETS = [
  {
    id: 'widget-clock-1',
    type: 'clock',
    x: 24,
    y: 48,
    width: 200,
    height: 180,
  },
  {
    id: 'widget-system-1',
    type: 'system_stats',
    x: 24,
    y: 240,
    width: 210,
    height: 165,
  },
]

export function useDesktopWidgets(uiScale = 1.15) {
  const [widgets, setWidgets] = useState(() => {
    const saved = storageService.getItem(STORAGE_KEY_WIDGETS, null)
    if (saved && Array.isArray(saved)) {
      return saved
    }
    return DEFAULT_ACTIVE_WIDGETS
  })

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_WIDGETS, widgets)
  }, [widgets])

  const addWidget = useCallback(
    (type, customProps = {}) => {
      const widgetDef = AVAILABLE_WIDGETS.find((w) => w.type === type)
      if (!widgetDef) return

      const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1280) / uiScale
      const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) / uiScale

      const newId = `widget-${type}-${Date.now()}`
      const newX = Math.max(20, Math.min(screenW - widgetDef.defaultWidth - 40, 24 + widgets.length * 20))
      const newY = Math.max(44, Math.min(screenH - widgetDef.defaultHeight - 60, 48 + widgets.length * 20))

      const newWidget = {
        id: newId,
        type,
        x: newX,
        y: newY,
        width: widgetDef.defaultWidth,
        height: widgetDef.defaultHeight,
        ...customProps,
      }

      setWidgets((prev) => [...prev, newWidget])
    },
    [widgets.length, uiScale]
  )

  const removeWidget = useCallback((id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const updateWidgetPosition = useCallback(
    (id, x, y) => {
      const screenW = (typeof window !== 'undefined' ? window.innerWidth : 1280) / uiScale
      const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) / uiScale

      setWidgets((prev) =>
        prev.map((widget) => {
          if (widget.id !== id) return widget
          const clampedX = Math.max(8, Math.min(screenW - (widget.width || 180) - 8, x))
          const clampedY = Math.max(28, Math.min(screenH - (widget.height || 140) - 40, y))
          return {
            ...widget,
            x: clampedX,
            y: clampedY,
          }
        })
      )
    },
    [uiScale]
  )

  const updateWidgetData = useCallback((id, partialData) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        if (widget.id !== id) return widget
        return {
          ...widget,
          ...partialData,
        }
      })
    )
  }, [])

  const resetWidgets = useCallback(() => {
    setWidgets(DEFAULT_ACTIVE_WIDGETS)
  }, [])

  const clearAllWidgets = useCallback(() => {
    setWidgets([])
  }, [])

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetData,
    resetWidgets,
    clearAllWidgets,
  }
}
