import { useState, useEffect } from 'react'
import { soundService } from '../../services/soundService.js'

const TRACKS = [
  { title: '8-Bit Dreaming', artist: 'Payaman Lab', duration: '2:45' },
  { title: 'Midnight Monolith', artist: 'Retro City', duration: '3:12' },
  { title: 'CRT Phosphor Rain', artist: 'Chiptune Wave', duration: '2:18' },
]

export default function MusicPlayerWidget() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [eqHeights, setEqHeights] = useState([40, 70, 30, 85, 60, 45, 90, 35])

  const currentTrack = TRACKS[trackIndex]

  useEffect(() => {
    let interval = null
    if (isPlaying) {
      interval = setInterval(() => {
        setEqHeights((prev) =>
          prev.map(() => Math.floor(20 + Math.random() * 75))
        )
      }, 150)
    } else {
      setEqHeights([15, 20, 15, 25, 20, 15, 20, 15])
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleTogglePlay = () => {
    soundService.playClick()
    const nextState = !isPlaying
    setIsPlaying(nextState)
    if (nextState) {
      soundService.playBeep(440, 0.1)
    }
  }

  const handleNextTrack = () => {
    soundService.playClick()
    setTrackIndex((prev) => (prev + 1) % TRACKS.length)
  }

  return (
    <div className="flex flex-col justify-between h-full space-y-1 text-mono text-xs">
      {/* Track Info */}
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[11px] truncate">{currentTrack.title}</div>
          <div className="text-[9px] opacity-70 truncate">{currentTrack.artist}</div>
        </div>
        <span className="text-[9px] font-bold border border-[var(--os-border)] px-1 py-0.2 shrink-0">
          {isPlaying ? 'PLAY' : 'PAUSE'}
        </span>
      </div>

      {/* Retro Pixel Equalizer Visualizer */}
      <div className="h-7 border border-[var(--os-border)] bg-[var(--os-bg)] p-1 flex items-end justify-between gap-1">
        {eqHeights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[var(--os-fg)] transition-all duration-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* Control Buttons */}
      <div className="border-t border-[var(--os-border)] pt-1 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="px-2 py-0.5 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-[10px] cursor-pointer"
          >
            {isPlaying ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={handleNextTrack}
            className="px-1.5 py-0.5 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-[10px] cursor-pointer"
            title="Next Track"
          >
            ⏭
          </button>
        </div>
        <span className="text-[9px] opacity-70">{currentTrack.duration}</span>
      </div>
    </div>
  )
}
