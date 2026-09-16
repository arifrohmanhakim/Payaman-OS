import { useState, useEffect, useCallback, useRef } from 'react'
import { geminiChatService } from '../../services/geminiChatService.js'

const INITIAL_GREETING = {
  id: 'msg-welcome',
  sender: 'ai',
  text: 'Halo Arif! Saya Payaman AI, teman ngobrol cerdasmu di Payaman OS. Mau ngobrolin apa hari ini?',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
}

export function useChat() {
  const [messages, setMessages] = useState(() => {
    const saved = geminiChatService.getChatHistory()
    return saved && saved.length > 0 ? saved : [INITIAL_GREETING]
  })
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    geminiChatService.saveChatHistory(messages)
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const sendMessage = useCallback(
    async (textToSend) => {
      const messageText = (textToSend !== undefined ? textToSend : inputText).trim()
      if (!messageText || isLoading) return

      const timeNow = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const userMessage = {
        id: `msg-${Date.now()}-u`,
        sender: 'user',
        text: messageText,
        timestamp: timeNow,
      }

      setMessages((prev) => [...prev, userMessage])
      setInputText('')
      setIsLoading(true)
      setError(null)

      try {
        const replyText = await geminiChatService.sendChatMessage({
          message: messageText,
          history: messages,
        })

        const aiMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }

        setMessages((prev) => [...prev, aiMessage])
      } catch (err) {
        setError(err.message || 'Gagal menerima respon dari AI.')
      } finally {
        setIsLoading(false)
      }
    },
    [inputText, isLoading, messages]
  )

  const clearChat = useCallback(() => {
    geminiChatService.clearChatHistory()
    setMessages([
      {
        ...INITIAL_GREETING,
        id: `msg-welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setError(null)
  }, [])

  const copyMessage = useCallback((text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }, [])

  return {
    messages,
    inputText,
    isLoading,
    error,
    isCopied,
    messagesEndRef,
    setInputText,
    sendMessage,
    clearChat,
    copyMessage,
  }
}
