import { useState, useEffect, useCallback, useRef } from 'react'
import Button from '../../components/ui/Button.jsx'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'
import ContextMenu from '../../components/common/ContextMenu.jsx'
import QuickLookModal from '../../components/common/QuickLookModal.jsx'
import { fileSystemService } from '../../services/fileSystemService.js'
import { soundService } from '../../services/soundService.js'

function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(isoString) {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

function getItemIconType(item) {
  if (item.type === 'dir') return 'folder'
  const name = item.name.toLowerCase()
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.doc')) return 'document'
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.svg')) return 'image'
  if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) return 'media'
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.json') || name.endsWith('.html') || name.endsWith('.css')) return 'code'
  if (name.endsWith('.csv') || name.endsWith('.xlsx')) return 'sheets'
  return 'document'
}

export default function WastebasketApp() {
  const [trashItems, setTrashItems] = useState(() => fileSystemService.getTrashItems())
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [quickLookFile, setQuickLookFile] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  })

  const trashItemsRef = useRef(trashItems)
  const selectedIdRef = useRef(selectedId)
  const quickLookFileRef = useRef(quickLookFile)

  useEffect(() => {
    trashItemsRef.current = trashItems
  }, [trashItems])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    quickLookFileRef.current = quickLookFile
  }, [quickLookFile])

  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      const latest = fileSystemService.getTrashItems()
      setTrashItems(latest)
      if (selectedIdRef.current && !latest.some((it) => it.id === selectedIdRef.current)) {
        setSelectedId(null)
      }
    })
    return unsubscribe
  }, [])

  const selectedItem = trashItems.find((it) => it.id === selectedId) || null

  const handleEmptyTrash = useCallback(() => {
    if (trashItems.length === 0) return
    setConfirmDialog({
      title: 'Empty Trash',
      message: `Are you sure you want to permanently delete all ${trashItems.length} item(s) in Trash?`,
      onConfirm: () => {
        fileSystemService.emptyTrash()
        soundService.playTrashEmpty()
        setSelectedId(null)
        setStatusMessage('Trash emptied.')
        setConfirmDialog(null)
      },
    })
  }, [trashItems.length])

  const handleRestoreItem = useCallback(
    (targetItem) => {
      const itemToRestore = targetItem || selectedItem
      if (!itemToRestore) return

      const res = fileSystemService.restoreFromTrash(itemToRestore.id)
      if (res.success) {
        soundService.playRestore()
        setStatusMessage(`Restored '${itemToRestore.name}' to ${res.restoredPath}.`)
        setSelectedId(null)
      } else {
        soundService.playErrorAlert()
        setStatusMessage(res.error || 'Failed to restore item.')
      }
    },
    [selectedItem]
  )

  const handleDeletePermanently = useCallback(
    (targetItem) => {
      const itemToDelete = targetItem || selectedItem
      if (!itemToDelete) return

      setConfirmDialog({
        title: 'Delete Permanently',
        message: `Delete '${itemToDelete.name}' immediately? This action cannot be undone.`,
        onConfirm: () => {
          const res = fileSystemService.deleteFromTrashPermanently(itemToDelete.id)
          if (res.success) {
            soundService.playClick()
            setStatusMessage(`'${itemToDelete.name}' deleted permanently.`)
            setSelectedId(null)
          } else {
            soundService.playErrorAlert()
            setStatusMessage(res.error || 'Failed to delete item.')
          }
          setConfirmDialog(null)
        },
      })
    },
    [selectedItem]
  )

  const toggleQuickLook = useCallback((item) => {
    const target = item || selectedItemRef.current
    if (!target) return

    if (quickLookFileRef.current) {
      setQuickLookFile(null)
      return
    }

    const category = target.type === 'dir' ? 'folder' : getItemIconType(target)
    let url = null
    const content = target.content || ''
    if (content.startsWith('data:') || content.startsWith('blob:') || content.startsWith('http')) {
      url = content
    } else if (target.name.endsWith('.svg')) {
      const blob = new Blob([content], { type: 'image/svg+xml' })
      url = URL.createObjectURL(blob)
    }

    setQuickLookFile({
      name: target.name,
      content: target.content || '',
      url,
      size: target.size,
      mimeType: target.type === 'dir' ? 'folder' : '',
      type: target.type,
      category,
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (confirmDialog) return

      const list = trashItemsRef.current
      if (list.length === 0) return

      // 1. Space: Quick Look
      if (e.code === 'Space' || e.key === ' ') {
        if (quickLookFileRef.current) {
          e.preventDefault()
          setQuickLookFile(null)
          return
        }
        if (selectedIdRef.current) {
          e.preventDefault()
          const current = list.find((it) => it.id === selectedIdRef.current)
          if (current) toggleQuickLook(current)
          return
        }
      }

      // 2. Arrow Keys Navigation
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        const currentIdx = list.findIndex((it) => it.id === selectedIdRef.current)
        let nextIdx = 0

        if (e.key === 'Home') nextIdx = 0
        else if (e.key === 'End') nextIdx = list.length - 1
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIdx = currentIdx === -1 ? 0 : Math.min(list.length - 1, currentIdx + 1)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIdx = currentIdx === -1 ? list.length - 1 : Math.max(0, currentIdx - 1)
        }

        const nextItem = list[nextIdx]
        if (nextItem) setSelectedId(nextItem.id)
        return
      }

      // 3. Enter: Put Back / Restore
      if (e.key === 'Enter') {
        if (selectedIdRef.current) {
          e.preventDefault()
          const current = list.find((it) => it.id === selectedIdRef.current)
          if (current) handleRestoreItem(current)
        }
        return
      }

      // 4. Delete / Backspace: Permanent Delete
      if (e.key === 'Delete' || (e.key === 'Backspace' && (e.metaKey || e.ctrlKey))) {
        if (selectedIdRef.current) {
          e.preventDefault()
          const current = list.find((it) => it.id === selectedIdRef.current)
          if (current) handleDeletePermanently(current)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmDialog, toggleQuickLook, handleRestoreItem, handleDeletePermanently])

  const handleItemContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedId(item.id)
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

  const closeContextMenu = () => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev))
  }

  const totalSize = trashItems.reduce((acc, it) => acc + (it.size || 0), 0)

  const contextMenuItems = (() => {
    const item = contextMenu.item || selectedItem
    if (item) {
      return [
        { header: item.name },
        {
          label: 'Put Back',
          icon: 'upload',
          shortcut: '↵',
          onSelect: () => handleRestoreItem(item),
        },
        {
          label: 'Quick Look',
          icon: 'eye',
          shortcut: 'Space',
          onSelect: () => toggleQuickLook(item),
        },
        { divider: true },
        {
          label: 'Delete Immediately...',
          icon: 'trash',
          shortcut: 'Del',
          onSelect: () => handleDeletePermanently(item),
        },
        { divider: true },
        {
          label: 'Empty Trash...',
          icon: 'trash',
          disabled: trashItems.length === 0,
          onSelect: handleEmptyTrash,
        },
      ]
    }

    return [
      { header: 'Trash' },
      {
        label: 'Empty Trash...',
        icon: 'trash',
        disabled: trashItems.length === 0,
        onSelect: handleEmptyTrash,
      },
      { divider: true },
      {
        label: viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View',
        icon: viewMode === 'list' ? 'grid' : 'list',
        onSelect: () => setViewMode(viewMode === 'list' ? 'grid' : 'list'),
      },
    ]
  })()

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3">
      {/* Header Toolbar */}
      <header className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] px-2 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <AppIconGraphic
            iconType={trashItems.length > 0 ? 'trash-full' : 'trash'}
            className="w-5 h-5"
          />
          <span className="font-bold text-xs">
            {trashItems.length} {trashItems.length === 1 ? 'item' : 'items'}
          </span>
          {trashItems.length > 0 && (
            <span className="opacity-60 text-[11px]">({formatBytes(totalSize)})</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="default"
            disabled={!selectedItem}
            onClick={() => handleRestoreItem()}
            className="px-2 py-0.5 text-[11px]"
            title="Restore selected item to original folder"
          >
            Put Back
          </Button>
          <Button
            variant="default"
            disabled={!selectedItem}
            onClick={() => handleDeletePermanently()}
            className="px-2 py-0.5 text-[11px]"
            title="Permanently delete selected item"
          >
            Delete
          </Button>
          <Button
            variant="default"
            disabled={trashItems.length === 0}
            onClick={handleEmptyTrash}
            className="px-2 py-0.5 text-[11px]"
            title="Empty all items from Trash"
          >
            Empty Trash
          </Button>
          <Button
            variant="default"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-2 py-0.5 text-[11px]"
            title="Toggle List/Grid View"
          >
            {viewMode === 'list' ? '▦ Grid' : '≡ List'}
          </Button>
        </div>
      </header>

      {/* Main Trash View */}
      <main
        onClick={() => {
          setSelectedId(null)
          closeContextMenu()
        }}
        onContextMenu={handleContainerContextMenu}
        className="flex-1 bg-[var(--os-bg)] overflow-auto relative p-2"
      >
        {trashItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
            <AppIconGraphic iconType="trash" className="w-12 h-12 opacity-40" />
            <div className="italic">Trash is empty</div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="w-full min-w-[420px]">
            <div className="grid grid-cols-12 gap-2 border-b border-[var(--os-border)] pb-1 px-1 text-[10px] font-bold opacity-60 uppercase">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Original Location</div>
              <div className="col-span-2">Date Deleted</div>
              <div className="col-span-2 text-right">Size</div>
            </div>
            <div className="divide-y divide-[var(--os-border)]/20 mt-1">
              {trashItems.map((item) => {
                const isSelected = selectedId === item.id
                const iconType = getItemIconType(item)

                return (
                  <div
                    key={item.id}
                    data-file-selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(item.id)
                      closeContextMenu()
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      toggleQuickLook(item)
                    }}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`grid grid-cols-12 gap-2 items-center py-1.5 px-1.5 text-xs cursor-default ${
                      isSelected
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                        : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-1.5 truncate">
                      <AppIconGraphic iconType={iconType} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="col-span-3 truncate opacity-80 text-[11px]" title={item.originalPath}>
                      {item.originalPath || '-'}
                    </div>
                    <div className="col-span-2 text-[10px] opacity-80 whitespace-nowrap">
                      {formatDate(item.deletedAt)}
                    </div>
                    <div className="col-span-2 text-right text-[10px] whitespace-nowrap">
                      {formatBytes(item.size)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
            {trashItems.map((item) => {
              const isSelected = selectedId === item.id
              const iconType = getItemIconType(item)

              return (
                <div
                  key={item.id}
                  data-file-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(item.id)
                    closeContextMenu()
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    toggleQuickLook(item)
                  }}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                  className={`flex flex-col items-center justify-start p-2 text-center cursor-default border ${
                    isSelected
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)] font-bold'
                      : 'border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/5 text-[var(--os-fg)]'
                  }`}
                >
                  <AppIconGraphic iconType={iconType} className="w-8 h-8 mb-1.5 shrink-0" />
                  <span className="text-[11px] line-clamp-2 break-all w-full leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[9px] opacity-70 mt-0.5">
                    {formatBytes(item.size)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] px-2 py-1 flex items-center justify-between text-[11px] opacity-75 shrink-0">
        <div>
          {statusMessage ||
            (selectedItem
              ? `Selected '${selectedItem.name}' (${formatBytes(selectedItem.size)})`
              : `${trashItems.length} item(s) in trash`)}
        </div>
        <div className="text-[10px]">
          Space: Quick Look | ↵: Put Back | Del: Delete
        </div>
      </footer>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={closeContextMenu}
      />

      {/* Quick Look Preview Modal */}
      <QuickLookModal
        file={quickLookFile}
        isOpen={Boolean(quickLookFile)}
        onClose={() => setQuickLookFile(null)}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] p-4 shadow-[4px_4px_0px_var(--os-shadow)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--os-border)] pb-2 font-bold text-sm">
              <AppIconGraphic iconType="trash" className="w-5 h-5" />
              <span>{confirmDialog.title}</span>
            </div>
            <p className="text-xs">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="default"
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmDialog.onConfirm}
                className="px-3 py-1 font-bold bg-[var(--os-fg)] text-[var(--os-bg)] hover:bg-[var(--os-fg)]/80"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
