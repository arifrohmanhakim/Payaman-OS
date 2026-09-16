import { useState, useEffect, useCallback, useRef } from 'react'
import { weatherService } from '../../services/weatherService.js'

export function useWeather() {
  const [location, setLocation] = useState(() => weatherService.getActiveLocation())
  const [unit, setUnit] = useState(() => weatherService.getTempUnit())
  const [savedCities, setSavedCities] = useState(() => weatherService.getSavedCities())
  const [weatherData, setWeatherData] = useState(() => weatherService.getCachedWeather())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const searchTimerRef = useRef(null)

  const loadWeather = useCallback(async (loc) => {
    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return

    setIsLoading(true)
    setError(null)

    try {
      const forecast = await weatherService.fetchForecast(
        loc.latitude,
        loc.longitude,
        loc.timezone || 'auto'
      )
      setWeatherData(forecast)
      weatherService.setCachedWeather(forecast)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      if (!location || typeof location.latitude !== 'number') return
      setIsLoading(true)
      setError(null)
      try {
        const forecast = await weatherService.fetchForecast(
          location.latitude,
          location.longitude,
          location.timezone || 'auto'
        )
        if (!ignore) {
          setWeatherData(forecast)
          weatherService.setCachedWeather(forecast)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to fetch weather data')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [location])

  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail) {
        setLocation(e.detail)
      }
    }
    const handleUnitChange = (e) => {
      if (e.detail) {
        setUnit(e.detail)
      }
    }

    window.addEventListener('weather-location-changed', handleLocationChange)
    window.addEventListener('weather-unit-changed', handleUnitChange)

    return () => {
      window.removeEventListener('weather-location-changed', handleLocationChange)
      window.removeEventListener('weather-unit-changed', handleUnitChange)
    }
  }, [])

  const selectLocation = useCallback(
    (newLoc) => {
      setLocation(newLoc)
      weatherService.setActiveLocation(newLoc)
      setSearchQuery('')
      setSearchResults([])
    },
    []
  )

  const toggleUnit = useCallback(() => {
    const nextUnit = unit === 'C' ? 'F' : 'C'
    setUnit(nextUnit)
    weatherService.setTempUnit(nextUnit)
  }, [unit])

  const saveCurrentCity = useCallback(() => {
    if (!location) return
    const updated = weatherService.addSavedCity(location)
    setSavedCities(updated)
  }, [location])

  const removeCity = useCallback((cityName) => {
    const updated = weatherService.removeSavedCity(cityName)
    setSavedCities(updated)
  }, [])

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    if (!text.trim() || text.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimerRef.current = setTimeout(async () => {
      const results = await weatherService.searchCities(text)
      setSearchResults(results)
      setIsSearching(false)
    }, 350)
  }, [])

  const formatTemp = useCallback(
    (celsius) => {
      if (celsius === undefined || celsius === null || Number.isNaN(celsius)) return '--'
      if (unit === 'F') {
        const fahrenheit = Math.round((celsius * 9) / 5 + 32)
        return `${fahrenheit}°`
      }
      return `${Math.round(celsius)}°`
    },
    [unit]
  )

  const formatTempFull = useCallback(
    (celsius) => {
      if (celsius === undefined || celsius === null || Number.isNaN(celsius)) return '--'
      if (unit === 'F') {
        const fahrenheit = Math.round((celsius * 9) / 5 + 32)
        return `${fahrenheit}°F`
      }
      return `${Math.round(celsius)}°C`
    },
    [unit]
  )

  const refresh = useCallback(() => {
    loadWeather(location)
  }, [loadWeather, location])

  return {
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
  }
}
