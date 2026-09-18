import { memo } from 'react'
import Button from '../../../components/ui/Button.jsx'
import Input from '../../../components/ui/Input.jsx'

export default memo(function FileDialog({
  activeDialog,
  dialogInput,
  dialogSecondaryInput,
  onInputChange,
  onSecondaryInputChange,
  onSubmit,
  onClose,
}) {
  if (!activeDialog) return null

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={onSubmit}
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
              onChange={onInputChange}
              placeholder="File name (e.g. document.txt)"
              autoFocus
            />
            <textarea
              value={dialogSecondaryInput}
              onChange={onSecondaryInputChange}
              placeholder="File text content..."
              rows={4}
              className="w-full p-1.5 text-xs font-mono bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] focus:outline-none"
            />
          </div>
        ) : (
          <Input
            value={dialogInput}
            onChange={onInputChange}
            placeholder="Enter name..."
            autoFocus
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="default"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  )
})
