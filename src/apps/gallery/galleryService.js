const UNSPLASH_ACCESS_KEY = 'oU4luUo6112qpdFjQ0RRUM88cPDINyZW35uOwES61Ks'
const BASE_URL = 'https://api.unsplash.com'

const cache = new Map()

export const galleryService = {
  async fetchPhotos({ page = 1, perPage = 20, query = '' } = {}) {
    const cacheKey = `${query}_${page}_${perPage}`
    if (cache.has(cacheKey)) {
      return { success: true, photos: cache.get(cacheKey) }
    }

    try {
      const endpoint = query.trim()
        ? `${BASE_URL}/search/photos?page=${page}&per_page=${perPage}&query=${encodeURIComponent(
            query.trim()
          )}`
        : `${BASE_URL}/photos?page=${page}&per_page=${perPage}&order_by=popular`

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Batas permintaan Unsplash API (Rate limit) telah tercapai.')
        }
        if (response.status === 401) {
          throw new Error('Kredensial Unsplash API tidak valid.')
        }
        throw new Error(`Gagal memuat foto (Kode status: ${response.status})`)
      }

      const data = await response.json()
      const rawPhotos = query.trim() ? data.results || [] : data || []

      const sanitizedPhotos = rawPhotos.map((item) => ({
        id: item.id,
        title: item.alt_description || item.description || 'Foto Unsplash',
        description: item.description || item.alt_description || '',
        urls: {
          thumb: item.urls?.thumb || item.urls?.small,
          small: item.urls?.small,
          regular: item.urls?.regular,
          full: item.urls?.full,
        },
        likes: item.likes || 0,
        user: {
          name: item.user?.name || 'Anonim',
          username: item.user?.username || '',
          profileUrl: item.user?.links?.html || 'https://unsplash.com',
          avatar: item.user?.profile_image?.small,
        },
        link: item.links?.html || 'https://unsplash.com',
      }))

      cache.set(cacheKey, sanitizedPhotos)
      return { success: true, photos: sanitizedPhotos }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Terjadi kesalahan saat menghubungi server Unsplash.',
        photos: [],
      }
    }
  },
}
