import { useState } from 'react'
import { useCalendar } from './useCalendar.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function CalendarApp() {
  const {
    now,
    todayKey,
    selectedDateKey,
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
  } = useCalendar()

  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('')

  const handleCreateEvent = (e) => {
    e.preventDefault()
    if (addEvent(eventTitle, eventTime)) {
      setEventTitle('')
      setEventTime('')
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formattedSelectedDate = () => {
    const [y, m, d] = selectedDateKey.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-full font-mono text-xs text-[var(--os-fg)] select-none">
      {/* Realtime Clock & Date Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-[var(--os-border)] pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">📅 {monthLabel}</span>
          <Button variant="default" className="py-0.5 px-2 text-[10px]" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="default" className="py-0.5 px-2 text-[10px]" onClick={goToPrevMonth} title="Previous Month">
            &lt;
          </Button>
          <Button variant="default" className="py-0.5 px-2 text-[10px]" onClick={goToNextMonth} title="Next Month">
            &gt;
          </Button>
          <div className="ml-2 font-bold text-[11px] px-2 py-0.5 border border-[var(--os-border)] bg-[var(--os-bg)]">
            {now.toLocaleTimeString('id-ID')}
          </div>
        </div>
      </div>

      {/* Main Split Body: Calendar Grid + Daily Agenda */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        {/* Month Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0 border-2 border-[var(--os-border)] p-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] pb-1 border-b border-[var(--os-border)]">
            {dayNames.map((name, i) => (
              <span key={name} className={i === 0 ? 'opacity-50' : ''}>
                {name}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 flex-1 py-1.5 auto-rows-fr">
            {calendarDays.map(({ dayNumber, dateKey, isCurrentMonth, hasEvents }) => {
              const isSelected = dateKey === selectedDateKey
              const isToday = dateKey === todayKey

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => selectDate(dateKey)}
                  className={`relative flex flex-col items-center justify-center p-1 rounded-none border text-center transition-none ${
                    isSelected
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-fg)] font-bold'
                      : isToday
                        ? 'border-2 border-[var(--os-border)] font-bold bg-[var(--os-fg)]/10'
                        : 'border-transparent hover:border-[var(--os-border)]'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className="text-[11px] leading-none">{dayNumber}</span>
                  {hasEvents && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected ? 'bg-[var(--os-bg)]' : 'bg-[var(--os-fg)]'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Daily Agenda Panel */}
        <div className="w-full md:w-56 flex flex-col border-2 border-[var(--os-border)] p-2 min-w-0">
          <div className="border-b border-[var(--os-border)] pb-1 mb-2">
            <div className="text-[10px] opacity-70">Events for:</div>
            <div className="font-bold text-[11px] truncate" title={formattedSelectedDate()}>
              {formattedSelectedDate()}
            </div>
          </div>

          {/* Add Event Form */}
          <form onSubmit={handleCreateEvent} className="space-y-1.5 mb-2 pb-2 border-b border-[var(--os-border)]">
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event / note..."
              className="text-[10px] py-1"
            />
            <div className="flex gap-1">
              <Input
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="Time (e.g. 09:00)"
                className="text-[10px] py-1 flex-1"
              />
              <Button type="submit" variant="primary" className="py-1 px-2 text-[10px]">
                + Add
              </Button>
            </div>
          </form>

          {/* Event List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {selectedDayEvents.length === 0 ? (
              <div className="text-[10px] opacity-50 text-center py-4">
                No events on this date.
              </div>
            ) : (
              selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-1.5 border border-[var(--os-border)] flex items-start justify-between gap-1 group text-[10px]"
                >
                  <label className="flex items-start gap-1.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={evt.completed}
                      onChange={() => toggleEvent(evt.id)}
                      className="mt-0.5 accent-[var(--os-fg)]"
                    />
                    <div className="min-w-0">
                      <div className={`break-words ${evt.completed ? 'line-through opacity-50' : 'font-medium'}`}>
                        {evt.title}
                      </div>
                      {evt.time && (
                        <div className="text-[9px] opacity-60">🕒 {evt.time}</div>
                      )}
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => deleteEvent(evt.id)}
                    title="Delete event"
                    className="opacity-40 hover:opacity-100 hover:text-red-500 text-[10px] px-1"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
