import { useState, useEffect, useMemo, useCallback } from 'react'
import { soundService } from '../../services/soundService.js'
import { useOS } from '../../hooks/useOS.js'
import CaveLogo from '../common/CaveLogo.jsx'

const INSPIRATIONAL_QUOTES = [
  {
    quote: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
  },
  {
    quote: 'Design is not just what it looks like and feels like. Design is how it works.',
    author: 'Steve Jobs',
  },
  {
    quote: 'Simple things should be simple, complex things should be possible.',
    author: 'Alan Kay',
  },
  {
    quote: "It's better to be a pirate than to join the navy.",
    author: 'Steve Jobs',
  },
  {
    quote: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
  },
  {
    quote: 'Computers are like a bicycle for our minds.',
    author: 'Steve Jobs',
  },
  {
    quote: 'Good design is as little design as possible.',
    author: 'Dieter Rams',
  },
  {
    quote: 'Stay hungry, stay foolish.',
    author: 'Stewart Brand',
  },
  {
    quote: 'Make it simple, but significant.',
    author: 'Don Draper',
  },
  {
    quote: 'Technology is best when it brings people together.',
    author: 'Matt Mullenweg',
  },
]

function RetroComputerGraphic({ className = 'w-16 h-16' }) {
  return (
    <svg
      className={`${className} stroke-current fill-none stroke-[1.5]`}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <rect x="6" y="8" width="36" height="26" rx="2" strokeWidth="1.75" />
      <rect x="9" y="11" width="18" height="15" rx="1.5" strokeWidth="1.5" />
      <line x1="11" y1="13" x2="16" y2="13" strokeWidth="1" />
      <line x1="11" y1="15" x2="13" y2="15" strokeWidth="1" />
      <rect x="29" y="11" width="11" height="6" rx="0.5" strokeWidth="1.25" />
      <line x1="31" y1="14" x2="37" y2="14" strokeWidth="1.5" />
      <circle cx="38.5" cy="14" r="0.5" fill="currentColor" />
      <rect x="29" y="19" width="11" height="6" rx="0.5" strokeWidth="1.25" />
      <line x1="31" y1="22" x2="37" y2="22" strokeWidth="1.5" />
      <circle cx="38.5" cy="22" r="0.5" fill="currentColor" />
      <rect x="9" y="28" width="4" height="3" rx="0.5" fill="currentColor" />
      <line x1="15" y1="29.5" x2="25" y2="29.5" strokeWidth="1" />
      <path d="M4 34 H44 L41 40 H7 Z" strokeWidth="1.75" />
      <line x1="10" y1="37" x2="38" y2="37" strokeWidth="1.25" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

export default function WelcomeScreen({ onEnterDesktop, onReboot }) {
  const { theme, pattern } = useOS()
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)
  )

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentQuote = useMemo(
    () => INSPIRATIONAL_QUOTES[quoteIndex] || INSPIRATIONAL_QUOTES[0],
    [quoteIndex]
  )

  const shuffleQuote = useCallback(() => {
    soundService.playClick()
    setQuoteIndex((prev) => {
      let next = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)
      if (next === prev) {
        next = (prev + 1) % INSPIRATIONAL_QUOTES.length
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        soundService.playClick()
        if (onEnterDesktop) onEnterDesktop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEnterDesktop])

  const handleLogin = () => {
    soundService.playClick()
    if (onEnterDesktop) onEnterDesktop()
  }

  const handleRestart = () => {
    soundService.playClick()
    if (onReboot) onReboot()
  }

  const patternClass = `pattern-${pattern || 'halftone'}`

  return (
    <div
      data-theme={theme || 'classic'}
      className={`fixed inset-0 bg-[var(--os-desktop-bg)] text-[var(--os-fg)] flex flex-col items-center justify-center font-mono select-none z-50 p-4 ${patternClass}`}
    >
      <div className="border-3 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] os-window-shadow max-w-md w-full overflow-hidden shadow-[4px_4px_0px_var(--os-shadow)]">
        {/* Window Title Bar */}
        <div className="h-7 bg-[var(--os-fg)] text-[var(--os-bg)] px-3 flex items-center justify-between font-bold text-xs border-b border-[var(--os-border)]">
          <div className="flex items-center gap-1.5">
            <CaveLogo className="w-3.5 h-3.5" title="Payaman OS" />
            <span>Payaman OS</span>
          </div>
          <span className="text-[10px] opacity-80">System 1.0</span>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 flex flex-col items-center text-center">
          {/* Retro Computer Graphic Icon */}
          <div className="w-20 h-20 border-2 border-[var(--os-border)] rounded-xl flex items-center justify-center mb-2.5 bg-[var(--os-bg)] p-2 shadow-[2px_2px_0px_var(--os-shadow)]">
            <RetroComputerGraphic className="w-16 h-16" />
          </div>

          <h2 className="text-lg font-black tracking-tight">Arif</h2>
          <p className="text-[11px] opacity-60 mb-2">Administrator • Payaman Lab</p>

          {/* Time & Date Box */}
          <div className="my-1.5 py-1.5 px-3 border border-[var(--os-border)] text-xs bg-[var(--os-fg)]/5 w-full">
            <div className="font-bold text-sm tracking-wide">{currentTime}</div>
            <div className="text-[10px] opacity-70 mt-0.5">{currentDate}</div>
          </div>

          {/* Shuffled Quote Box */}
          <div
            onClick={shuffleQuote}
            title="Click to shuffle quote"
            className="my-2.5 p-2.5 border-2 border-dashed border-[var(--os-border)] bg-[var(--os-fg)]/5 w-full text-left cursor-pointer hover:bg-[var(--os-fg)]/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">
                Inspirational Quote
              </span>
              <span className="text-[10px] opacity-60 group-hover:opacity-100 font-bold">
                ↻ Shuffle
              </span>
            </div>
            <p className="text-xs italic leading-snug">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <div className="text-[10px] font-semibold text-right mt-1 opacity-75">
              — {currentQuote.author}
            </div>
          </div>

          {/* Action Buttons: Restart Boot & Login */}
          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex-1 py-2 px-3 border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 transition-all cursor-pointer shadow-[2px_2px_0px_var(--os-shadow)]"
            >
              Restart Boot
            </button>

            <button
              type="button"
              onClick={handleLogin}
              className="flex-1 py-2 px-3 border-2 border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] font-black text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-[2px_2px_0px_var(--os-shadow)] outline-2 outline-offset-1 outline-[var(--os-fg)]"
            >
              Login ↵
            </button>
          </div>
        </div>

        {/* Bottom Status strip */}
        <div className="border-t border-[var(--os-border)]/30 px-3 py-1 text-[10px] opacity-60 flex justify-between items-center bg-[var(--os-fg)]/5">
          <span>Storage: Virtual VFS Ready</span>
          <span>Payaman Architecture</span>
        </div>
      </div>
    </div>
  )
}
