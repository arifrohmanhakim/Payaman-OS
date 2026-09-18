import { useEffect, useRef } from 'react'

export function useFileKeyboardShortcuts({
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
}) {
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
    setQuickLookFile,
    handleOpenLocalItem,
    handleOpenGdriveItem,
  ])
}
