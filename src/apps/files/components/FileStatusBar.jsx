import { memo } from 'react'

export default memo(function FileStatusBar({
  storageSource,
  localItemsCount,
  gdriveFilesCount,
  localStatusMessage,
  currentPath,
  gdrive,
}) {
  return (
    <footer className="border-t border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-1 flex items-center justify-between text-[10px] opacity-70 shrink-0">
      <span>
        {storageSource === 'local'
          ? `${localItemsCount} items in VFS`
          : `${gdriveFilesCount} items in Google Drive`}
      </span>
      <span className="truncate max-w-md">
        {storageSource === 'local'
          ? localStatusMessage || currentPath
          : gdrive.statusMessage || gdrive.errorMessage || gdrive.currentFolder.name}
      </span>
    </footer>
  )
})
