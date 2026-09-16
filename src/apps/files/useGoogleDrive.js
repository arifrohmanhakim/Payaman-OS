import { useState, useEffect, useCallback } from 'react'
import { googleDriveService } from '../../services/googleDriveService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { soundService } from '../../services/soundService.js'

export function useGoogleDrive() {
  const [isConnected, setIsConnected] = useState(() => googleDriveService.isConnected())
  const [userProfile, setUserProfile] = useState(() => googleDriveService.getUserProfile())
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'Google Drive' })
  const [folderHistory, setFolderHistory] = useState([{ id: 'root', name: 'Google Drive' }])
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const fetchFiles = useCallback(async (folderId = 'root') => {
    if (!googleDriveService.isConnected()) {
      setFiles([])
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    const res = await googleDriveService.listFiles(folderId)
    setIsLoading(false)

    if (res.success) {
      setFiles(res.files)
    } else {
      setErrorMessage(res.error)
      soundService.playErrorAlert()
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    const loadData = async () => {
      if (googleDriveService.isConnected()) {
        setIsLoading(true)
        const res = await googleDriveService.listFiles(currentFolder.id)
        if (!isCancelled) {
          setIsLoading(false)
          if (res.success) {
            setFiles(res.files)
          } else {
            setErrorMessage(res.error)
          }
        }
      }
    }

    loadData()

    const unsubscribe = googleDriveService.subscribe(() => {
      const connected = googleDriveService.isConnected()
      setIsConnected(connected)
      setUserProfile(googleDriveService.getUserProfile())

      if (connected) {
        loadData()
      } else {
        setFiles([])
      }
    })

    return () => {
      isCancelled = true
      unsubscribe()
    }
  }, [currentFolder.id])

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      soundService.playClick()
      await googleDriveService.connectWithGoogle()
      setIsLoading(false)
      setStatusMessage('Connected to Google Drive.')
    } catch (err) {
      setIsLoading(false)
      setErrorMessage(err.message || 'Failed to connect to Google Drive.')
      soundService.playErrorAlert()
    }
  }, [])

  const disconnect = useCallback(() => {
    soundService.playClick()
    googleDriveService.disconnect()
    setCurrentFolder({ id: 'root', name: 'Google Drive' })
    setFolderHistory([{ id: 'root', name: 'Google Drive' }])
    setStatusMessage('Google Drive disconnected.')
  }, [])

  const navigateToFolder = useCallback(
    (folderId, folderName) => {
      soundService.playClick()
      const newFolder = { id: folderId, name: folderName }
      setCurrentFolder(newFolder)
      setFolderHistory((prev) => [...prev, newFolder])
      fetchFiles(folderId)
    },
    [fetchFiles]
  )

  const navigateBack = useCallback(() => {
    if (folderHistory.length <= 1) return
    soundService.playClick()
    const newHistory = folderHistory.slice(0, -1)
    const targetFolder = newHistory[newHistory.length - 1]
    setFolderHistory(newHistory)
    setCurrentFolder(targetFolder)
    fetchFiles(targetFolder.id)
  }, [folderHistory, fetchFiles])

  const createFolder = useCallback(
    async (name) => {
      if (!name.trim()) return
      setIsLoading(true)
      const res = await googleDriveService.createFolder(name.trim(), currentFolder.id)
      setIsLoading(false)
      if (res.success) {
        soundService.playClick()
        setStatusMessage(`Folder '${name}' created in Google Drive.`)
        fetchFiles(currentFolder.id)
      } else {
        setErrorMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentFolder.id, fetchFiles]
  )

  const uploadFile = useCallback(
    async (name, content) => {
      if (!name.trim()) return
      setIsLoading(true)
      const res = await googleDriveService.uploadFile(name.trim(), content, currentFolder.id)
      setIsLoading(false)
      if (res.success) {
        soundService.playClick()
        setStatusMessage(`File '${name}' uploaded to Google Drive.`)
        fetchFiles(currentFolder.id)
      } else {
        setErrorMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentFolder.id, fetchFiles]
  )

  const deleteFile = useCallback(
    async (fileId, fileName) => {
      setIsLoading(true)
      const res = await googleDriveService.deleteFile(fileId)
      setIsLoading(false)
      if (res.success) {
        soundService.playClick()
        setStatusMessage(`File '${fileName}' deleted from Google Drive.`)
        fetchFiles(currentFolder.id)
      } else {
        setErrorMessage(res.error)
        soundService.playErrorAlert()
      }
    },
    [currentFolder.id, fetchFiles]
  )

  const importToVFS = useCallback(async (driveFile, targetVfsFolder = '/home/arif') => {
    setIsLoading(true)
    const contentRes = await googleDriveService.readFileContent(driveFile.id)
    setIsLoading(false)

    const content = contentRes.success
      ? contentRes.content
      : `[File ${driveFile.name} from Google Drive]`
    const targetPath = `${targetVfsFolder}/${driveFile.name}`

    const writeRes = fileSystemService.writeFile(targetPath, content, false)
    if (writeRes.success) {
      soundService.playClick()
      setStatusMessage(`'${driveFile.name}' copied to local VFS (${targetPath}).`)
      return true
    } else {
      soundService.playErrorAlert()
      setErrorMessage(`Failed to copy to VFS: ${writeRes.error}`)
      return false
    }
  }, [])

  const readFileBlob = useCallback(async (fileId, mimeType) => {
    return googleDriveService.readFileBlob(fileId, mimeType)
  }, [])

  const readFileContent = useCallback(async (fileId, mimeType) => {
    return googleDriveService.readFileContent(fileId, mimeType)
  }, [])

  return {
    isConnected,
    userProfile,
    currentFolder,
    folderHistory,
    files,
    isLoading,
    errorMessage,
    statusMessage,
    connect,
    disconnect,
    fetchFiles,
    navigateToFolder,
    navigateBack,
    createFolder,
    uploadFile,
    deleteFile,
    importToVFS,
    readFileBlob,
    readFileContent,
    setErrorMessage,
    setStatusMessage,
  }
}
