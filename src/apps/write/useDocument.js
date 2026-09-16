import { useState, useEffect, useCallback } from 'react'
import { storageService } from '../../services/storageService.js'

const STORAGE_KEY = 'payaman_notes_document'
const DEFAULT_CONTENT =
  'Welcome to Payaman OS.\n\nA modern monochrome web desktop operating system.\n\nFeel free to write your notes or documents here.'

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
    setStatusMessage('Saved to disk')
    const timer = setTimeout(() => setStatusMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [content])

  const clearDocument = useCallback(() => {
    setContent('')
    storageService.removeItem(STORAGE_KEY)
    setStatusMessage('Document cleared')
    const timer = setTimeout(() => setStatusMessage(''), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('write:')) return

      if (action === 'write:save') {
        saveDocument()
      } else if (action === 'write:new' || action === 'write:clear') {
        clearDocument()
      } else if (action === 'write:undo') {
        document.execCommand('undo')
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [saveDocument, clearDocument])

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
