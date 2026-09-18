import { useState, useCallback } from 'react'
import { getFileCategory } from '../../../utils/fileTypes.js'

export function useFilePreviewLoader({ storageSource, readFileContent, gdrive }) {
  const [filePreview, setFilePreview] = useState(null)
  const [quickLookFile, setQuickLookFile] = useState(null)

  const loadItemPreviewData = useCallback(async (item) => {
    if (!item) return null
    if (storageSource === 'local') {
      if (item.type === 'dir') {
        return {
          name: item.name,
          type: 'dir',
          size: 0,
          mimeType: 'folder',
        }
      }
      const res = readFileContent(item.name)
      if (res.success) {
        const category = getFileCategory(item.name)
        let url = null
        const content = res.content || ''
        if (content.startsWith('data:') || content.startsWith('blob:') || content.startsWith('http')) {
          url = content
        } else if (category === 'image' && item.name.endsWith('.svg')) {
          const blob = new Blob([content], { type: 'image/svg+xml' })
          url = URL.createObjectURL(blob)
        }
        return {
          name: item.name,
          content,
          url,
          size: item.size || content.length,
          mimeType: item.mimeType || '',
        }
      }
      return { name: item.name, content: '', size: item.size || 0 }
    } else {
      // Google Drive
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        return {
          name: item.name,
          type: 'dir',
          mimeType: item.mimeType,
        }
      }
      const category = getFileCategory(item.name, item.mimeType)
      if (category === 'image' || category === 'pdf' || category === 'audio' || category === 'video') {
        const blobRes = await gdrive.readFileBlob(item.id, item.mimeType)
        return {
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
          blobUrl: blobRes.blobUrl,
          webViewLink: item.webViewLink,
        }
      }
      const res = await gdrive.readFileContent(item.id, item.mimeType)
      return {
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        content: res.success ? res.content : '',
        webViewLink: item.webViewLink,
      }
    }
  }, [storageSource, readFileContent, gdrive])

  const openLocalItem = useCallback((item, navigateTo, currentPath) => {
    if (item.type === 'dir') {
      const nextPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`
      navigateTo(nextPath)
    } else {
      const res = readFileContent(item.name)
      if (res.success) {
        const category = getFileCategory(item.name)
        let url = null
        const content = res.content || ''
        if (content.startsWith('data:') || content.startsWith('blob:') || content.startsWith('http')) {
          url = content
        } else if (category === 'image' && item.name.endsWith('.svg')) {
          const blob = new Blob([content], { type: 'image/svg+xml' })
          url = URL.createObjectURL(blob)
        }
        setFilePreview({
          name: item.name,
          content,
          url,
          size: item.size || content.length,
          mimeType: item.mimeType || '',
        })
      }
    }
  }, [readFileContent])

  const openGdriveItem = useCallback(async (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      gdrive.navigateToFolder(file.id, file.name)
      return
    }

    const category = getFileCategory(file.name, file.mimeType)

    if (category === 'image' || category === 'pdf' || category === 'audio' || category === 'video') {
      const blobRes = await gdrive.readFileBlob(file.id, file.mimeType)
      if (blobRes.success) {
        setFilePreview({
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          blobUrl: blobRes.blobUrl,
          webViewLink: file.webViewLink,
        })
        return
      }
    }

    const res = await gdrive.readFileContent(file.id, file.mimeType)
    if (res.success) {
      setFilePreview({
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        content: res.content,
        webViewLink: file.webViewLink,
      })
      return
    }

    setFilePreview({
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      webViewLink: file.webViewLink,
    })
  }, [gdrive])

  return {
    filePreview,
    setFilePreview,
    quickLookFile,
    setQuickLookFile,
    loadItemPreviewData,
    openLocalItem,
    openGdriveItem,
  }
}
