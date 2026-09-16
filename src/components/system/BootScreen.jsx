import { useState, useEffect } from 'react'
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
        {/* Iconic Apple Logo Graphic */}
        <div className="mb-8">
          <svg
            className="w-16 h-16 fill-current"
            viewBox="0 0 170 170"
            aria-hidden="true"
          >
            {/* Apple Leaf */}
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.63-13.98-5.55-8.61-9.97-18.06-13.25-28.37-3.28-10.31-4.92-20.47-4.92-30.49 0-14.53 3.66-26.68 10.98-36.46 7.32-9.78 16.59-14.77 27.81-14.97 4.9.12 10.42 1.41 16.56 3.87 6.14 2.46 10.02 3.74 11.64 3.84 2.05-.22 6.09-1.57 12.13-4.04 6.04-2.47 11.29-3.61 15.75-3.42 13.94.8 24.62 5.86 32.03 15.19-12.22 7.42-18.17 17.5-17.84 30.23.33 9.9 4.14 18.05 11.43 24.45 7.29 6.4 15.78 10.03 25.48 10.89-2.61 7.91-5.77 15.4-9.48 22.48zM119.22 31.84c0-7.39 2.65-14.34 7.94-20.85 5.29-6.51 11.83-10.49 19.62-11.95.87 7.72-1.63 14.86-7.51 21.43-5.88 6.57-12.57 10.37-20.05 11.37z" />
          </svg>
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
