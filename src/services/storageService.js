const STORAGE_PREFIX = 'payaman_os_'

export const storageService = {
  getItem: (key, defaultValue = null) => {
    try {
      const serializedValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      if (serializedValue === null) {
        return defaultValue
      }
      return JSON.parse(serializedValue)
    } catch {
      return defaultValue
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      return true
    } catch {
      return false
    }
  },
}
