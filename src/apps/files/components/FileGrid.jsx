import { memo } from 'react'
import AppIconGraphic from '../../../components/common/AppIconGraphic.jsx'
import { resolveFileIcon } from '../utils/fileIconResolver.js'

export default memo(function FileGrid({
  items,
  selectedItem,
  onSelectItem,
  onOpenItem,
  onContextMenu,
}) {
  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center opacity-50">
        This folder is empty.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {items.map((item) => {
        const key = item.id || item.name
        const isSelected = selectedItem ? (selectedItem.id ? selectedItem.id === item.id : selectedItem.name === item.name) : false
        const isDir = item.type === 'dir' || item.mimeType === 'application/vnd.google-apps.folder'
        const iconType = resolveFileIcon(item.name, isDir, item.mimeType)

        return (
          <div
            key={key}
            data-file-selected={isSelected}
            onClick={(e) => {
              e.stopPropagation()
              onSelectItem(item)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              onOpenItem(item)
            }}
            onContextMenu={(e) => onContextMenu(e, item)}
            className={`flex flex-col items-center justify-center p-2 text-center group cursor-default ${
              isSelected
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1 pointer-events-none">
              <AppIconGraphic iconType={iconType} className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono line-clamp-2 break-all leading-tight">
              {item.name}
            </span>
          </div>
        )
      })}
    </div>
  )
})
