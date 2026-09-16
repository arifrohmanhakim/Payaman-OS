import { useState, useRef } from 'react'
import { useFileManager } from './useFileManager.js'
import { useGoogleDrive } from './useGoogleDrive.js'
import { useOS } from '../../hooks/useOS.js'
import { storageService } from '../../services/storageService.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'
import FileViewerModal from '../../components/common/FileViewerModal.jsx'
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

  // Dialog & Pratinjau
  const [activeDialog, setActiveDialog] = useState(null)
  const [dialogInput, setDialogInput] = useState('')
  const [dialogSecondaryInput, setDialogSecondaryInput] = useState('')
  const [filePreview, setFilePreview] = useState(null)

  const quickLinks = [
    { name: 'Beranda (~)', path: '/home/arif', icon: 'folder' },
    { name: 'Dokumen', path: '/home/arif/dokumen', icon: 'folder' },
    { name: 'Sistem', path: '/system', icon: 'folder' },
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

  const openRenameDialog = () => {
    if (!selectedItem) return
    setDialogInput(selectedItem.name)
    setActiveDialog('rename')
  }

  const handleDeleteSelected = () => {
    if (!selectedItem) return
    if (storageSource === 'local') {
      deleteItem(selectedItem.name)
    } else {
      gdrive.deleteFile(selectedItem.id, selectedItem.name)
      setSelectedItem(null)
    }
  }

  const handleImportGdriveSelected = async () => {
    if (!selectedItem) return
    await gdrive.importToVFS(selectedItem, '/home/arif')
  }

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
            </>
          ) : (
            <>
              <Button
                variant="default"
                disabled={gdrive.folderHistory.length <= 1}
                onClick={gdrive.navigateBack}
                className="px-2 py-0.5"
                title="Kembali ke Folder Sebelumnya"
              >
                ←
              </Button>
              <Button
                variant="default"
                onClick={() => gdrive.fetchFiles(gdrive.currentFolder.id)}
                className="px-2 py-0.5"
                title="Segarkan Google Drive"
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
              <span className="font-bold flex items-center gap-1">
                <span>☁️</span>
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
            title="Ganti Tampilan Grid/Daftar"
          >
            {viewMode === 'grid' ? '≡ Daftar' : '▦ Kisi'}
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
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5"
                title="Unggah Berkas dari Komputer (Gambar, PDF, Dokumen, dll)"
              >
                + Unggah
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
                  title="Buat Folder di Google Drive"
                >
                  + Folder
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setDialogInput('dokumen_baru.txt')
                    setDialogSecondaryInput('')
                    setActiveDialog('gdrive_upload')
                  }}
                  className="px-2 py-0.5"
                  title="Unggah Berkas ke Google Drive"
                >
                  + Unggah
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
              Penyimpanan
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
                <span>💾</span>
                <span className="truncate">Lokal (VFS)</span>
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
                  <span>☁️</span>
                  <span className="truncate">Google Drive</span>
                </span>
                {gdrive.isConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Terhubung" />
                )}
              </button>
            </div>
          </div>

          {storageSource === 'local' ? (
            <>
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
                        className={`w-full text-left px-1.5 py-1 text-xs flex items-center gap-1.5 cursor-default ${
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
                <div className="font-bold">
                  {storageStats.usedKb} KB / {storageStats.totalKb} KB
                </div>
              </div>
            </>
          ) : (
            <div className="border-t border-[var(--os-border)] pt-2 text-[10px] space-y-2">
              <div>Akun Terhubung:</div>
              {gdrive.userProfile?.email ? (
                <div className="truncate font-bold text-[10px]" title={gdrive.userProfile.email}>
                  {gdrive.userProfile.email}
                </div>
              ) : (
                <div className="opacity-60">Belum terhubung</div>
              )}
              {gdrive.isConnected && (
                <button
                  type="button"
                  onClick={gdrive.disconnect}
                  className="w-full text-center px-1 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[10px]"
                >
                  Keluar
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Content Explorer Area */}
        <main
          onClick={() => setSelectedItem(null)}
          className="flex-1 bg-[var(--os-bg)] p-3 overflow-auto relative"
        >
          {storageSource === 'local' ? (
            /* Explorer Penyimpanan Lokal VFS */
            items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-50">
                Folder ini kosong.
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(item)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleOpenLocalItem(item)
                      }}
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
                    <th className="py-1 px-2 font-bold">Nama</th>
                    <th className="py-1 px-2 font-bold w-20">Tipe</th>
                    <th className="py-1 px-2 font-bold w-24">Ukuran</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isSelected = selectedItem?.name === item.name
                    const isDir = item.type === 'dir'
                    const category = isDir ? 'folder' : getFileCategory(item.name)
                    const ext = isDir ? '' : getFileExtension(item.name)
                    return (
                      <tr
                        key={item.name}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(item)
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleOpenLocalItem(item)
                        }}
                        className={`border-b border-[var(--os-border)]/30 cursor-default ${
                          isSelected
                            ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                            : 'hover:bg-[var(--os-fg)]/10'
                        }`}
                      >
                        <td className="py-1 px-2 flex items-center gap-1.5">
                          <span>
                            {isDir
                              ? '📁'
                              : category === 'image'
                                ? '🖼️'
                                : category === 'pdf'
                                  ? '📕'
                                  : category === 'doc'
                                    ? '📘'
                                    : '📄'}
                          </span>
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
              /* Layar Sederhana Belum Terhubung: Hanya Tombol Hubungkan */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 border-2 border-[var(--os-border)] rounded-full flex items-center justify-center p-3 os-window-shadow">
                  <AppIconGraphic iconType="cloud" className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-sm font-bold">Google Drive</h3>
                  <p className="text-[11px] opacity-70 mt-1">
                    Hubungkan akun Google Drive Anda untuk mengakses, membuka, dan mengimpor berkas langsung ke Payaman OS.
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
                  <span>🔑</span>
                  <span>{gdrive.isLoading ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
                </Button>
              </div>
            ) : gdrive.isLoading ? (
              <div className="h-full flex items-center justify-center text-center space-y-2">
                <div className="animate-pulse">Memuat berkas dari Google Drive...</div>
              </div>
            ) : gdrive.files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-50">
                Folder Google Drive ini kosong.
              </div>
            ) : viewMode === 'grid' ? (
              /* Langsung masuk ke tampilan grid berkas */
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(file)
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleOpenGdriveItem(file)
                      }}
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
              /* Langsung masuk ke tampilan list berkas */
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-[var(--os-border)] opacity-70">
                    <th className="py-1 px-2 font-bold">Nama</th>
                    <th className="py-1 px-2 font-bold w-28">Tipe</th>
                    <th className="py-1 px-2 font-bold w-24">Ukuran</th>
                  </tr>
                </thead>
                <tbody>
                  {gdrive.files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
                    const isSelected = selectedItem?.id === file.id
                    const category = isFolder ? 'folder' : getFileCategory(file.name, file.mimeType)
                    const ext = isFolder ? '' : getFileExtension(file.name)
                    return (
                      <tr
                        key={file.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(file)
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleOpenGdriveItem(file)
                        }}
                        className={`border-b border-[var(--os-border)]/30 cursor-default ${
                          isSelected
                            ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                            : 'hover:bg-[var(--os-fg)]/10'
                        }`}
                      >
                        <td className="py-1 px-2 flex items-center gap-1.5">
                          <span>
                            {isFolder
                              ? '📁'
                              : category === 'image'
                                ? '🖼️'
                                : category === 'pdf'
                                  ? '📕'
                                  : category === 'doc'
                                    ? '📘'
                                    : '📄'}
                          </span>
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

      {/* Context Action Bar saat ada item dipilih */}
      {selectedItem && (
        <div className="border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1.5 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold">Terpilih:</span>
            <span className="truncate">{selectedItem.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {storageSource === 'local' ? (
              <>
                <Button
                  variant="default"
                  onClick={() => handleOpenLocalItem(selectedItem)}
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
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={() => handleOpenGdriveItem(selectedItem)}
                  className="px-2 py-0.5"
                >
                  {selectedItem.mimeType === 'application/vnd.google-apps.folder'
                    ? 'Buka Folder'
                    : 'Buka / Pratinjau'}
                </Button>

                {selectedItem.mimeType !== 'application/vnd.google-apps.folder' && (
                  <Button
                    variant="primary"
                    onClick={handleImportGdriveSelected}
                    className="px-2 py-0.5"
                    title="Salin berkas Google Drive ke penyimpanan VFS lokal (/home/arif/)"
                  >
                    Salin ke VFS Lokal
                  </Button>
                )}

                <Button
                  variant="default"
                  onClick={handleDeleteSelected}
                  className="px-2 py-0.5"
                >
                  Hapus
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
        <span>
          {storageSource === 'local'
            ? `${items.length} item di VFS`
            : `${gdrive.files.length} item di Google Drive`}
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
              {activeDialog === 'new_folder' && 'Buat Folder Lokal Baru'}
              {activeDialog === 'new_file' && 'Buat Berkas Lokal Baru'}
              {activeDialog === 'rename' && 'Ganti Nama Item'}
              {activeDialog === 'gdrive_new_folder' && 'Buat Folder di Google Drive'}
              {activeDialog === 'gdrive_upload' && 'Unggah Berkas ke Google Drive'}
            </div>

            {activeDialog === 'gdrive_upload' ? (
              <div className="space-y-2">
                <Input
                  value={dialogInput}
                  onChange={(e) => setDialogInput(e.target.value)}
                  placeholder="Nama berkas (contoh: berkas.txt)"
                  autoFocus
                />
                <textarea
                  value={dialogSecondaryInput}
                  onChange={(e) => setDialogSecondaryInput(e.target.value)}
                  placeholder="Isi teks berkas..."
                  rows={4}
                  className="w-full p-1.5 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] focus:outline-none"
                />
              </div>
            ) : (
              <Input
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                placeholder="Masukkan nama..."
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
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      )}

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
