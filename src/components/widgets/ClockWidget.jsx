import { useState, useEffect } from 'react'

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const secAngle = seconds * 6
  const minAngle = minutes * 6 + seconds * 0.1
  const hourAngle = (hours % 12) * 30 + minutes * 0.5

  const timeString = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const dateString = time.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center justify-between h-full gap-1.5 text-center">
      {/* Retro Analog Clock Face */}
      <div className="relative w-20 h-20 border-2 border-[var(--os-border)] rounded-full bg-[var(--os-bg)] flex items-center justify-center p-1 shrink-0">
        {/* Hour markers 12, 3, 6, 9 */}
        <span className="absolute top-1 font-bold text-[8px] leading-none">12</span>
        <span className="absolute right-1.5 font-bold text-[8px] leading-none">3</span>
        <span className="absolute bottom-1 font-bold text-[8px] leading-none">6</span>
        <span className="absolute left-1.5 font-bold text-[8px] leading-none">9</span>

        {/* Center Pivot Point */}
        <div className="w-1.5 h-1.5 bg-[var(--os-fg)] rounded-full z-20" />

        {/* Hour Hand */}
        <div
          className="absolute w-[2px] h-6 bg-[var(--os-fg)] origin-bottom rounded-xs z-10"
          style={{
            transform: `translateY(-50%) rotate(${hourAngle}deg)`,
            top: '20px',
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-[1.5px] h-8 bg-[var(--os-fg)] origin-bottom rounded-xs z-10"
          style={{
            transform: `translateY(-50%) rotate(${minAngle}deg)`,
            top: '12px',
          }}
        />

        {/* Second Hand */}
        <div
          className="absolute w-[1px] h-9 bg-[var(--os-fg)] origin-bottom opacity-75 z-15"
          style={{
            transform: `translateY(-50%) rotate(${secAngle}deg)`,
            top: '8px',
          }}
        />
      </div>

      {/* Digital Readout */}
      <div className="w-full border-t border-[var(--os-border)] pt-1">
        <div className="font-bold text-xs tracking-wider">{timeString}</div>
        <div className="text-[9px] opacity-70 truncate">{dateString}</div>
      </div>
    </div>
  )
}
