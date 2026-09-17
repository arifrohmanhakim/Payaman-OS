import { useState, useRef, useEffect } from 'react'
import { useWeather } from './useWeather.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'

export default function WeatherApp() {
  const {
    location,
    unit,
    savedCities,
    weatherData,
    isLoading,
    error,
    searchQuery,
    searchResults,
    isSearching,
    selectLocation,
    toggleUnit,
    saveCurrentCity,
    removeCity,
    handleSearchChange,
    formatTemp,
    formatTempFull,
    refresh,
  } = useWeather()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'cities'
  const searchInputRef = useRef(null)

  const current = weatherData?.current
  const hourly = weatherData?.hourly || []
  const daily = weatherData?.daily || []

  const isCurrentSaved = savedCities.some(
    (c) =>
      c.name.toLowerCase() === location?.name?.toLowerCase() &&
      Math.abs(c.latitude - (location?.latitude || 0)) < 0.05
  )

  useEffect(() => {
    const handleMenuAction = (e) => {
      const { action } = e.detail || {}
      if (action === 'weather:refresh') {
        refresh()
      } else if (action === 'weather:toggle_unit') {
        toggleUnit()
      } else if (action === 'weather:search') {
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [refresh, toggleUnit])

  return (
    <div className="w-full h-full flex flex-col bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none overflow-hidden">
      {/* Search & Top Controls */}
      <div className="p-2 border-b-2 border-[var(--os-border)] flex items-center justify-between gap-2 shrink-0 bg-[var(--os-bg)]">
        <div className="relative flex-1 max-w-sm">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search city (e.g. Jakarta, Tokyo, London)..."
            className="w-full bg-[var(--os-bg)] border border-[var(--os-border)] px-2 py-1 text-xs font-mono text-[var(--os-fg)] focus:outline-none focus:ring-1 focus:ring-[var(--os-border)] placeholder:opacity-40"
          />

          {/* Search dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow z-50 max-h-48 overflow-y-auto">
              {isSearching && (
                <div className="px-3 py-2 text-xs opacity-60 text-center">
                  Searching cities...
                </div>
              )}
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.name}-${item.latitude}-${idx}`}
                  type="button"
                  onClick={() => selectLocation(item)}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] flex items-center justify-between border-b border-[var(--os-border)]/20 last:border-none"
                >
                  <span className="font-bold truncate">{item.name}</span>
                  <span className="text-[10px] opacity-70 ml-2 truncate">
                    {[item.admin1, item.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleUnit}
            title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
            className="px-2 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-xs"
          >
            °{unit}
          </button>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            title="Refresh weather data"
            className="px-2 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] disabled:opacity-40"
          >
            {isLoading ? '...' : '↻'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab((t) => (t === 'overview' ? 'cities' : 'overview'))}
            className={`px-2 py-1 border border-[var(--os-border)] ${
              activeTab === 'cities'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                : 'hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]'
            }`}
          >
            {activeTab === 'cities' ? 'Overview' : 'Cities'}
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === 'cities' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">Saved Locations</span>
            {!isCurrentSaved && location && (
              <button
                type="button"
                onClick={saveCurrentCity}
                className="px-2 py-0.5 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[10px]"
              >
                + Save Current ({location.name})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {savedCities.map((city) => {
              const isSelected =
                location?.name?.toLowerCase() === city.name.toLowerCase() &&
                Math.abs((location?.latitude || 0) - city.latitude) < 0.05

              return (
                <div
                  key={`${city.name}-${city.latitude}`}
                  className={`p-2 border-2 ${
                    isSelected
                      ? 'border-[var(--os-border)] bg-[var(--os-fg)]/10 font-bold'
                      : 'border-[var(--os-border)]/50 hover:border-[var(--os-border)]'
                  } flex items-center justify-between cursor-pointer`}
                  onClick={() => {
                    selectLocation(city)
                    setActiveTab('overview')
                  }}
                >
                  <div className="truncate">
                    <div className="text-sm font-bold truncate">{city.name}</div>
                    <div className="text-[10px] opacity-60 truncate">{city.country}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCity(city.name)
                      }}
                      title="Remove city"
                      className="px-1.5 py-0.5 text-[10px] border border-[var(--os-border)]/50 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {error && (
            <div className="p-2 border-2 border-[var(--os-border)] bg-[var(--os-fg)]/5 text-center">
              <span className="font-bold">Notice:</span> {error}
            </div>
          )}

          {/* Hero Current Weather */}
          <div className="border-2 border-[var(--os-border)] p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--os-bg)]">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="text-xl font-black tracking-tight">{location?.name || 'Jakarta'}</div>
              <div className="text-[11px] opacity-70">
                {[location?.admin1, location?.country].filter(Boolean).join(', ') || 'Indonesia'}
              </div>
              <div className="mt-1 text-sm font-semibold tracking-wide">
                {current?.condition?.label || 'Loading weather...'}
              </div>
              <div className="text-[11px] opacity-60 mt-0.5">
                H: {formatTemp(current?.maxTemp)} &nbsp; L: {formatTemp(current?.minTemp)} &nbsp;•&nbsp; Feels like {formatTemp(current?.feelsLike)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AppIconGraphic
                iconType={current?.condition?.iconType || 'weather'}
                className="w-14 h-14"
              />
              <div className="text-4xl md:text-5xl font-black tracking-tighter">
                {current ? formatTemp(current.temp) : '--'}
              </div>
            </div>
          </div>

          {/* Hourly Forecast (24 Hours) */}
          {hourly.length > 0 && (
            <div className="border-2 border-[var(--os-border)] p-2">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                Hourly Forecast
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-center scrollbar-none">
                {hourly.map((h, idx) => (
                  <div
                    key={`${h.time}-${idx}`}
                    className="min-w-14 flex flex-col items-center p-1 border border-[var(--os-border)]/30 rounded shrink-0"
                  >
                    <span className="text-[10px] opacity-70 font-semibold">{h.label}</span>
                    <AppIconGraphic
                      iconType={h.condition.iconType}
                      className="w-5 h-5 my-1"
                    />
                    <span className="font-bold text-xs">{formatTemp(h.temp)}</span>
                    {h.precipProb > 0 && (
                      <span className="text-[9px] opacity-60 text-blue-600 dark:text-blue-400">
                        {h.precipProb}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          {daily.length > 0 && (
            <div className="border-2 border-[var(--os-border)] p-2">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                7-Day Forecast
              </div>
              <div className="space-y-1">
                {daily.map((d, idx) => (
                  <div
                    key={`${d.date}-${idx}`}
                    className="flex items-center justify-between py-1 px-1.5 border-b border-[var(--os-border)]/20 last:border-none text-xs"
                  >
                    <span className="w-16 font-bold truncate">{d.dayName}</span>
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <AppIconGraphic
                        iconType={d.condition.iconType}
                        className="w-4 h-4"
                      />
                      <span className="text-[11px] opacity-80 truncate hidden sm:inline">
                        {d.condition.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="opacity-50 text-[11px]">{formatTemp(d.minTemp)}</span>
                      <div className="w-16 h-1 bg-[var(--os-border)]/20 relative rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-1/4 right-1/4 bg-[var(--os-fg)]/60 rounded-full" />
                      </div>
                      <span className="font-bold text-xs w-8">{formatTemp(d.maxTemp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">Humidity</div>
              <div className="text-base font-bold mt-0.5">
                {current?.humidity !== undefined ? `${current.humidity}%` : '--'}
              </div>
              <div className="text-[9px] opacity-50">Relative humidity</div>
            </div>

            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">Wind</div>
              <div className="text-base font-bold mt-0.5">
                {current?.windSpeed !== undefined ? `${current.windSpeed} km/h` : '--'}
              </div>
              <div className="text-[9px] opacity-50">
                Direction: {current?.windDirection !== undefined ? `${current.windDirection}°` : '--'}
              </div>
            </div>

            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">UV Index</div>
              <div className="text-base font-bold mt-0.5">
                {current?.uvIndex !== undefined ? current.uvIndex : '--'}
              </div>
              <div className="text-[9px] opacity-50">
                {current?.uvIndex > 5 ? 'High' : current?.uvIndex > 2 ? 'Moderate' : 'Low'}
              </div>
            </div>

            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">Pressure</div>
              <div className="text-base font-bold mt-0.5">
                {current?.pressure !== undefined ? `${current.pressure} hPa` : '--'}
              </div>
              <div className="text-[9px] opacity-50">Surface air pressure</div>
            </div>

            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">Sunrise / Sunset</div>
              <div className="text-xs font-bold mt-1">
                Rise: {current?.sunrise || '--:--'} &nbsp;|&nbsp; Set: {current?.sunset || '--:--'}
              </div>
              <div className="text-[9px] opacity-50 mt-0.5">Local daylight cycle</div>
            </div>

            <div className="border border-[var(--os-border)] p-2">
              <div className="text-[10px] opacity-60 uppercase">Precipitation</div>
              <div className="text-base font-bold mt-0.5">
                {current?.precipitation !== undefined ? `${current.precipitation} mm` : '0 mm'}
              </div>
              <div className="text-[9px] opacity-50">Rainfall volume</div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] opacity-50 text-center pt-2 pb-1 border-t border-[var(--os-border)]/20">
            Powered by Open-Meteo Free Weather API • {location?.name} ({formatTempFull(current?.temp)})
          </div>
        </div>
      )}
    </div>
  )
}
