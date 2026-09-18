import { useState, useMemo } from 'react'

export function useFileContextMenu({
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
  onOpenDialog,
}) {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  })

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

  const contextMenuItems = useMemo(() => {
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
        label: storageSource === 'local' ? 'Move to Trash' : 'Delete',
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
          onOpenDialog(storageSource === 'local' ? 'new_folder' : 'gdrive_new_folder')
        },
      },
      ...(storageSource === 'local'
        ? [
            {
              label: 'New File...',
              icon: 'document',
              onSelect: () => onOpenDialog('new_file'),
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
              onSelect: () => onOpenDialog('gdrive_upload'),
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
  }, [
    contextMenu.item,
    selectedItem,
    storageSource,
    currentPath,
    viewMode,
    fileInputRef,
    gdrive,
    handleOpenLocalItem,
    handleOpenGdriveItem,
    toggleQuickLook,
    openRenameDialog,
    handleDeleteSelected,
    onOpenDialog,
    setViewMode,
    navigateTo,
  ])

  return {
    contextMenu,
    setContextMenu,
    handleItemContextMenu,
    handleContainerContextMenu,
    contextMenuItems,
  }
}
