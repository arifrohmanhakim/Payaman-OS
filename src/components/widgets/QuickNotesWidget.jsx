import { useState, useEffect } from 'react'
import { soundService } from '../../services/soundService.js'
import { storageService } from '../../services/storageService.js'

const STORAGE_KEY_NOTES_WIDGET = 'desktop_widget_quick_notes'

const INITIAL_ITEMS = [
  { id: 1, text: 'Review monochrome UI', done: true },
  { id: 2, text: 'Optimize terminal shell', done: true },
  { id: 3, text: 'Build retro desktop widgets', done: false },
]

export default function QuickNotesWidget() {
  const [items, setItems] = useState(() => {
    return storageService.getItem(STORAGE_KEY_NOTES_WIDGET, INITIAL_ITEMS)
  })
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_NOTES_WIDGET, items)
  }, [items])

  const handleToggle = (id) => {
    soundService.playClick()
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    )
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    soundService.playClick()
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return
    soundService.playClick()
    const newItem = {
      id: Date.now(),
      text: trimmed,
      done: false,
    }
    setItems((prev) => [...prev, newItem])
    setInputVal('')
  }

  return (
    <div className="flex flex-col h-full justify-between gap-1 text-[11px] font-mono">
      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 max-h-28 [scrollbar-width:none]">
        {items.length === 0 ? (
          <div className="text-center opacity-50 py-3 text-[10px]">
            (Tidak ada catatan)
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className="flex items-center justify-between gap-1.5 p-1 border border-transparent hover:border-[var(--os-border)]/40 hover:bg-[var(--os-fg)]/5 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-3 h-3 border border-[var(--os-border)] flex items-center justify-center text-[9px] font-bold shrink-0 bg-[var(--os-bg)]">
                  {item.done ? '✓' : ''}
                </span>
                <span
                  className={`truncate ${
                    item.done ? 'line-through opacity-50' : 'font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(item.id, e)}
                className="opacity-0 group-hover:opacity-100 text-[10px] font-bold px-1 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input Add Form */}
      <form onSubmit={handleAdd} className="flex gap-1 pt-1 border-t border-[var(--os-border)]">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="+ Add task..."
          className="flex-1 bg-[var(--os-bg)] border border-[var(--os-border)] px-1.5 py-0.5 text-[10px] focus:outline-none placeholder:opacity-40"
        />
        <button
          type="submit"
          className="px-2 py-0.5 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-[10px] cursor-pointer"
        >
          Add
        </button>
      </form>
    </div>
  )
}
