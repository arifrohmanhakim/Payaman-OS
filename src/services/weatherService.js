import { storageService } from './storageService.js'

const STORAGE_KEY_LOCATION = 'weather_active_location'
const STORAGE_KEY_SAVED_CITIES = 'weather_saved_cities'
const STORAGE_KEY_UNIT = 'weather_temp_unit'
const STORAGE_KEY_CACHE = 'weather_cache_data'

const DEFAULT_LOCATION = {
  name: 'Jakarta',
  country: 'Indonesia',
  admin1: 'Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
}

const DEFAULT_SAVED_CITIES = [
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521 },
  { name: 'Bandung', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
]

export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'sun', nightIcon: 'moon' },
  1: { label: 'Mainly Clear', icon: 'cloud-sun', nightIcon: 'moon' },
  2: { label: 'Partly Cloudy', icon: 'cloud-sun', nightIcon: 'cloud' },
  3: { label: 'Overcast', icon: 'cloud', nightIcon: 'cloud' },
  45: { label: 'Foggy', icon: 'fog', nightIcon: 'fog' },
  48: { label: 'Depositing Rime Fog', icon: 'fog', nightIcon: 'fog' },
  51: { label: 'Light Drizzle', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  53: { label: 'Moderate Drizzle', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  55: { label: 'Dense Drizzle', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  56: { label: 'Freezing Drizzle', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  57: { label: 'Dense Freezing Drizzle', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  61: { label: 'Slight Rain', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  63: { label: 'Moderate Rain', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  65: { label: 'Heavy Rain', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  66: { label: 'Freezing Rain', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  67: { label: 'Heavy Freezing Rain', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  71: { label: 'Slight Snow Fall', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  73: { label: 'Moderate Snow Fall', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  75: { label: 'Heavy Snow Fall', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  77: { label: 'Snow Grains', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  80: { label: 'Slight Rain Showers', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  81: { label: 'Moderate Rain Showers', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  82: { label: 'Violent Rain Showers', icon: 'cloud-rain', nightIcon: 'cloud-rain' },
  85: { label: 'Slight Snow Showers', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  86: { label: 'Heavy Snow Showers', icon: 'cloud-snow', nightIcon: 'cloud-snow' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
  96: { label: 'Thunderstorm with Hail', icon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
  99: { label: 'Heavy Thunderstorm with Hail', icon: 'cloud-lightning', nightIcon: 'cloud-lightning' },
}

export function getWeatherCondition(wmoCode, isDay = 1) {
  const meta = WMO_WEATHER_CODES[wmoCode] || { label: 'Unknown', icon: 'cloud', nightIcon: 'cloud' }
  const iconType = isDay ? meta.icon : meta.nightIcon
  return {
    code: wmoCode,
    label: meta.label,
    iconType,
  }
}

export const weatherService = {
  getActiveLocation() {
    return storageService.getItem(STORAGE_KEY_LOCATION, DEFAULT_LOCATION)
  },

  setActiveLocation(location) {
    storageService.setItem(STORAGE_KEY_LOCATION, location)
    window.dispatchEvent(new CustomEvent('weather-location-changed', { detail: location }))
  },

  getSavedCities() {
    return storageService.getItem(STORAGE_KEY_SAVED_CITIES, DEFAULT_SAVED_CITIES)
  },

  addSavedCity(city) {
    const current = this.getSavedCities()
    const exists = current.some(
      (c) =>
        c.name.toLowerCase() === city.name.toLowerCase() &&
        Math.abs(c.latitude - city.latitude) < 0.05
    )
    if (!exists) {
      const updated = [city, ...current].slice(0, 10)
      storageService.setItem(STORAGE_KEY_SAVED_CITIES, updated)
      return updated
    }
    return current
  },

  removeSavedCity(cityName) {
    const current = this.getSavedCities()
    const updated = current.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase())
    storageService.setItem(STORAGE_KEY_SAVED_CITIES, updated)
    return updated
  },

  getTempUnit() {
    return storageService.getItem(STORAGE_KEY_UNIT, 'C')
  },

  setTempUnit(unit) {
    const valid = unit === 'F' ? 'F' : 'C'
    storageService.setItem(STORAGE_KEY_UNIT, valid)
    window.dispatchEvent(new CustomEvent('weather-unit-changed', { detail: valid }))
    return valid
  },

  getCachedWeather() {
    return storageService.getItem(STORAGE_KEY_CACHE, null)
  },

  setCachedWeather(data) {
    storageService.setItem(STORAGE_KEY_CACHE, {
      ...data,
      cachedAt: Date.now(),
    })
  },

  async searchCities(query) {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return []

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=6&language=en&format=json`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Geocoding HTTP error ${res.status}`)
      const json = await res.json()
      if (!json.results) return []

      return json.results.map((item) => ({
        name: item.name,
        country: item.country || '',
        admin1: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'auto',
      }))
    } catch {
      return []
    }
  },

  async fetchForecast(latitude, longitude, timezone = 'auto') {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'surface_pressure',
      ].join(','),
      hourly: ['temperature_2m', 'weather_code', 'is_day', 'precipitation_probability'].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'sunrise',
        'sunset',
        'uv_index_max',
      ].join(','),
      timezone: timezone || 'auto',
      forecast_days: '7',
    })

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return this.formatForecastResponse(data)
  },

  formatForecastResponse(data) {
    const current = data.current || {}
    const currentCondition = getWeatherCondition(current.weather_code ?? 0, current.is_day ?? 1)

    const hourly = []
    if (data.hourly && Array.isArray(data.hourly.time)) {
      const nowIso = current.time || new Date().toISOString()
      const nowIndex = Math.max(
        0,
        data.hourly.time.findIndex((t) => t >= nowIso.slice(0, 13))
      )
      const sliceStart = nowIndex >= 0 ? nowIndex : 0
      const sliceEnd = sliceStart + 24

      for (let i = sliceStart; i < Math.min(sliceEnd, data.hourly.time.length); i++) {
        const timeStr = data.hourly.time[i]
        const hourDate = new Date(timeStr)
        const hourLabel = i === sliceStart ? 'Now' : hourDate.getHours().toString().padStart(2, '0') + ':00'
        const code = data.hourly.weather_code[i]
        const isDay = data.hourly.is_day ? data.hourly.is_day[i] : 1
        hourly.push({
          time: timeStr,
          label: hourLabel,
          temp: Math.round(data.hourly.temperature_2m[i]),
          condition: getWeatherCondition(code, isDay),
          precipProb: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] : 0,
        })
      }
    }

    const daily = []
    if (data.daily && Array.isArray(data.daily.time)) {
      for (let i = 0; i < data.daily.time.length; i++) {
        const dateStr = data.daily.time[i]
        const dayDate = new Date(dateStr)
        const isToday = i === 0
        const dayName = isToday
          ? 'Today'
          : dayDate.toLocaleDateString('en-US', { weekday: 'short' })
        const code = data.daily.weather_code[i]
        daily.push({
          date: dateStr,
          dayName,
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          condition: getWeatherCondition(code, 1),
          precipProb: data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[i] : 0,
          uvIndex: data.daily.uv_index_max ? data.daily.uv_index_max[i] : 0,
          sunrise: data.daily.sunrise ? data.daily.sunrise[i].slice(11, 16) : '--:--',
          sunset: data.daily.sunset ? data.daily.sunset[i].slice(11, 16) : '--:--',
        })
      }
    }

    const todayDaily = daily[0] || {}

    return {
      current: {
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        pressure: Math.round(current.surface_pressure),
        precipitation: current.precipitation,
        isDay: Boolean(current.is_day),
        condition: currentCondition,
        maxTemp: todayDaily.maxTemp ?? Math.round(current.temperature_2m),
        minTemp: todayDaily.minTemp ?? Math.round(current.temperature_2m),
        sunrise: todayDaily.sunrise || '--:--',
        sunset: todayDaily.sunset || '--:--',
        uvIndex: todayDaily.uvIndex || 0,
      },
      hourly,
      daily,
      timezone: data.timezone,
      elevation: data.elevation,
      updatedAt: Date.now(),
    }
  },
}
