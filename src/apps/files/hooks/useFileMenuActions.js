import { useEffect } from 'react'

export function useFileMenuActions({
  currentPath,
  navigateTo,
  setViewMode,
  setStorageSource,
  storageSource,
  gdrive,
  fileInputRef,
  openRenameDialog,
  handleDeleteSelected,
  onOpenDialog,
}) {
  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('files:')) return

      switch (action) {
        case 'files:new_folder':
          onOpenDialog('new_folder')
          break
        case 'files:new_file':
          onOpenDialog('new_file')
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
  }, [
    currentPath,
    navigateTo,
    setViewMode,
    setStorageSource,
    storageSource,
    gdrive,
    fileInputRef,
    openRenameDialog,
    handleDeleteSelected,
    onOpenDialog,
  ])
}
