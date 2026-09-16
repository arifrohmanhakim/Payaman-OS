import { useState, useEffect, useCallback } from 'react'
import { fileSystemService } from '../../services/fileSystemService.js'
import { soundService } from '../../services/soundService.js'

export function useFileManager(initialPath = '/home/arif') {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [history, setHistory] = useState([initialPath])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [items, setItems] = useState(() => {
    const res = fileSystemService.listDirectory(initialPath)
    return res.success ? res.items : []
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      const res = fileSystemService.listDirectory(currentPath)
      if (res.success) {
        setItems(res.items)
      }
    })
    return unsubscribe
  }, [currentPath])

  const navigateTo = useCallback(
    (targetPath) => {
      soundService.playClick()
      const resolved = fileSystemService.resolvePath(targetPath)
      const res = fileSystemService.listDirectory(resolved)
      if (res.success) {
        setCurrentPath(resolved)
        setItems(res.items)
        setSelectedItem(null)
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), resolved])
        setHistoryIndex((prev) => prev + 1)
      } else {
        setStatusMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [historyIndex]
  )

  const navigateBack = useCallback(() => {
    if (historyIndex > 0) {
      soundService.playClick()
      const nextIndex = historyIndex - 1
      const target = history[nextIndex]
      const res = fileSystemService.listDirectory(target)
      if (res.success) {
        setHistoryIndex(nextIndex)
        setCurrentPath(target)
        setItems(res.items)
        setSelectedItem(null)
      }
    }
  }, [history, historyIndex])

  const navigateForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      soundService.playClick()
      const nextIndex = historyIndex + 1
      const target = history[nextIndex]
      const res = fileSystemService.listDirectory(target)
      if (res.success) {
        setHistoryIndex(nextIndex)
        setCurrentPath(target)
        setItems(res.items)
        setSelectedItem(null)
      }
    }
  }, [history, historyIndex])

  const navigateUp = useCallback(() => {
    if (currentPath === '/') return
    soundService.playClick()
    const lastSlash = currentPath.lastIndexOf('/')
    const parentPath = currentPath.slice(0, lastSlash) || '/'
    navigateTo(parentPath)
  }, [currentPath, navigateTo])

  const createFolder = useCallback(
    (folderName) => {
      const trimmed = folderName.trim()
      if (!trimmed) return
      soundService.playClick()
      const targetPath = `${currentPath}/${trimmed}`
      const res = fileSystemService.createDirectory(targetPath)
      if (res.success) {
        setStatusMessage(`Folder '${trimmed}' berhasil dibuat.`)
      } else {
        setStatusMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentPath]
  )

  const createFile = useCallback(
    (fileName, content = '') => {
      const trimmed = fileName.trim()
      if (!trimmed) return
      soundService.playClick()
      const targetPath = `${currentPath}/${trimmed}`
      const res = fileSystemService.writeFile(targetPath, content, false)
      if (res.success) {
        setStatusMessage(`Berkas '${trimmed}' berhasil dibuat.`)
      } else {
        setStatusMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentPath]
  )

  const deleteItem = useCallback(
    (itemName) => {
      soundService.playClick()
      const targetPath = `${currentPath}/${itemName}`
      const res = fileSystemService.remove(targetPath, true)
      if (res.success) {
        setStatusMessage(`'${itemName}' berhasil dihapus.`)
        setSelectedItem(null)
      } else {
        setStatusMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentPath]
  )

  const renameItem = useCallback(
    (oldName, newName) => {
      soundService.playClick()
      const targetPath = `${currentPath}/${oldName}`
      const res = fileSystemService.rename(targetPath, newName)
      if (res.success) {
        setStatusMessage(`Nama '${oldName}' diubah menjadi '${newName}'.`)
        setSelectedItem(null)
      } else {
        setStatusMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentPath]
  )

  const readFileContent = useCallback(
    (fileName) => {
      const targetPath = `${currentPath}/${fileName}`
      return fileSystemService.readFile(targetPath)
    },
    [currentPath]
  )

  const storageStats = fileSystemService.getStorageStats()

  return {
    currentPath,
    items,
    selectedItem,
    viewMode,
    statusMessage,
    storageStats,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
    setSelectedItem,
    setViewMode,
    setStatusMessage,
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    createFolder,
    createFile,
    deleteItem,
    renameItem,
    readFileContent,
  }
}
