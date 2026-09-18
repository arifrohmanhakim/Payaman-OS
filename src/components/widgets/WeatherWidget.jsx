import { useState } from 'react'
import { soundService } from '../../services/soundService.js'

const CITIES = [
  { city: 'Yogyakarta', temp: '29°C', condition: 'Partly Sunny', humidity: '68%', icon: '☀️' },
  { city: 'Jakarta', temp: '32°C', condition: 'Humid & Clear', humidity: '74%', icon: '⛅' },
  { city: 'Bandung', temp: '23°C', condition: 'Cool Breeze', humidity: '62%', icon: '🌤️' },
  { city: 'Tokyo', temp: '19°C', condition: 'Overcast', humidity: '55%', icon: '☁️' },
]

export default function WeatherWidget() {
  const [cityIndex, setCityIndex] = useState(0)
  const current = CITIES[cityIndex]

  const handleNextCity = () => {
    soundService.playClick()
    setCityIndex((prev) => (prev + 1) % CITIES.length)
  }

  return (
    <div
      onClick={handleNextCity}
      title="Click to switch city"
      className="flex flex-col justify-between h-full cursor-pointer hover:bg-[var(--os-fg)]/5 p-1 transition-colors group"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-xs flex items-center gap-1">
            <span>{current.city}</span>
            <span className="text-[9px] opacity-60">↻</span>
          </div>
          <div className="text-[10px] opacity-75">{current.condition}</div>
        </div>
        <div className="text-2xl select-none group-hover:scale-110 transition-transform">
          {current.icon}
        </div>
      </div>

      <div className="border-t border-[var(--os-border)] pt-1 flex justify-between items-end">
        <div>
          <span className="text-xl font-black">{current.temp}</span>
        </div>
        <div className="text-right text-[9px] opacity-70">
          <div>Hum: {current.humidity}</div>
          <div>Retro Weather</div>
        </div>
      </div>
    </div>
  )
}
