import { useState, useEffect, useCallback } from 'react'
import { storageService } from '../../services/storageService.js'

const STORAGE_KEY = 'payaman_notes_document'
const DEFAULT_CONTENT =
  'Selamat datang di Payaman OS.\n\nSistem operasi antarmuka desktop monokrom modern berbasis web.\n\nSilakan tulis catatan atau dokumen Anda di sini.'

export function useDocument() {
  const [content, setContent] = useState(() => {
    return storageService.getItem(STORAGE_KEY, DEFAULT_CONTENT)
  })
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    storageService.setItem(STORAGE_KEY, content)
  }, [content])

  const saveDocument = useCallback(() => {
    storageService.setItem(STORAGE_KEY, content)
    setStatusMessage('Tersimpan di disk')
    const timer = setTimeout(() => setStatusMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [content])

  const clearDocument = useCallback(() => {
    setContent('')
    storageService.removeItem(STORAGE_KEY)
    setStatusMessage('Dokumen dikosongkan')
    const timer = setTimeout(() => setStatusMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  return {
    content,
    setContent,
    statusMessage,
    wordCount,
    charCount,
    saveDocument,
    clearDocument,
  }
}
