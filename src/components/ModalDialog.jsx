export default function ModalDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 select-none">
      <div className="bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] p-1 os-dialog-shadow max-w-sm w-full mx-4">
        <div className="border border-[var(--os-border)] p-4 space-y-4 font-mono">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border-2 border-[var(--os-border)] flex items-center justify-center font-bold text-lg shrink-0">
              !
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs">{title}</h4>
              <p className="text-xs opacity-75">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--os-border)]">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-1 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs font-bold cursor-default"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-1 border-2 border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs font-bold cursor-default ring-1 ring-[var(--os-fg)] ring-offset-1"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
