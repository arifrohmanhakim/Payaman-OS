import { useState, useRef, useCallback, useEffect } from 'react'
import { useFileManager } from './useFileManager.js'
import { useGoogleDrive } from './useGoogleDrive.js'
import { useOSWindowManager } from '../../hooks/useOS.js'
import { storageService } from '../../services/storageService.js'
import ContextMenu from '../../components/common/ContextMenu.jsx'
import FileViewerModal from '../../components/common/FileViewerModal.jsx'
import QuickLookModal from '../../components/common/QuickLookModal.jsx'
import FileToolbar from './components/FileToolbar.jsx'
import FileSidebar from './components/FileSidebar.jsx'
import FileGrid from './components/FileGrid.jsx'
import FileListView from './components/FileListView.jsx'
import GoogleDriveConnectView from './components/GoogleDriveConnectView.jsx'
import FileDialog from './components/FileDialog.jsx'
import FileStatusBar from './components/FileStatusBar.jsx'
import { useFilePreviewLoader } from './hooks/useFilePreviewLoader.js'
import { useFileContextMenu } from './hooks/useFileContextMenu.js'
import { useFileKeyboardShortcuts } from './hooks/useFileKeyboardShortcuts.js'
import { useFileMenuActions } from './hooks/useFileMenuActions.js'

const QUICK_LINKS = [
  { name: 'Home (~)', path: '/home/arif', icon: 'folder' },
  { name: 'Documents', path: '/home/arif/dokumen', icon: 'folder' },
  { name: 'System', path: '/system', icon: 'folder' },
  { name: 'Root (/)', path: '/', icon: 'folder' },
  { name: 'Temp (/tmp)', path: '/tmp', icon: 'folder' },
]

export default function FileManagerApp() {
  const { openApp } = useOSWindowManager()
  const fileInputRef = useRef(null)

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

  const gdrive = useGoogleDrive()
  const [storageSource, setStorageSource] = useState('local')
  const [activeDialog, setActiveDialog] = useState(null)
  const [dialogInput, setDialogInput] = useState('')
  const [dialogSecondaryInput, setDialogSecondaryInput] = useState('')

  const {
    filePreview,
    setFilePreview,
    quickLookFile,
    setQuickLookFile,
    loadItemPreviewData,
    openLocalItem,
    openGdriveItem,
  } = useFilePreviewLoader({ storageSource, readFileContent, gdrive })

  const handleOpenLocalItem = useCallback((item) => {
    openLocalItem(item, navigateTo, currentPath)
  }, [openLocalItem, navigateTo, currentPath])

  const handleOpenGdriveItem = useCallback((file) => {
    openGdriveItem(file)
  }, [openGdriveItem])

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

  const handleOpenDialog = useCallback((type) => {
    setDialogInput(type === 'gdrive_upload' ? 'new_document.txt' : '')
    setDialogSecondaryInput('')
    setActiveDialog(type)
  }, [])

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

  const toggleQuickLook = useCallback(async (targetItem) => {
    const item = targetItem || selectedItem
    if (!item) return

    if (quickLookFile) {
      setQuickLookFile(null)
      return
    }

    const data = await loadItemPreviewData(item)
    if (data) setQuickLookFile(data)
  }, [selectedItem, quickLookFile, loadItemPreviewData, setQuickLookFile])

  const {
    contextMenu,
    setContextMenu,
    handleItemContextMenu,
    handleContainerContextMenu,
    contextMenuItems,
  } = useFileContextMenu({
    storageSource,
    currentPath,
    selectedItem,
    viewMode,
    fileInputRef,
    gdrive,
    setSelectedItem,
    setViewMode,
    navigateTo,
    handleOpenLocalItem,
    handleOpenGdriveItem,
    toggleQuickLook,
    openRenameDialog,
    handleDeleteSelected,
    onOpenDialog: handleOpenDialog,
  })

  const currentItems = storageSource === 'local' ? items : (gdrive.isConnected ? gdrive.files : [])

  useFileKeyboardShortcuts({
    currentItems,
    selectedItem,
    setSelectedItem,
    quickLookFile,
    setQuickLookFile,
    toggleQuickLook,
    storageSource,
    handleOpenLocalItem,
    handleOpenGdriveItem,
    canGoBack,
    navigateBack,
    navigateUp,
    gdrive,
    handleDeleteSelected,
    openRenameDialog,
    activeDialog,
  })

  useFileMenuActions({
    currentPath,
    navigateTo,
    setViewMode,
    setStorageSource,
    storageSource,
    gdrive,
    fileInputRef,
    openRenameDialog,
    handleDeleteSelected,
    onOpenDialog: handleOpenDialog,
  })

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadLocalFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3">
      {/* Toolbar */}
      <FileToolbar
        storageSource={storageSource}
        currentPath={currentPath}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        viewMode={viewMode}
        fileInputRef={fileInputRef}
        gdrive={gdrive}
        navigateBack={navigateBack}
        navigateForward={navigateForward}
        navigateUp={navigateUp}
        navigateTo={navigateTo}
        setViewMode={setViewMode}
        onOpenDialog={handleOpenDialog}
        onFileInputChange={handleFileInputChange}
      />

      {/* Main Container: Sidebar + File Explorer */}
      <div className="flex-1 flex overflow-hidden">
        <FileSidebar
          storageSource={storageSource}
          currentPath={currentPath}
          storageStats={storageStats}
          gdrive={gdrive}
          quickLinks={QUICK_LINKS}
          onSelectStorageSource={(src) => {
            setStorageSource(src)
            setSelectedItem(null)
          }}
          onNavigateTo={navigateTo}
        />

        <main
          onClick={() => setSelectedItem(null)}
          onContextMenu={handleContainerContextMenu}
          className="flex-1 bg-[var(--os-bg)] p-3 overflow-auto relative"
        >
          {storageSource === 'local' ? (
            viewMode === 'grid' ? (
              <FileGrid
                items={items}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenLocalItem}
                onContextMenu={handleItemContextMenu}
              />
            ) : (
              <FileListView
                items={items}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenLocalItem}
                onContextMenu={handleItemContextMenu}
              />
            )
          ) : !gdrive.isConnected ? (
            <GoogleDriveConnectView
              isLoading={gdrive.isLoading}
              errorMessage={gdrive.errorMessage}
              onConnect={gdrive.connect}
            />
          ) : gdrive.isLoading ? (
            <div className="h-full flex items-center justify-center text-center space-y-2">
              <div className="animate-pulse">Loading files from Google Drive...</div>
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              items={gdrive.files}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onOpenItem={handleOpenGdriveItem}
              onContextMenu={handleItemContextMenu}
            />
          ) : (
            <FileListView
              items={gdrive.files}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onOpenItem={handleOpenGdriveItem}
              onContextMenu={handleItemContextMenu}
            />
          )}
        </main>
      </div>

      {/* Status Bar */}
      <FileStatusBar
        storageSource={storageSource}
        localItemsCount={items.length}
        gdriveFilesCount={gdrive.files.length}
        localStatusMessage={localStatusMessage}
        currentPath={currentPath}
        gdrive={gdrive}
      />

      {/* Modal Dialog Form */}
      <FileDialog
        activeDialog={activeDialog}
        dialogInput={dialogInput}
        dialogSecondaryInput={dialogSecondaryInput}
        onInputChange={(e) => setDialogInput(e.target.value)}
        onSecondaryInputChange={(e) => setDialogSecondaryInput(e.target.value)}
        onSubmit={handleDialogSubmit}
        onClose={() => {
          setActiveDialog(null)
          setDialogInput('')
          setDialogSecondaryInput('')
        }}
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Quick Look (Spacebar) */}
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

      {/* File Viewer Modal */}
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
