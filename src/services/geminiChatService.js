import { storageService } from './storageService.js'

const STORAGE_KEY_CHAT_HISTORY = 'payaman_chat_history'

export const geminiChatService = {
  getChatHistory() {
    return storageService.getItem(STORAGE_KEY_CHAT_HISTORY, [])
  },

  saveChatHistory(messages) {
    storageService.setItem(STORAGE_KEY_CHAT_HISTORY, messages.slice(-50))
  },

  clearChatHistory() {
    storageService.removeItem(STORAGE_KEY_CHAT_HISTORY)
  },

  async sendChatMessage({ message, history = [] }) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Server error (${response.status})`
        )
      }

      const data = await response.json()
      if (!data.reply) {
        throw new Error('Respon AI kosong.')
      }

      return data.reply
    } catch (err) {
      throw new Error(
        err.message || 'Maaf, tidak dapat terhubung ke AI saat ini. Silakan coba lagi.'
      )
    }
  },
}
