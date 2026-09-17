import { useState, useEffect, useRef, useCallback } from 'react'
import { itunesService } from './itunesService.js'

export function useITunes() {
  const [activeGenreId, setActiveGenreId] = useState('top')
  const [searchQuery, setSearchQuery] = useState('')
  const [songs, setSongs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const audioRef = useRef(null)
  const onNextTrackRef = useRef(null)

  const playTrack = useCallback(
    (track) => {
      if (!audioRef.current || !track || !track.previewUrl) return
      setCurrentTrack(track)
      const audio = audioRef.current
      try {
        audio.pause()
        audio.src = track.previewUrl
        audio.currentTime = 0
        audio.volume = isMuted ? 0 : volume / 100
        audio.load()
        const promise = audio.play()
        if (promise !== undefined) {
          promise
            .then(() => {
              setIsPlaying(true)
            })
            .catch(() => {
              setIsPlaying(false)
            })
        }
      } catch {
        setIsPlaying(false)
      }
    },
    [isMuted, volume]
  )

  const handleNextTrack = useCallback(() => {
    if (songs.length === 0) return
    if (!currentTrack) {
      playTrack(songs[0])
      return
    }

    let nextIndex = 0
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length)
    } else {
      const currentIndex = songs.findIndex((s) => s.id === currentTrack.id)
      nextIndex = (currentIndex + 1) % songs.length
    }

    playTrack(songs[nextIndex])
  }, [songs, currentTrack, isShuffle, playTrack])

  useEffect(() => {
    onNextTrackRef.current = handleNextTrack
  }, [handleNextTrack])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else if (onNextTrackRef.current) {
        onNextTrackRef.current()
      }
    }

    const handleError = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.src = ''
    }
  }, [isRepeat])

  const fetchSongs = useCallback(async (query) => {
    setIsLoading(true)
    const results = await itunesService.searchSongs(query)
    setSongs(results)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let isCancelled = false
    const genres = itunesService.getGenres()
    const currentGenre = genres.find((g) => g.id === activeGenreId)
    const term = currentGenre ? currentGenre.query : 'hits'

    async function loadGenreTracks() {
      setIsLoading(true)
      const results = await itunesService.searchSongs(term)
      if (!isCancelled) {
        setSongs(results)
        setIsLoading(false)
      }
    }

    loadGenreTracks()

    return () => {
      isCancelled = true
    }
  }, [activeGenreId])

  const handleSearchSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault()
      if (!searchQuery.trim()) return
      setActiveGenreId(null)
      fetchSongs(searchQuery)
    },
    [searchQuery, fetchSongs]
  )

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    const audio = audioRef.current
    if (!currentTrack && songs.length > 0) {
      playTrack(songs[0])
      return
    }

    if (isPlaying) {
      audio.pause()
    } else if (audio.src) {
      const promise = audio.play()
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    } else if (currentTrack) {
      playTrack(currentTrack)
    }
  }, [currentTrack, isPlaying, songs, playTrack])

  const handlePrevTrack = useCallback(() => {
    if (songs.length === 0) return
    if (!currentTrack) {
      playTrack(songs[0])
      return
    }

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    const currentIndex = songs.findIndex((s) => s.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    playTrack(songs[prevIndex])
  }, [songs, currentTrack, playTrack])

  const seekTo = useCallback((seconds) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = seconds
    setCurrentTime(seconds)
  }, [])

  const setVolumeLevel = useCallback(
    (level) => {
      const val = Math.max(0, Math.min(100, level))
      setVolume(val)
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : val / 100
      }
      if (val > 0 && isMuted) {
        setIsMuted(false)
      }
    },
    [isMuted]
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume / 100
      }
      return next
    })
  }, [volume])

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev)
  }, [])

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev)
  }, [])

  const selectGenre = useCallback((genreId) => {
    setSearchQuery('')
    setActiveGenreId(genreId)
  }, [])

  return {
    genres: itunesService.getGenres(),
    activeGenreId,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    selectGenre,
    songs,
    isLoading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    playTrack,
    togglePlayPause,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  }
}
