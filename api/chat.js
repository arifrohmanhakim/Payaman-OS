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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
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

    let reply = null
    let lastError = null

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )

        if (response.ok) {
          const json = await response.json()
          reply = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) break
        } else {
          lastError = await response.text()
        }
      } catch (err) {
        lastError = err.message
      }
    }

    if (!reply) {
      return res.status(502).json({
        error: 'Failed to generate response from Gemini API',
        details: lastError,
      })
    }

    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
}
