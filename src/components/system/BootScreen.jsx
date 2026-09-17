import { useState, useEffect } from 'react'
import CaveLogo from '../common/CaveLogo.jsx'
import { soundService } from '../../services/soundService.js'

const BOOT_STEPS = [
  { text: 'Checking system ROM...', progress: 20 },
  { text: 'Mounting Virtual File System...', progress: 45 },
  { text: 'Loading desktop extensions...', progress: 70 },
  { text: 'Starting Window Server...', progress: 90 },
  { text: 'Payaman OS ready', progress: 100 },
]

export default function BootScreen({ onBootComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    soundService.playStartupChime()
  }, [])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1
        if (next < BOOT_STEPS.length) {
          setProgress(BOOT_STEPS[next].progress)
          soundService.playBeep(900 + next * 120, 0.02)
          return next
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 550)

    return () => clearInterval(stepInterval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        if (onBootComplete) {
          onBootComplete()
        }
      }, 450)
      return () => clearTimeout(timer)
    }
  }, [progress, onBootComplete])

  return (
    <div className="fixed inset-0 bg-[#000000] text-[#ffffff] flex flex-col items-center justify-center font-mono select-none z-50 p-6">
      <div className="flex flex-col items-center text-center max-w-xs w-full">
        <div className="mb-8">
          <CaveLogo className="w-16 h-16" title="Payaman OS" />
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-56 h-1 bg-[#262626] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#ffffff] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle Status Text */}
        <div className="h-4 text-[11px] text-[#888888] font-normal tracking-wide truncate w-full">
          {BOOT_STEPS[currentStepIndex]?.text || 'Booting...'}
        </div>

        {/* Minimal Skip Option */}
        <button
          type="button"
          onClick={() => onBootComplete && onBootComplete()}
          className="mt-8 text-[10px] text-[#555555] hover:text-[#cccccc] transition-colors cursor-pointer tracking-wider uppercase"
        >
          Skip Booting
        </button>
      </div>
    </div>
  )
}
