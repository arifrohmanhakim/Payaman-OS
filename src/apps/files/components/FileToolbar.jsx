import { memo } from 'react'
import Button from '../../../components/ui/Button.jsx'
import AppIconGraphic from '../../../components/common/AppIconGraphic.jsx'

export default memo(function FileToolbar({
  storageSource,
  currentPath,
  canGoBack,
  canGoForward,
  viewMode,
  fileInputRef,
  gdrive,
  navigateBack,
  navigateForward,
  navigateUp,
  navigateTo,
  setViewMode,
  onOpenDialog,
  onFileInputChange,
}) {
  const pathParts = currentPath.split('/').filter(Boolean)

  return (
    <header className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] px-2 py-1.5 flex items-center justify-between gap-2 shrink-0">
      {/* Tombol Navigasi Kiri */}
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

      {/* View Mode & Aksi Kanan */}
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
              onChange={onFileInputChange}
              multiple
              className="hidden"
            />
            <Button
              variant="default"
              onClick={() => onOpenDialog('new_folder')}
              className="px-2 py-0.5"
              title="New Folder"
            >
              + Folder
            </Button>
            <Button
              variant="default"
              onClick={() => onOpenDialog('new_file')}
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
                onClick={() => onOpenDialog('gdrive_new_folder')}
                className="px-2 py-0.5"
                title="Create Folder in Google Drive"
              >
                + Folder
              </Button>
              <Button
                variant="default"
                onClick={() => onOpenDialog('gdrive_upload')}
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
  )
})
