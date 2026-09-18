import { useState, useRef, useEffect, useCallback } from 'react'
import { useFileManager } from './useFileManager.js'
import { useGoogleDrive } from './useGoogleDrive.js'
import { useOS } from '../../hooks/useOS.js'
import { storageService } from '../../services/storageService.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'
import ContextMenu from '../../components/common/ContextMenu.jsx'
import FileViewerModal from '../../components/common/FileViewerModal.jsx'
import QuickLookModal from '../../components/common/QuickLookModal.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { getFileCategory, getFileExtension } from '../../utils/fileTypes.js'

export default function FileManagerApp() {
  const { openApp } = useOS()
  const fileInputRef = useRef(null)

  // Storage lokal VFS
  const {
    currentPath,
    items,
    selectedItem,
    viewMode,
    statusMessage: localStatusMessage,
    storageStats,
    canGoBack,
    canGoForward,
    setSelectedItem,
    setViewMode,
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    createFolder,
    createFile,
    deleteItem,
    renameItem,
    readFileContent,
    uploadLocalFiles,
  } = useFileManager('/home/arif')

  // Storage Google Drive
  const gdrive = useGoogleDrive()

  // Tab aktif: 'local' | 'gdrive'
  const [storageSource, setStorageSource] = useState('local')

  // Dialog, Pratinjau & Context Menu
  const [activeDialog, setActiveDialog] = useState(null)
  const [dialogInput, setDialogInput] = useState('')
  const [dialogSecondaryInput, setDialogSecondaryInput] = useState('')
  const [filePreview, setFilePreview] = useState(null)
  const [quickLookFile, setQuickLookFile] = useState(null)
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  })

  const quickLinks = [
    { name: 'Home (~)', path: '/home/arif', icon: 'folder' },
    { name: 'Documents', path: '/home/arif/dokumen', icon: 'folder' },
    { name: 'System', path: '/system', icon: 'folder' },
    { name: 'Root (/)', path: '/', icon: 'folder' },
    { name: 'Temp (/tmp)', path: '/tmp', icon: 'folder' },
  ]

  const handleOpenLocalItem = (item) => {
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
  }

  const handleOpenGdriveItem = async (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      gdrive.navigateToFolder(file.id, file.name)
      return
    }

    const category = getFileCategory(file.name, file.mimeType)

    // Jika gambar, pdf, audio, atau video: unduh sebagai Blob URL
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

    // Jika teks atau dokumen Google
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

    // Fallback jika tidak dapat dibaca langsung
    setFilePreview({
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      webViewLink: file.webViewLink,
    })
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadLocalFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDialogSubmit = async (e) => {
    e.preventDefault()
    if (!dialogInput.trim()) return

    if (activeDialog === 'new_folder') {
      createFolder(dialogInput)
    } else if (activeDialog === 'new_file') {
      createFile(dialogInput)
    } else if (activeDialog === 'rename' && selectedItem) {
      renameItem(selectedItem.name, dialogInput)
    } else if (activeDialog === 'gdrive_new_folder') {
      await gdrive.createFolder(dialogInput)
    } else if (activeDialog === 'gdrive_upload') {
      await gdrive.uploadFile(dialogInput, dialogSecondaryInput || '')
    }

    setActiveDialog(null)
    setDialogInput('')
    setDialogSecondaryInput('')
  }

  const openRenameDialog = useCallback(() => {
    if (!selectedItem) return
    setDialogInput(selectedItem.name)
    setActiveDialog('rename')
  }, [selectedItem])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedItem) return
    if (storageSource === 'local') {
      deleteItem(selectedItem.name)
    } else {
      gdrive.deleteFile(selectedItem.id, selectedItem.name)
      setSelectedItem(null)
    }
  }, [selectedItem, storageSource, deleteItem, gdrive, setSelectedItem])

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

  const currentItems = storageSource === 'local' ? items : (gdrive.isConnected ? gdrive.files : [])
  const currentItemsRef = useRef(currentItems)
  const selectedItemRef = useRef(selectedItem)
  const quickLookFileRef = useRef(quickLookFile)
  const previewItemKeyRef = useRef(null)

  useEffect(() => {
    currentItemsRef.current = currentItems
  }, [currentItems])

  useEffect(() => {
    selectedItemRef.current = selectedItem
  }, [selectedItem])

  useEffect(() => {
    quickLookFileRef.current = quickLookFile
  }, [quickLookFile])

  useEffect(() => {
    if (!selectedItem) return
    const el = document.querySelector('[data-file-selected="true"]')
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [selectedItem])

  const toggleQuickLook = useCallback(async (targetItem) => {
    const item = targetItem || selectedItemRef.current
    if (!item) return

    if (quickLookFileRef.current) {
      setQuickLookFile(null)
      previewItemKeyRef.current = null
      return
    }

    const data = await loadItemPreviewData(item)
    if (data) {
      previewItemKeyRef.current = item.id || item.name
      setQuickLookFile(data)
    }
  }, [loadItemPreviewData])

  useEffect(() => {
    if (!quickLookFile) {
      previewItemKeyRef.current = null
      return
    }
    const currentKey = selectedItem ? (selectedItem.id || selectedItem.name) : null
    if (currentKey && currentKey !== previewItemKeyRef.current) {
      previewItemKeyRef.current = currentKey
      loadItemPreviewData(selectedItem).then((data) => {
        if (data) setQuickLookFile(data)
      })
    }
  }, [selectedItem, quickLookFile, loadItemPreviewData])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (activeDialog) return

      const list = currentItemsRef.current || []

      // 1. Space: Quick Look Toggle
      if (e.code === 'Space' || e.key === ' ') {
        if (quickLookFileRef.current) {
          e.preventDefault()
          e.stopPropagation()
          setQuickLookFile(null)
          previewItemKeyRef.current = null
          return
        }

        if (selectedItemRef.current) {
          e.preventDefault()
          e.stopPropagation()
          toggleQuickLook(selectedItemRef.current)
          return
        }
      }

      // 2. Arrow Keys Navigation (Up, Down, Left, Right, Home, End)
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
        if (list.length === 0) return
        e.preventDefault()

        const currentSel = selectedItemRef.current
        const currentIdx = currentSel
          ? list.findIndex((it) => (it.id ? it.id === currentSel.id : it.name === currentSel.name))
          : -1

        let nextIdx = 0
        if (e.key === 'Home') {
          nextIdx = 0
        } else if (e.key === 'End') {
          nextIdx = list.length - 1
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIdx = currentIdx === -1 ? 0 : Math.min(list.length - 1, currentIdx + 1)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIdx = currentIdx === -1 ? list.length - 1 : Math.max(0, currentIdx - 1)
        }

        const targetItem = list[nextIdx]
        if (targetItem) {
          setSelectedItem(targetItem)
        }
        return
      }

      // 3. Enter: Open folder / preview file
      if (e.key === 'Enter') {
        if (selectedItemRef.current) {
          e.preventDefault()
          if (storageSource === 'local') {
            handleOpenLocalItem(selectedItemRef.current)
          } else {
            handleOpenGdriveItem(selectedItemRef.current)
          }
        }
        return
      }

      // 4. Backspace: Navigate back / up
      if (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey) {
        if (storageSource === 'local') {
          e.preventDefault()
          if (canGoBack) navigateBack()
          else navigateUp()
        } else if (gdrive.isConnected && gdrive.currentFolder?.id !== 'root') {
          e.preventDefault()
          gdrive.navigateBack()
        }
        return
      }

      // 5. Delete: Remove selected item
      if (e.key === 'Delete' || (e.key === 'Backspace' && (e.metaKey || e.ctrlKey))) {
        if (selectedItemRef.current) {
          e.preventDefault()
          handleDeleteSelected()
        }
        return
      }

      // 6. F2: Rename selected item
      if (e.key === 'F2') {
        if (selectedItemRef.current && storageSource === 'local') {
          e.preventDefault()
          openRenameDialog()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeDialog,
    toggleQuickLook,
    storageSource,
    canGoBack,
    navigateBack,
    navigateUp,
    gdrive,
    handleDeleteSelected,
    openRenameDialog,
    setSelectedItem,
  ])

  const handleItemContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedItem(item)
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  const handleContainerContextMenu = (e) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      item: null,
    })
  }

  const contextMenuItems = (() => {
    const item = contextMenu.item || selectedItem
    if (item) {
      const isDir =
        storageSource === 'local'
          ? item.type === 'dir'
          : item.mimeType === 'application/vnd.google-apps.folder'

      const menu = [
        { header: item.name },
        {
          label: isDir ? 'Open Folder' : 'Open',
          icon: isDir ? 'folder' : 'document',
          shortcut: '↵',
          onSelect: () => {
            if (storageSource === 'local') {
              handleOpenLocalItem(item)
            } else {
              handleOpenGdriveItem(item)
            }
          },
        },
        {
          label: 'Quick Look',
          icon: 'eye',
          shortcut: 'Space',
          onSelect: () => toggleQuickLook(item),
        },
        { divider: true },
      ]

      if (storageSource === 'gdrive' && !isDir) {
        menu.push({
          label: 'Copy to Local VFS',
          icon: 'download',
          onSelect: () => gdrive.importToVFS(item, '/home/arif'),
        })
      }

      if (storageSource === 'local') {
        menu.push({
          label: 'Rename...',
          icon: 'edit',
          shortcut: 'F2',
          onSelect: () => openRenameDialog(),
        })
      }

      menu.push({
        label: 'Delete',
        icon: 'trash',
        shortcut: 'Del',
        onSelect: () => handleDeleteSelected(),
      })

      return menu
    }

    return [
      { header: storageSource === 'local' ? currentPath : gdrive.currentFolder.name },
      {
        label: 'New Folder...',
        icon: 'folder',
        onSelect: () => {
          setDialogInput('')
          setActiveDialog(storageSource === 'local' ? 'new_folder' : 'gdrive_new_folder')
        },
      },
      ...(storageSource === 'local'
        ? [
            {
              label: 'New File...',
              icon: 'document',
              onSelect: () => {
                setDialogInput('')
                setActiveDialog('new_file')
              },
            },
            {
              label: 'Upload File...',
              icon: 'upload',
              onSelect: () => fileInputRef.current?.click(),
            },
          ]
        : [
            {
              label: 'Upload File...',
              icon: 'upload',
              onSelect: () => {
                setDialogInput('')
                setDialogSecondaryInput('')
                setActiveDialog('gdrive_upload')
              },
            },
          ]),
      { divider: true },
      {
        label: viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View',
        icon: viewMode === 'grid' ? 'list' : 'grid',
        onSelect: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
      },
      {
        label: 'Refresh',
        icon: 'refresh',
        onSelect: () => {
          if (storageSource === 'local') {
            navigateTo(currentPath)
          } else {
            gdrive.fetchFiles(gdrive.currentFolder.id)
          }
        },
      },
    ]
  })()

  const handleImportGdriveSelected = async () => {
    if (!selectedItem) return
    await gdrive.importToVFS(selectedItem, '/home/arif')
  }

  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('files:')) return

      switch (action) {
        case 'files:new_folder':
          setDialogInput('')
          setActiveDialog('new_folder')
          break
        case 'files:new_file':
          setDialogInput('')
          setActiveDialog('new_file')
          break
        case 'files:upload':
          fileInputRef.current?.click()
          break
        case 'files:view_grid':
          setViewMode('grid')
          break
        case 'files:view_list':
          setViewMode('list')
          break
        case 'files:refresh':
          if (storageSource === 'local') {
            navigateTo(currentPath)
          } else {
            gdrive.fetchFiles(gdrive.currentFolder.id)
          }
          break
        case 'files:go_home':
          setStorageSource('local')
          navigateTo('/home/arif')
          break
        case 'files:go_documents':
          setStorageSource('local')
          navigateTo('/home/arif/dokumen')
          break
        case 'files:go_system':
          setStorageSource('local')
          navigateTo('/system')
          break
        case 'files:go_root':
          setStorageSource('local')
          navigateTo('/')
          break
        case 'files:rename':
          openRenameDialog()
          break
        case 'files:delete':
          handleDeleteSelected()
          break
        default:
          break
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [currentPath, navigateTo, setViewMode, storageSource, gdrive, selectedItem, openRenameDialog, handleDeleteSelected])

  const pathParts = currentPath.split('/').filter(Boolean)

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3">
      {/* Toolbar Atas */}
      <header className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] px-2 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          {storageSource === 'local' ? (
            <>
              <Button
                variant="default"
                disabled={!canGoBack}
                onClick={navigateBack}
                className="px-2 py-0.5"
                title="Back"
              >
                ←
              </Button>
              <Button
                variant="default"
                disabled={!canGoForward}
                onClick={navigateForward}
                className="px-2 py-0.5"
                title="Forward"
              >
                →
              </Button>
              <Button
                variant="default"
                disabled={currentPath === '/'}
                onClick={navigateUp}
                className="px-2 py-0.5"
                title="Parent Directory"
              >
                ↑
              </Button>
              <Button
                variant="default"
                onClick={() => navigateTo('/home/arif')}
                className="px-2 py-0.5"
                title="Home Folder"
              >
                ~
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                disabled={gdrive.folderHistory.length <= 1}
                onClick={gdrive.navigateBack}
                className="px-2 py-0.5"
                title="Back to Previous Folder"
              >
                ←
              </Button>
              <Button
                variant="default"
                onClick={() => gdrive.fetchFiles(gdrive.currentFolder.id)}
                className="px-2 py-0.5"
                title="Refresh Google Drive"
              >
                ⟳
              </Button>
            </>
          )}
        </div>

        {/* Path Breadcrumbs */}
        <div className="flex-1 overflow-x-auto flex items-center gap-1 border border-[var(--os-border)] px-2 py-0.5 bg-[var(--os-bg)] text-[11px] whitespace-nowrap">
          {storageSource === 'local' ? (
            <>
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="hover:underline font-bold"
              >
                /
              </button>
              {pathParts.map((part, idx) => {
                const partPath = '/' + pathParts.slice(0, idx + 1).join('/')
                return (
                  <span key={partPath} className="flex items-center gap-1">
                    <span className="opacity-40">&gt;</span>
                    <button
                      type="button"
                      onClick={() => navigateTo(partPath)}
                      className="hover:underline"
                    >
                      {part}
                    </button>
                  </span>
                )
              })}
            </>
          ) : (
            <>
              <span className="font-bold flex items-center gap-1.5">
                <AppIconGraphic iconType="cloud" className="w-4 h-4" />
                <span>Google Drive</span>
              </span>
              {gdrive.folderHistory.map((f, idx) => {
                if (idx === 0) return null
                return (
                  <span key={f.id} className="flex items-center gap-1">
                    <span className="opacity-40">&gt;</span>
                    <span>{f.name}</span>
                  </span>
                )
              })}
            </>
          )}
        </div>

        {/* View Mode & Aksi */}
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-2 py-0.5"
            title="Toggle Grid/List View"
          >
            {viewMode === 'grid' ? '≡ List' : '▦ Grid'}
          </Button>

          {storageSource === 'local' ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                multiple
                className="hidden"
              />
              <Button
                variant="default"
                onClick={() => {
                  setDialogInput('')
                  setActiveDialog('new_folder')
                }}
                className="px-2 py-0.5"
                title="New Folder"
              >
                + Folder
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setDialogInput('')
                  setActiveDialog('new_file')
                }}
                className="px-2 py-0.5"
                title="New File"
              >
                + File
              </Button>
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5"
                title="Upload Files from Computer (Image, PDF, Document, etc)"
              >
                + Upload
              </Button>
            </>
          ) : (
            gdrive.isConnected && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setDialogInput('')
                    setActiveDialog('gdrive_new_folder')
                  }}
                  className="px-2 py-0.5"
                  title="Create Folder in Google Drive"
                >
                  + Folder
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setDialogInput('new_document.txt')
                    setDialogSecondaryInput('')
                    setActiveDialog('gdrive_upload')
                  }}
                  className="px-2 py-0.5"
                  title="Upload File to Google Drive"
                >
                  + Upload
                </Button>
              </>
            )
          )}
        </div>
      </header>

      {/* Main Container: Sidebar + Explorer Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigasi Sumber Penyimpanan */}
        <aside className="w-40 border-r-2 border-[var(--os-border)] bg-[var(--os-bg)] p-2 space-y-3 overflow-y-auto shrink-0 hidden sm:block">
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
              Storage
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setStorageSource('local')
                  setSelectedItem(null)
                }}
                className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 cursor-default ${
                  storageSource === 'local'
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                    : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                }`}
              >
                <AppIconGraphic iconType="preferences" className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Local (VFS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStorageSource('gdrive')
                  setSelectedItem(null)
                }}
                className={`w-full text-left px-1.5 py-1 text-xs flex items-center justify-between gap-1 cursor-default ${
                  storageSource === 'gdrive'
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                    : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <AppIconGraphic iconType="cloud" className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Google Drive</span>
                </span>
                {gdrive.isConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
                )}
              </button>
            </div>
          </div>

          {storageSource === 'local' ? (
            <>
              <div>
                <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
                  Shortcuts
                </span>
                <div className="space-y-1">
                  {quickLinks.map((link) => {
                    const isActive = currentPath === link.path
                    return (
                      <button
                        key={link.path}
                        type="button"
                        onClick={() => navigateTo(link.path)}
                        className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 cursor-default ${
                          isActive
                            ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                            : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                        }`}
                      >
                        <AppIconGraphic iconType="folder" className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-[var(--os-border)] pt-2 text-[10px] opacity-70">
                <div>VFS Storage:</div>
                <div className="font-bold">
                  {storageStats.usedKb} KB / {storageStats.totalKb} KB
                </div>
              </div>
            </>
          ) : (
            <div className="border-t border-[var(--os-border)] pt-2 text-[10px] space-y-2">
              <div>Connected Account:</div>
              {gdrive.userProfile?.email ? (
                <div className="truncate font-bold text-[10px]" title={gdrive.userProfile.email}>
                  {gdrive.userProfile.email}
                </div>
              ) : (
                <div className="opacity-60">Not connected</div>
              )}
              {gdrive.isConnected && (
                <button
                  type="button"
                  onClick={gdrive.disconnect}
                  className="w-full text-center px-1 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[10px]"
                >
                  Disconnect
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Content Explorer Area */}
        <main
          onClick={() => setSelectedItem(null)}
          onContextMenu={handleContainerContextMenu}
          className="flex-1 bg-[var(--os-bg)] p-3 overflow-auto relative"
        >
          {storageSource === 'local' ? (
            /* Explorer Penyimpanan Lokal VFS */
            items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-50">
                This folder is empty.
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {items.map((item) => {
                  const isSelected = selectedItem?.name === item.name
                  const isDir = item.type === 'dir'
                  const category = isDir ? 'folder' : getFileCategory(item.name)
                  const ext = isDir ? '' : getFileExtension(item.name)
                  let iconType = 'document'
                  if (isDir) iconType = 'folder'
                  else if (category === 'image') iconType = 'image'
                  else if (category === 'pdf') iconType = 'pdf'
                  else if (category === 'audio' || category === 'video') iconType = 'media'
                  else if (
                    category === 'text' &&
                    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)
                  ) {
                    iconType = 'code'
                  }

                  return (
                    <div
                      key={item.name}
                      data-file-selected={isSelected}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(item)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleOpenLocalItem(item)
                      }}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                      className={`flex flex-col items-center justify-center p-2 text-center group cursor-default ${
                        isSelected
                          ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                          : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1 pointer-events-none">
                        <AppIconGraphic
                          iconType={iconType}
                          className="w-8 h-8"
                        />
                      </div>
                      <span className="text-[11px] font-mono line-clamp-2 break-all leading-tight">
                        {item.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-[var(--os-border)] opacity-70">
                    <th className="py-1 px-2 font-bold">Name</th>
                    <th className="py-1 px-2 font-bold w-20">Type</th>
                    <th className="py-1 px-2 font-bold w-24">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isSelected = selectedItem?.name === item.name
                    const isDir = item.type === 'dir'
                    const category = isDir ? 'folder' : getFileCategory(item.name)
                    const ext = isDir ? '' : getFileExtension(item.name)
                    let iconType = 'document'
                    if (isDir) iconType = 'folder'
                    else if (category === 'image') iconType = 'image'
                    else if (category === 'pdf') iconType = 'pdf'
                    else if (category === 'audio' || category === 'video') iconType = 'media'
                    else if (
                      category === 'text' &&
                      ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)
                    ) {
                      iconType = 'code'
                    }

                    return (
                      <tr
                        key={item.name}
                        data-file-selected={isSelected}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(item)
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleOpenLocalItem(item)
                        }}
                        onContextMenu={(e) => handleItemContextMenu(e, item)}
                        className={`border-b border-[var(--os-border)]/30 cursor-default ${
                          isSelected
                            ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                            : 'hover:bg-[var(--os-fg)]/10'
                        }`}
                      >
                        <td className="py-1 px-2 flex items-center gap-1.5">
                          <AppIconGraphic iconType={iconType} className="w-4 h-4 shrink-0" />
                          <span className="font-medium">{item.name}</span>
                        </td>
                        <td className="py-1 px-2 uppercase text-[10px]">
                          {isDir ? 'Folder' : ext || category}
                        </td>
                        <td className="py-1 px-2 text-[10px]">
                          {isDir
                            ? '--'
                            : item.size > 1024
                              ? `${Math.round(item.size / 1024)} KB`
                              : `${item.size} B`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : (
            /* Explorer Google Drive */
            !gdrive.isConnected ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 border-2 border-[var(--os-border)] rounded-full flex items-center justify-center p-3 os-window-shadow">
                  <AppIconGraphic iconType="cloud" className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-sm font-bold">Google Drive</h3>
                  <p className="text-[11px] opacity-70 mt-1">
                    Connect your Google Drive account to access, view, and import files directly into Payaman OS.
                  </p>
                </div>

                {gdrive.errorMessage && (
                  <div className="p-2 border border-red-500 bg-red-500/10 text-red-600 text-[10px] text-left w-full">
                    {gdrive.errorMessage}
                  </div>
                )}

                <Button
                  variant="primary"
                  disabled={gdrive.isLoading}
                  onClick={gdrive.connect}
                  className="w-full py-2 flex items-center justify-center gap-2"
                >
                  <AppIconGraphic iconType="preferences" className="w-3.5 h-3.5 shrink-0" />
                  <span>{gdrive.isLoading ? 'Connecting...' : 'Connect Google Drive'}</span>
                </Button>
              </div>
            ) : gdrive.isLoading ? (
              <div className="h-full flex items-center justify-center text-center space-y-2">
                <div className="animate-pulse">Loading files from Google Drive...</div>
              </div>
            ) : gdrive.files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-50">
                This Google Drive folder is empty.
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {gdrive.files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
                  const isSelected = selectedItem?.id === file.id
                  const category = isFolder ? 'folder' : getFileCategory(file.name, file.mimeType)
                  const ext = isFolder ? '' : getFileExtension(file.name)
                  let iconType = 'document'
                  if (isFolder) iconType = 'folder'
                  else if (category === 'image') iconType = 'image'
                  else if (category === 'pdf') iconType = 'pdf'
                  else if (category === 'audio' || category === 'video') iconType = 'media'
                  else if (
                    category === 'text' &&
                    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)
                  ) {
                    iconType = 'code'
                  }

                  return (
                    <div
                      key={file.id}
                      data-file-selected={isSelected}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(file)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleOpenGdriveItem(file)
                      }}
                      onContextMenu={(e) => handleItemContextMenu(e, file)}
                      className={`flex flex-col items-center justify-center p-2 text-center group cursor-default ${
                        isSelected
                          ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                          : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1 pointer-events-none">
                        <AppIconGraphic
                          iconType={iconType}
                          className="w-8 h-8"
                        />
                      </div>
                      <span className="text-[11px] font-mono line-clamp-2 break-all leading-tight">
                        {file.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-[var(--os-border)] opacity-70">
                    <th className="py-1 px-2 font-bold">Name</th>
                    <th className="py-1 px-2 font-bold w-28">Type</th>
                    <th className="py-1 px-2 font-bold w-24">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {gdrive.files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
                    const isSelected = selectedItem?.id === file.id
                    const category = isFolder ? 'folder' : getFileCategory(file.name, file.mimeType)
                    const ext = isFolder ? '' : getFileExtension(file.name)
                    let iconType = 'document'
                    if (isFolder) iconType = 'folder'
                    else if (category === 'image') iconType = 'image'
                    else if (category === 'pdf') iconType = 'pdf'
                    else if (category === 'audio' || category === 'video') iconType = 'media'
                    else if (
                      category === 'text' &&
                      ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)
                    ) {
                      iconType = 'code'
                    }

                    return (
                      <tr
                        key={file.id}
                        data-file-selected={isSelected}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(file)
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleOpenGdriveItem(file)
                        }}
                        onContextMenu={(e) => handleItemContextMenu(e, file)}
                        className={`border-b border-[var(--os-border)]/30 cursor-default ${
                          isSelected
                            ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                            : 'hover:bg-[var(--os-fg)]/10'
                        }`}
                      >
                        <td className="py-1 px-2 flex items-center gap-1.5">
                          <AppIconGraphic iconType={iconType} className="w-4 h-4 shrink-0" />
                          <span className="font-medium truncate">{file.name}</span>
                        </td>
                        <td className="py-1 px-2 text-[10px] truncate max-w-[120px]">
                          {isFolder ? 'Folder' : ext || file.mimeType.split('.').pop()}
                        </td>
                        <td className="py-1 px-2 text-[10px]">
                          {file.size ? `${Math.round(file.size / 1024)} KB` : '--'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
        <span>
          {storageSource === 'local'
            ? `${items.length} items in VFS`
            : `${gdrive.files.length} items in Google Drive`}
        </span>
        <span className="truncate max-w-md">
          {storageSource === 'local'
            ? localStatusMessage || currentPath
            : gdrive.statusMessage || gdrive.errorMessage || gdrive.currentFolder.name}
        </span>
      </footer>

      {/* Modal Dialog Form */}
      {activeDialog && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleDialogSubmit}
            className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow p-4 w-80 space-y-3 font-mono text-xs text-[var(--os-fg)]"
          >
            <div className="font-bold border-b border-[var(--os-border)] pb-1">
              {activeDialog === 'new_folder' && 'Create New Folder'}
              {activeDialog === 'new_file' && 'Create New File'}
              {activeDialog === 'rename' && 'Rename Item'}
              {activeDialog === 'gdrive_new_folder' && 'Create Folder in Google Drive'}
              {activeDialog === 'gdrive_upload' && 'Upload File to Google Drive'}
            </div>

            {activeDialog === 'gdrive_upload' ? (
              <div className="space-y-2">
                <Input
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  placeholder="File name (e.g. document.txt)"
                  autoFocus
                />
                <textarea
                  value={dialogSecondaryInput}
                  onChange={(e) => setDialogSecondaryInput(e.target.value)}
                  placeholder="File text content..."
                  rows={4}
                  className="w-full p-1.5 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] focus:outline-none"
                />
              </div>
            ) : (
              <Input
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                placeholder="Enter name..."
                autoFocus
              />
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="default"
                type="button"
                onClick={() => {
                  setActiveDialog(null)
                  setDialogInput('')
                  setDialogSecondaryInput('')
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Context Menu Klik Kanan */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Instant Quick Look Overlay (Spacebar) */}
      <QuickLookModal
        file={quickLookFile}
        isOpen={Boolean(quickLookFile)}
        onClose={() => setQuickLookFile(null)}
        onOpenWithApp={(f) => {
          if (storageSource === 'local') {
            const item = items.find((it) => it.name === f.name)
            if (item) handleOpenLocalItem(item)
          } else {
            handleOpenGdriveItem(f)
          }
        }}
      />

      {/* Penampil Berkas Serbaguna (Gambar, PDF, Dokumen, Teks) */}
      {filePreview && (
        <FileViewerModal
          file={filePreview}
          onClose={() => setFilePreview(null)}
          onOpenInWrite={(text) => {
            storageService.setItem('payaman_notes_document', text)
            openApp('write')
          }}
        />
      )}
    </div>
  )
}
