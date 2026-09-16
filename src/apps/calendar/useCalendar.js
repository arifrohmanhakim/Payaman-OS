import { useState, useEffect, useMemo, useCallback } from 'react'
import { storageService } from '../../services/storageService.js'
import { soundService } from '../../services/soundService.js'

const STORAGE_KEY_EVENTS = 'payaman_calendar_events'

export function useCalendar() {
  const [now, setNow] = useState(() => new Date())
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const formatDateKey = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()))

  // Events map: { [dateKey]: Array<{ id, title, time, completed }> }
  const [events, setEvents] = useState(() => {
    const defaultData = {}
    return storageService.getItem(STORAGE_KEY_EVENTS, defaultData)
  })

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Save events on change
  const saveEvents = useCallback((newEvents) => {
    setEvents(newEvents)
    storageService.setItem(STORAGE_KEY_EVENTS, newEvents)
  }, [])

  const goToPrevMonth = useCallback(() => {
    soundService.playClick()
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    soundService.playClick()
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  const goToToday = useCallback(() => {
    soundService.playClick()
    const today = new Date()
    setDisplayedMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDateKey(formatDateKey(today))
  }, [])

  const selectDate = useCallback((dateKey) => {
    soundService.playClick()
    setSelectedDateKey(dateKey)
  }, [])

  const addEvent = useCallback(
    (title, time = '') => {
      const trimmedTitle = title.trim()
      if (!trimmedTitle) return false

      const newEvent = {
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: trimmedTitle,
        time: time.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      }

      const dayEvents = events[selectedDateKey] ? [...events[selectedDateKey]] : []
      dayEvents.push(newEvent)

      const updated = {
        ...events,
        [selectedDateKey]: dayEvents,
      }

      saveEvents(updated)
      soundService.playClick()
      return true
    },
    [events, selectedDateKey, saveEvents]
  )

  const toggleEvent = useCallback(
    (eventId) => {
      const dayEvents = events[selectedDateKey] || []
      const updatedDayEvents = dayEvents.map((evt) =>
        evt.id === eventId ? { ...evt, completed: !evt.completed } : evt
      )

      const updated = {
        ...events,
        [selectedDateKey]: updatedDayEvents,
      }

      saveEvents(updated)
      soundService.playClick()
    },
    [events, selectedDateKey, saveEvents]
  )

  const deleteEvent = useCallback(
    (eventId) => {
      const dayEvents = events[selectedDateKey] || []
      const updatedDayEvents = dayEvents.filter((evt) => evt.id !== eventId)

      const updated = { ...events }
      if (updatedDayEvents.length === 0) {
        delete updated[selectedDateKey]
      } else {
        updated[selectedDateKey] = updatedDayEvents
      }

      saveEvents(updated)
      soundService.playClick()
    },
    [events, selectedDateKey, saveEvents]
  )

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const year = displayedMonth.getFullYear()
    const month = displayedMonth.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Minggu
    const lastDate = new Date(year, month + 1, 0).getDate()
    const prevLastDate = new Date(year, month, 0).getDate()

    const days = []

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevLastDate - i
      const date = new Date(year, month - 1, d)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        dayNumber: d,
        dateKey,
        isCurrentMonth: false,
        hasEvents: Boolean(events[dateKey]?.length),
      })
    }

    // Current month days
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(year, month, d)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        dayNumber: d,
        dateKey,
        isCurrentMonth: true,
        hasEvents: Boolean(events[dateKey]?.length),
      })
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - (days.length % 35 || 35)
    const paddingCount = remaining === 0 && days.length < 35 ? 35 - days.length : remaining
    for (let d = 1; d <= paddingCount; d++) {
      const date = new Date(year, month + 1, d)
      const dateKey = formatDateKey(date)
      days.push({
        date,
        dayNumber: d,
        dateKey,
        isCurrentMonth: false,
        hasEvents: Boolean(events[dateKey]?.length),
      })
    }

    return days
  }, [displayedMonth, events])

  const selectedDayEvents = events[selectedDateKey] || []
  const todayKey = formatDateKey(now)

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const monthLabel = `${monthNames[displayedMonth.getMonth()]} ${displayedMonth.getFullYear()}`

  return {
    now,
    todayKey,
    selectedDateKey,
    displayedMonth,
    monthLabel,
    calendarDays,
    selectedDayEvents,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    addEvent,
    toggleEvent,
    deleteEvent,
  }
}
