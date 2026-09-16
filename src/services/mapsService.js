import { storageService } from './storageService.js'

const STORAGE_KEY_SAVED_PLACES = 'maps_saved_places'
const STORAGE_KEY_LAST_VIEW = 'maps_last_view'

const DEFAULT_VIEW = {
  name: 'Jakarta',
  country: 'Indonesia',
  latitude: -6.2088,
  longitude: 106.8456,
  zoom: 13,
}

const DEFAULT_SAVED_PLACES = [
  { name: 'Monas, Jakarta', country: 'Indonesia', latitude: -6.1754, longitude: 106.8272, zoom: 15 },
  { name: 'Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695, zoom: 13 },
  { name: 'Denpasar, Bali', country: 'Indonesia', latitude: -8.6705, longitude: 115.2126, zoom: 13 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, zoom: 12 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, zoom: 12 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, zoom: 12 },
]

export const mapsService = {
  getLastView() {
    return storageService.getItem(STORAGE_KEY_LAST_VIEW, DEFAULT_VIEW)
  },

  setLastView(viewData) {
    storageService.setItem(STORAGE_KEY_LAST_VIEW, viewData)
  },

  getSavedPlaces() {
    return storageService.getItem(STORAGE_KEY_SAVED_PLACES, DEFAULT_SAVED_PLACES)
  },

  savePlace(place) {
    const current = this.getSavedPlaces()
    const exists = current.some(
      (p) =>
        p.name.toLowerCase() === place.name.toLowerCase() &&
        Math.abs(p.latitude - place.latitude) < 0.01
    )
    if (!exists) {
      const updated = [place, ...current].slice(0, 15)
      storageService.setItem(STORAGE_KEY_SAVED_PLACES, updated)
      return updated
    }
    return current
  },

  removePlace(placeName) {
    const current = this.getSavedPlaces()
    const updated = current.filter((p) => p.name.toLowerCase() !== placeName.toLowerCase())
    storageService.setItem(STORAGE_KEY_SAVED_PLACES, updated)
    return updated
  },

  async searchPlaces(query) {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return []

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&addressdetails=1&limit=6`

    try {
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en,id',
        },
      })
      if (!res.ok) throw new Error(`OSM Nominatim error ${res.status}`)
      const items = await res.json()

      return items.map((item) => ({
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
        category: item.class,
        boundingBox: item.boundingbox,
      }))
    } catch {
      return []
    }
  },

  async reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  buildOsmEmbedUrl(lat, lon, zoom = 14, layer = 'mapnik') {
    // Menghitung bounding box berdasarkan zoom level
    const zoomSpan = 360 / Math.pow(2, zoom) * 0.4
    const minLon = Math.max(-180, lon - zoomSpan)
    const maxLon = Math.min(180, lon + zoomSpan)
    const minLat = Math.max(-85, lat - zoomSpan * 0.6)
    const maxLat = Math.min(85, lat + zoomSpan * 0.6)

    const bbox = `${minLon.toFixed(5)},${minLat.toFixed(5)},${maxLon.toFixed(5)},${maxLat.toFixed(5)}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}&marker=${lat.toFixed(5)},${lon.toFixed(5)}`
  },
}
