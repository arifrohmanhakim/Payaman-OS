import { useState, useEffect, useCallback } from 'react'
import { galleryService } from './galleryService.js'
import { soundService } from '../../services/soundService.js'

export function useGallery(initialQuery = '') {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState(initialQuery)
  const [searchInputValue, setSearchInputValue] = useState(initialQuery)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isMonochrome, setIsMonochrome] = useState(true)

  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    let isSubscribed = true

    galleryService.fetchPhotos({ query, perPage: 24 }).then((res) => {
      if (!isSubscribed) return
      if (res.success) {
        setPhotos(res.photos)
      } else {
        setError(res.error)
        soundService.playErrorAlert()
      }
      setLoading(false)
    })

    return () => {
      isSubscribed = false
    }
  }, [query, refreshIndex])

  const reloadPhotos = useCallback((newQuery) => {
    setLoading(true)
    setError(null)
    if (newQuery !== undefined) {
      setQuery(newQuery)
    } else {
      setRefreshIndex((prev) => prev + 1)
    }
  }, [])

  const handleSearch = useCallback(
    (e) => {
      e?.preventDefault()
      soundService.playClick()
      setQuery(searchInputValue.trim())
    },
    [searchInputValue]
  )

  const openLightbox = useCallback((index) => {
    soundService.playClick()
    setSelectedIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    soundService.playClick()
    setSelectedIndex(null)
  }, [])

  const selectNext = useCallback(() => {
    if (selectedIndex === null) return
    soundService.playClick()
    setSelectedIndex((prev) => (prev + 1 < photos.length ? prev + 1 : 0))
  }, [selectedIndex, photos.length])

  const selectPrev = useCallback(() => {
    if (selectedIndex === null) return
    soundService.playClick()
    setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : photos.length - 1))
  }, [selectedIndex, photos.length])

  const toggleMonochrome = useCallback(() => {
    soundService.playClick()
    setIsMonochrome((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('gallery:')) return

      if (action === 'gallery:reload') {
        reloadPhotos(query)
      } else if (action === 'gallery:toggle_mono') {
        toggleMonochrome()
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [reloadPhotos, query, toggleMonochrome])

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] || null : null

  return {
    photos,
    loading,
    error,
    query,
    searchInputValue,
    selectedPhoto,
    selectedIndex,
    isMonochrome,
    setSearchInputValue,
    handleSearch,
    loadPhotos: reloadPhotos,
    openLightbox,
    closeLightbox,
    selectNext,
    selectPrev,
    toggleMonochrome,
  }
}
