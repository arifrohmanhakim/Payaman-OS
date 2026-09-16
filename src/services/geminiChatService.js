import { storageService } from './storageService.js'

const STORAGE_KEY_CHAT_HISTORY = 'payaman_chat_history'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const SYSTEM_INSTRUCTION = `Kamu adalah Payaman AI, asisten virtual dan teman ngobrol cerdas di Payaman OS (sebuah web OS bertema retro monochrome Macintosh).
Karaktermu:
- Sangat ramah, hangat, santai, cerdas, dan menyenangkan untuk diajak ngobrol tentang apa saja.
- Gunakan gaya bahasa yang natural, luwes, dan sopan.
- Berikan respon yang informatif, menarik, dan mudah dipahami tanpa bertele-tele.
- Selalu utamakan bahasa Indonesia yang baik dan santai kecuali pengguna memulai dengan bahasa lain.`

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview',
  'gemini-2.5-pro',
]

let cachedWorkingModel = 'gemini-3.6-flash'

export const geminiChatService = {
  getApiKey() {
    return GEMINI_API_KEY
  },

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
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('API Key Gemini belum disetel. Tambahkan VITE_GEMINI_API_KEY di file .env')
    }

    const formattedContents = history
      .filter((item) => item.text && (item.sender === 'user' || item.sender === 'ai'))
      .map((item) => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }],
      }))

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const payload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1200,
      },
    }

    const modelsToTry = [
      cachedWorkingModel,
      ...CANDIDATE_MODELS.filter((m) => m !== cachedWorkingModel),
    ]

    for (const modelName of modelsToTry) {
      try {
        const reply = await this.callGeminiEndpoint(modelName, apiKey, payload)
        cachedWorkingModel = modelName
        return reply
      } catch {
        // Coba model berikutnya
      }
    }

    throw new Error('Maaf, tidak dapat terhubung ke AI saat ini. Silakan coba kirim ulang.')
  },

  async callGeminiEndpoint(modelName, apiKey, payload) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Model ${modelName} failed with HTTP ${response.status}`)
    }

    const json = await response.json()
    const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!candidate) {
      throw new Error('Empty response from model')
    }

    return candidate
  },
}
