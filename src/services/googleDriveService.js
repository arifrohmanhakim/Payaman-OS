import { storageService } from './storageService.js'
import { GOOGLE_CONFIG } from '../config/google.js'

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const STORAGE_KEY_TOKEN = 'gdrive_access_token'
const STORAGE_KEY_USER_PROFILE = 'gdrive_user_profile'

class GoogleDriveService {
  constructor() {
    this.token = storageService.getItem(STORAGE_KEY_TOKEN, null)
    this.clientId = GOOGLE_CONFIG.clientId
    this.userProfile = storageService.getItem(STORAGE_KEY_USER_PROFILE, null)
    this.listeners = new Set()
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener()
      } catch (err) {
        console.error('Error in gdrive listener:', err)
      }
    }
  }

  isConnected() {
    return Boolean(this.token)
  }

  getClientId() {
    return this.clientId
  }

  getUserProfile() {
    return this.userProfile
  }

  disconnect() {
    this.token = null
    this.userProfile = null
    storageService.removeItem(STORAGE_KEY_TOKEN)
    storageService.removeItem(STORAGE_KEY_USER_PROFILE)
    this.notify()
  }

  async loadGsiScript() {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      return true
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`)
      if (existing) {
        existing.addEventListener('load', () => resolve(true))
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load Google Identity Services script.'))
        )
        return
      }

      const script = document.createElement('script')
      script.src = GSI_SCRIPT_URL
      script.async = true
      script.defer = true
      script.onload = () => resolve(true)
      script.onerror = () =>
        reject(new Error('Failed to load Google Identity Services script.'))
      document.body.appendChild(script)
    })
  }

  async connectWithGoogle() {
    if (!this.clientId) {
      throw new Error('CLIENT_ID_REQUIRED')
    }

    await this.loadGsiScript()

    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope:
            'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error))
              return
            }

            this.token = tokenResponse.access_token
            storageService.setItem(STORAGE_KEY_TOKEN, this.token)

            // Ambil info profil akun pengguna Google
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${this.token}` },
              })
              if (userInfoRes.ok) {
                const profile = await userInfoRes.json()
                this.userProfile = {
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                }
                storageService.setItem(STORAGE_KEY_USER_PROFILE, this.userProfile)
              }
            } catch {
              this.userProfile = { email: 'Akun Google Terhubung', name: 'Pengguna Google' }
            }

            this.notify()
            resolve(true)
          },
        })

        client.requestAccessToken({ prompt: 'consent' })
      } catch (err) {
        reject(err)
      }
    })
  }

  async listFiles(folderId = 'root') {
    if (!this.token) {
      return { success: false, error: 'Google Drive belum terhubung.' }
    }

    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
      const fields = encodeURIComponent(
        'files(id, name, mimeType, size, modifiedTime, iconLink, webViewLink, thumbnailLink)'
      )
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=folder,name&pageSize=100`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (response.status === 401) {
        this.disconnect()
        return {
          success: false,
          error: 'Google Drive session has expired. Please reconnect.',
        }
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errJson.error?.message || `HTTP ${response.status}: Failed to load files.`,
        }
      }

      const data = await response.json()
      return { success: true, files: data.files || [] }
    } catch (err) {
      return { success: false, error: `Connection failed: ${err.message}` }
    }
  }

  async readFileContent(fileId, mimeType = '') {
    if (!this.token) {
      return { success: false, error: 'Google Drive is not connected.' }
    }

    try {
      let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      if (mimeType.startsWith('application/vnd.google-apps.')) {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!response.ok) {
        return { success: false, error: `Failed to read file content (HTTP ${response.status}).` }
      }

      const text = await response.text()
      return { success: true, content: text }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async readFileBlob(fileId, mimeType = '') {
    if (!this.token) {
      return { success: false, error: 'Google Drive is not connected.' }
    }

    try {
      let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      if (mimeType.startsWith('application/vnd.google-apps.')) {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!response.ok) {
        return { success: false, error: `Failed to download file (HTTP ${response.status}).` }
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      return { success: true, blob, blobUrl }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async createFolder(name, parentId = 'root') {
    if (!this.token) {
      return { success: false, error: 'Google Drive is not connected.' }
    }

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errJson.error?.message || 'Failed to create folder in Google Drive.',
        }
      }

      const created = await response.json()
      return { success: true, file: created }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async uploadFile(name, content, parentId = 'root') {
    if (!this.token) {
      return { success: false, error: 'Google Drive is not connected.' }
    }

    try {
      const metadata = {
        name,
        parents: [parentId],
      }

      const boundary = '-------314159265358979323846'
      const delimiter = `\r\n--${boundary}\r\n`
      const closeDelimiter = `\r\n--${boundary}--`

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain\r\n\r\n' +
        content +
        closeDelimiter

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      )

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errJson.error?.message || 'Failed to upload file to Google Drive.',
        }
      }

      const file = await response.json()
      return { success: true, file }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async deleteFile(fileId) {
    if (!this.token) {
      return { success: false, error: 'Google Drive is not connected.' }
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!response.ok) {
        return { success: false, error: 'Failed to delete file in Google Drive.' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

export const googleDriveService = new GoogleDriveService()
