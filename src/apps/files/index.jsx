import { useState } from 'react'
import { useFileManager } from './useFileManager.js'
import { useOS } from '../../hooks/useOS.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function FileManagerApp() {
  const { openApp } = useOS()
  const {
    currentPath,
    items,
    selectedItem,
    viewMode,
    statusMessage,
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
  } = useFileManager('/home/arif')

  const [activeDialog, setActiveDialog] = useState(null)
  const [dialogInput, setDialogInput] = useState('')
  const [filePreview, setFilePreview] = useState(null)

  const quickLinks = [
    { name: 'Beranda (~)', path: '/home/arif', icon: 'folder' },
    { name: 'Dokumen', path: '/home/arif/dokumen', icon: 'folder' },
    { name: 'Sistem', path: '/system', icon: 'folder' },
    { name: 'Root (/)', path: '/', icon: 'folder' },
    { name: 'Temp (/tmp)', path: '/tmp', icon: 'folder' },
  ]

  const handleOpenItem = (item) => {
    if (item.type === 'dir') {
      const nextPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`
      navigateTo(nextPath)
    } else {
      const res = readFileContent(item.name)
      if (res.success) {
        setFilePreview({
          name: item.name,
          content: res.content,
        })
      }
    }
  }

  const handleDialogSubmit = (e) => {
    e.preventDefault()
    if (!dialogInput.trim()) return

    if (activeDialog === 'new_folder') {
      createFolder(dialogInput)
    } else if (activeDialog === 'new_file') {
      createFile(dialogInput)
    } else if (activeDialog === 'rename' && selectedItem) {
      renameItem(selectedItem.name, dialogInput)
    }

    setActiveDialog(null)
    setDialogInput('')
  }

  const openRenameDialog = () => {
    if (!selectedItem) return
    setDialogInput(selectedItem.name)
    setActiveDialog('rename')
  }

  const handleDeleteSelected = () => {
    if (!selectedItem) return
    deleteItem(selectedItem.name)
  }

  const pathParts = currentPath.split('/').filter(Boolean)

  return (
    <div className="h-full flex flex-col font-mono text-xs text-[var(--os-fg)] select-none -m-3">
      {/* Toolbar Atas */}
      <header className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] px-2 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            disabled={!canGoBack}
            onClick={navigateBack}
            className="px-2 py-0.5"
            title="Kembali"
          >
            ←
          </Button>
          <Button
            variant="default"
            disabled={!canGoForward}
            onClick={navigateForward}
            className="px-2 py-0.5"
            title="Maju"
          >
            →
          </Button>
          <Button
            variant="default"
            disabled={currentPath === '/'}
            onClick={navigateUp}
            className="px-2 py-0.5"
            title="Ke Direktori Induk"
          >
            ↑
          </Button>
          <Button
            variant="default"
            onClick={() => navigateTo('/home/arif')}
            className="px-2 py-0.5"
            title="Ke Folder Beranda"
          >
            ~
          </Button>
        </div>

        {/* Path Breadcrumbs */}
        <div className="flex-1 overflow-x-auto flex items-center gap-1 border border-[var(--os-border)] px-2 py-0.5 bg-[var(--os-bg)] text-[11px] whitespace-nowrap">
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
        </div>

        {/* View Mode & Aksi */}
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-2 py-0.5"
            title="Ganti Tampilan Grid/Daftar"
          >
            {viewMode === 'grid' ? '≡ Daftar' : '▦ Kisi'}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setDialogInput('')
              setActiveDialog('new_folder')
            }}
            className="px-2 py-0.5"
            title="Buat Folder Baru"
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
            title="Buat Berkas Baru"
          >
            + Berkas
          </Button>
        </div>
      </header>

      {/* Main Container: Sidebar + Explorer Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigasi Cepat */}
        <aside className="w-36 border-r-2 border-[var(--os-border)] bg-[var(--os-bg)] p-2 space-y-3 overflow-y-auto shrink-0 hidden sm:block">
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
              Pintasan
            </span>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const isActive = currentPath === link.path
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigateTo(link.path)}
                    className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 transition-none cursor-default ${
                      isActive
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                        : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    <span>📁</span>
                    <span className="truncate">{link.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[var(--os-border)] pt-2 text-[10px] opacity-70">
            <div>Kapasitas VFS:</div>
            <div className="font-bold">{storageStats.usedKb} KB / {storageStats.totalKb} KB</div>
          </div>
        </aside>

        {/* Content Explorer */}
        <main
          onClick={() => setSelectedItem(null)}
          className="flex-1 bg-[var(--os-bg)] p-3 overflow-auto relative"
        >
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center opacity-50">
              Folder ini kosong.
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((item) => {
                const isSelected = selectedItem?.name === item.name
                return (
                  <div
                    key={item.name}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItem(item)
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleOpenItem(item)
                    }}
                    className={`flex flex-col items-center justify-center p-2 text-center group cursor-default transition-none ${
                      isSelected
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                        : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-1 pointer-events-none">
                      <AppIconGraphic
                        iconType={item.type === 'dir' ? 'folder' : 'document'}
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
            /* List View */
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b-2 border-[var(--os-border)] opacity-70">
                  <th className="py-1 px-2 font-bold">Nama</th>
                  <th className="py-1 px-2 font-bold w-20">Tipe</th>
                  <th className="py-1 px-2 font-bold w-24">Ukuran</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isSelected = selectedItem?.name === item.name
                  return (
                    <tr
                      key={item.name}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(item)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleOpenItem(item)
                      }}
                      className={`border-b border-[var(--os-border)]/30 cursor-default ${
                        isSelected
                          ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                          : 'hover:bg-[var(--os-fg)]/10'
                      }`}
                    >
                      <td className="py-1 px-2 flex items-center gap-1.5">
                        <span>{item.type === 'dir' ? '📁' : '📄'}</span>
                        <span className="font-medium">{item.name}</span>
                      </td>
                      <td className="py-1 px-2 uppercase text-[10px]">
                        {item.type === 'dir' ? 'Folder' : 'Berkas'}
                      </td>
                      <td className="py-1 px-2 text-[10px]">
                        {item.type === 'dir' ? '--' : `${item.size} B`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Context Action Bar saat ada item dipilih */}
      {selectedItem && (
        <div className="border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">Terpilih:</span>
            <span>{selectedItem.name}</span>
            <span className="opacity-50">({selectedItem.type === 'dir' ? 'Folder' : 'Berkas'})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="default"
              onClick={() => handleOpenItem(selectedItem)}
              className="px-2 py-0.5"
            >
              Buka
            </Button>
            <Button
              variant="default"
              onClick={openRenameDialog}
              className="px-2 py-0.5"
            >
              Ganti Nama
            </Button>
            <Button
              variant="default"
              onClick={handleDeleteSelected}
              className="px-2 py-0.5"
            >
              Hapus
            </Button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
        <span>{items.length} item</span>
        <span>{statusMessage || currentPath}</span>
      </footer>

      {/* Modal Dialog untuk Buat / Ganti Nama */}
      {activeDialog && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleDialogSubmit}
            className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow p-4 w-72 space-y-3 font-mono text-xs text-[var(--os-fg)]"
          >
            <div className="font-bold border-b border-[var(--os-border)] pb-1">
              {activeDialog === 'new_folder' && 'Buat Folder Baru'}
              {activeDialog === 'new_file' && 'Buat Berkas Baru'}
              {activeDialog === 'rename' && 'Ganti Nama Item'}
            </div>

            <Input
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
              placeholder="Masukkan nama..."
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="default"
                type="button"
                onClick={() => setActiveDialog(null)}
              >
                Batal
              </Button>
              <Button variant="default" type="submit">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pratinjau Berkas Teks */}
      {filePreview && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow w-96 max-h-[80%] flex flex-col font-mono text-xs text-[var(--os-fg)]">
            <header className="h-6 border-b-2 border-[var(--os-border)] px-2 flex items-center justify-between bg-[var(--os-bg)]">
              <span className="font-bold truncate">{filePreview.name}</span>
              <button
                type="button"
                onClick={() => setFilePreview(null)}
                className="w-4 h-4 border border-current flex items-center justify-center font-bold text-[10px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
              >
                ×
              </button>
            </header>

            <div className="flex-1 p-3 overflow-auto whitespace-pre-wrap font-mono text-xs select-text bg-[var(--os-bg)]">
              {filePreview.content || '(Berkas kosong)'}
            </div>

            <footer className="border-t border-[var(--os-border)] p-2 flex justify-end gap-2 bg-[var(--os-bg)]">
              <Button
                variant="default"
                onClick={() => {
                  setFilePreview(null)
                  openApp('write')
                }}
              >
                Edit di Catatan
              </Button>
              <Button
                variant="default"
                onClick={() => setFilePreview(null)}
              >
                Tutup
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
