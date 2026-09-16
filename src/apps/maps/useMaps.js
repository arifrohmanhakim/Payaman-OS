import { useState, useCallback, useRef, useEffect } from 'react'
import { mapsService } from '../../services/mapsService.js'

export function useMaps() {
  const [currentView, setCurrentView] = useState(() => mapsService.getLastView())
  const [savedPlaces, setSavedPlaces] = useState(() => mapsService.getSavedPlaces())
  const [mapFilter, setMapFilter] = useState('retro') // 'retro' | 'normal'
  const [layer, setLayer] = useState('mapnik') // 'mapnik' | 'hot'

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const searchTimerRef = useRef(null)

  useEffect(() => {
    mapsService.setLastView(currentView)
  }, [currentView])

  const setLocation = useCallback((name, lat, lon, zoom = 14) => {
    setCurrentView({
      name: name || 'Selected Location',
      latitude: lat,
      longitude: lon,
      zoom,
    })
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const zoomIn = useCallback(() => {
    setCurrentView((prev) => ({
      ...prev,
      zoom: Math.min(18, prev.zoom + 1),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setCurrentView((prev) => ({
      ...prev,
      zoom: Math.max(3, prev.zoom - 1),
    }))
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
      const results = await mapsService.searchPlaces(text)
      setSearchResults(results)
      setIsSearching(false)
    }, 400)
  }, [])

  const selectSearchResult = useCallback((item) => {
    setLocation(item.name, item.latitude, item.longitude, 14)
  }, [setLocation])

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation not supported by browser.')
      return
    }

    setIsLocating(true)
    setStatusMessage('Acquiring current position...')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setIsLocating(false)
        setStatusMessage('')

        const geo = await mapsService.reverseGeocode(lat, lon)
        const name = geo?.address?.city || geo?.address?.town || geo?.address?.suburb || 'My Location'
        setLocation(name, lat, lon, 15)
      },
      (err) => {
        setIsLocating(false)
        setStatusMessage(`Location error: ${err.message}`)
        setTimeout(() => setStatusMessage(''), 4000)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [setLocation])

  const saveCurrentPlace = useCallback(() => {
    const place = {
      name: currentView.name,
      latitude: currentView.latitude,
      longitude: currentView.longitude,
      zoom: currentView.zoom,
    }
    const updated = mapsService.savePlace(place)
    setSavedPlaces(updated)
  }, [currentView])

  const removePlace = useCallback((placeName) => {
    const updated = mapsService.removePlace(placeName)
    setSavedPlaces(updated)
  }, [])

  const toggleFilter = useCallback(() => {
    setMapFilter((f) => (f === 'retro' ? 'normal' : 'retro'))
  }, [])

  const toggleLayer = useCallback(() => {
    setLayer((l) => (l === 'mapnik' ? 'hot' : 'mapnik'))
  }, [])

  const embedUrl = mapsService.buildOsmEmbedUrl(
    currentView.latitude,
    currentView.longitude,
    currentView.zoom,
    layer
  )

  return {
    currentView,
    savedPlaces,
    mapFilter,
    layer,
    searchQuery,
    searchResults,
    isSearching,
    isLocating,
    statusMessage,
    embedUrl,
    zoomIn,
    zoomOut,
    setLocation,
    handleSearchChange,
    selectSearchResult,
    locateUser,
    saveCurrentPlace,
    removePlace,
    toggleFilter,
    toggleLayer,
  }
}
