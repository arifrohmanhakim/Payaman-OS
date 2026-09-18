import { memo } from 'react'
import AppIconGraphic from '../../../components/common/AppIconGraphic.jsx'
import { getFileCategory, getFileExtension } from '../../../utils/fileTypes.js'
import { resolveFileIcon } from '../utils/fileIconResolver.js'

export default memo(function FileListView({
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
    <table className="w-full text-left border-collapse text-[11px]">
      <thead>
        <tr className="border-b-2 border-[var(--os-border)] opacity-70">
          <th className="py-1 px-2 font-bold">Name</th>
          <th className="py-1 px-2 font-bold w-28">Type</th>
          <th className="py-1 px-2 font-bold w-24">Size</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const key = item.id || item.name
          const isSelected = selectedItem ? (selectedItem.id ? selectedItem.id === item.id : selectedItem.name === item.name) : false
          const isDir = item.type === 'dir' || item.mimeType === 'application/vnd.google-apps.folder'
          const category = isDir ? 'folder' : getFileCategory(item.name, item.mimeType)
          const ext = isDir ? '' : getFileExtension(item.name)
          const iconType = resolveFileIcon(item.name, isDir, item.mimeType)

          return (
            <tr
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
              className={`border-b border-[var(--os-border)]/30 cursor-default ${
                isSelected
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                  : 'hover:bg-[var(--os-fg)]/10'
              }`}
            >
              <td className="py-1 px-2 flex items-center gap-1.5">
                <AppIconGraphic iconType={iconType} className="w-4 h-4 shrink-0" />
                <span className="font-medium truncate">{item.name}</span>
              </td>
              <td className="py-1 px-2 uppercase text-[10px] truncate max-w-[120px]">
                {isDir ? 'Folder' : ext || category}
              </td>
              <td className="py-1 px-2 text-[10px]">
                {isDir
                  ? '--'
                  : item.size
                    ? item.size > 1024
                      ? `${Math.round(item.size / 1024)} KB`
                      : `${item.size} B`
                    : '--'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
})
