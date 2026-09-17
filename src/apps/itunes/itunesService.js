const ITUNES_API_URL = 'https://itunes.apple.com/search'

const DEFAULT_GENRES = [
  { id: 'top', title: 'Top Hits', query: 'hits' },
  { id: 'rock', title: 'Classic Rock', query: 'classic rock' },
  { id: 'lofi', title: 'Lofi Chill', query: 'lofi chill' },
  { id: 'jazz', title: 'Jazz & Soul', query: 'jazz soul' },
  { id: 'retro', title: '80s Synthpop', query: '80s synthpop' },
  { id: 'indonesia', title: 'Indonesian Vibes', query: 'sheila on 7' },
]

const FALLBACK_TRACKS = [
  {
    id: 'demo-1',
    title: 'Apocalypse',
    artist: 'Cigarettes After Sex',
    album: 'Cigarettes After Sex',
    genre: 'Alternative',
    durationMs: 290000,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b1/43/b0/b143b0ee-863a-8f7c-3c56-a67110ef1591/mzaf_10438092015459317290.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b3/5e/0f/b35e0fbe-2370-fc48-0f0c-977525e93bf2/720841214601_Cover.jpg/100x100bb.jpg',
    trackNumber: 1,
    releaseYear: '2017',
  },
  {
    id: 'demo-2',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    genre: 'Rock',
    durationMs: 355000,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/11/52/8f1152a9-fd5f-0021-f546-b97579c22ec3/mzaf_3962258993076347789.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/100x100bb.jpg',
    trackNumber: 2,
    releaseYear: '1975',
  },
  {
    id: 'demo-3',
    title: 'Dan...',
    artist: 'Sheila on 7',
    album: 'Sheila on 7',
    genre: 'Pop / Rock',
    durationMs: 280000,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9f/8e/3c/9f8e3c15-46f9-03b8-3e4b-703a55ad58f0/mzaf_10793617369324545129.plus.aac.p.m4a',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/bc/d0/a4bcd00f-4318-7b98-d227-2c1b9ebec5d9/074646985822.jpg/100x100bb.jpg',
    trackNumber: 3,
    releaseYear: '1999',
  },
]

export const itunesService = {
  getGenres() {
    return DEFAULT_GENRES
  },

  async searchSongs(searchTerm, limit = 25) {
    if (!searchTerm || !searchTerm.trim()) {
      return FALLBACK_TRACKS
    }

    const trimmedQuery = encodeURIComponent(searchTerm.trim())
    const url = `${ITUNES_API_URL}?term=${trimmedQuery}&entity=song&limit=${limit}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data || !Array.isArray(data.results) || data.results.length === 0) {
        return FALLBACK_TRACKS
      }

      const tracks = data.results
        .filter((track) => track.previewUrl)
        .map((track) => ({
          id: track.trackId || `${track.artistName}-${track.trackName}`,
          title: track.trackName || 'Untitled Track',
          artist: track.artistName || 'Unknown Artist',
          album: track.collectionName || 'Single / Unknown Album',
          genre: track.primaryGenreName || 'Music',
          durationMs: track.trackTimeMillis || 30000,
          previewUrl: track.previewUrl,
          artworkUrl: track.artworkUrl100 || track.artworkUrl60 || null,
          trackNumber: track.trackNumber || 1,
          releaseYear: track.releaseDate ? track.releaseDate.substring(0, 4) : '—',
        }))

      return tracks.length > 0 ? tracks : FALLBACK_TRACKS
    } catch {
      return FALLBACK_TRACKS
    }
  },

  formatDuration(durationMs) {
    if (!durationMs || isNaN(durationMs)) return '0:00'
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  },

  formatSeconds(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  },
}
