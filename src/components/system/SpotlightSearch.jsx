import { useState, useEffect, useRef, useMemo } from 'react'
import { appRegistry } from '../../apps/appRegistry.js'
import { useOS } from '../../hooks/useOS.js'
import { soundService } from '../../services/soundService.js'
import AppIconGraphic from '../common/AppIconGraphic.jsx'

const QUICK_ACTIONS = [
  {
    id: 'action-new-note',
    title: 'New Note',
    subtitle: 'Create a new text document in Write app',
    iconType: 'write',
    category: 'Action',
    action: (openApp) => openApp('write'),
  },
  {
    id: 'action-preferences',
    title: 'System Preferences',
    subtitle: 'Customize themes, wallpapers and dock',
    iconType: 'preferences',
    category: 'Action',
    action: (openApp) => openApp('preferences'),
  },
  {
    id: 'action-terminal',
    title: 'Open Terminal',
    subtitle: 'Command line terminal environment',
    iconType: 'terminal',
    category: 'Action',
    action: (openApp) => openApp('terminal'),
  },
  {
    id: 'action-files',
    title: 'File Manager',
    subtitle: 'Browse files, documents and assets',
    iconType: 'files',
    category: 'Action',
    action: (openApp) => openApp('files'),
  },
]

function evaluateMath(expression) {
  try {
    const sanitized = expression.trim().replace(/\s+/g, '')
    if (!/^[0-9+\-*/().%^eEpiPI\s]+$/.test(sanitized)) return null

    const parsedExpr = sanitized
      .replace(/pi/gi, 'Math.PI')
      .replace(/\^/g, '**')

    // eslint-disable-next-line no-new-func
    const result = Function(`'use strict'; return (${parsedExpr})`)()
    if (typeof result === 'number' && !Number.isNaN(result) && Number.isFinite(result)) {
      return Number.isInteger(result) ? result : Number(result.toFixed(6))
    }
    return null
  } catch {
    return null
  }
}

function SpotlightModal({ onClose, openApp }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const mathResult = useMemo(() => {
    if (!query.trim()) return null
    return evaluateMath(query)
  }, [query])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    const results = []

    if (mathResult !== null) {
      results.push({
        id: 'math-calc-result',
        title: `= ${mathResult}`,
        subtitle: `Calculation result for "${query}" (Press Enter to open Calculator)`,
        iconType: 'calculator',
        category: 'Calculation',
        onExecute: () => {
          openApp('calc')
          onClose()
        },
      })
    }

    if (!q) {
      appRegistry.slice(0, 6).forEach((app) => {
        results.push({
          id: app.id,
          title: app.title,
          subtitle: `Application • ${app.defaultWidth || 400}x${app.defaultHeight || 300}`,
          iconType: app.iconType,
          category: 'Applications',
          onExecute: () => {
            openApp(app.id)
            onClose()
          },
        })
      })
      return results
    }

    const matchedApps = appRegistry.filter(
      (app) =>
        app.title.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q)
    )

    matchedApps.forEach((app) => {
      results.push({
        id: app.id,
        title: app.title,
        subtitle: `Application • Launch ${app.title}`,
        iconType: app.iconType,
        category: 'Applications',
        onExecute: () => {
          openApp(app.id)
          onClose()
        },
      })
    })

    const matchedActions = QUICK_ACTIONS.filter(
      (act) =>
        act.title.toLowerCase().includes(q) ||
        act.subtitle.toLowerCase().includes(q)
    )

    matchedActions.forEach((act) => {
      results.push({
        id: act.id,
        title: act.title,
        subtitle: act.subtitle,
        iconType: act.iconType,
        category: act.category,
        onExecute: () => {
          act.action(openApp)
          onClose()
        },
      })
    })

    return results
  }, [query, mathResult, openApp, onClose])

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, searchResults.length - 1))

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (searchResults.length > 0) {
        soundService.playClick()
        setSelectedIndex((prev) => (prev + 1) % searchResults.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (searchResults.length > 0) {
        soundService.playClick()
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults.length > 0 && searchResults[safeSelectedIndex]) {
        soundService.playClick()
        searchResults[safeSelectedIndex].onExecute()
      }
    }
  }

  return (
    <div
      aria-label="Spotlight Search Overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs select-none"
    >
      <div className="w-full max-w-xl bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow flex flex-col overflow-hidden font-mono">
        {/* Search Input Bar */}
        <div className="flex items-center px-3 py-2.5 border-b-2 border-[var(--os-border)] gap-2.5 bg-[var(--os-bg)]">
          <AppIconGraphic iconType="spotlight" className="w-5 h-5 shrink-0 opacity-75" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search apps, actions, or calculate (e.g. 24 * 7)..."
            className="flex-1 bg-transparent text-sm text-[var(--os-fg)] focus:outline-none placeholder:text-[var(--os-fg)]/40 font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
                inputRef.current?.focus()
              }}
              className="text-xs px-1.5 py-0.5 border border-[var(--os-border)]/50 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
            >
              ESC
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs opacity-50">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = safeSelectedIndex === idx
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundService.playClick()
                    item.onExecute()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                      : 'border-transparent hover:bg-[var(--os-fg)]/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 p-1 border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[var(--os-bg)] bg-[var(--os-fg)] text-[var(--os-bg)]'
                          : 'border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)]'
                      }`}
                    >
                      <AppIconGraphic iconType={item.iconType} className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] opacity-70 truncate leading-tight">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 border uppercase tracking-wider ${
                        isSelected
                          ? 'border-[var(--os-bg)] opacity-90'
                          : 'border-[var(--os-border)]/40 opacity-50'
                      }`}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold">↵</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-1.5 text-[10px] border-t border-[var(--os-border)]/40 flex items-center justify-between opacity-60 bg-[var(--os-fg)]/5">
          <span>↑↓ to navigate • ↵ to select • ESC to close</span>
          <span>Payaman Spotlight</span>
        </div>
      </div>
    </div>
  )
}

export default function SpotlightSearch() {
  const { isSpotlightOpen, closeSpotlight, openApp } = useOS()

  if (!isSpotlightOpen) return null

  return <SpotlightModal onClose={closeSpotlight} openApp={openApp} />
}
