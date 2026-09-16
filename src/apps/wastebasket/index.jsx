import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'

export default function WastebasketApp() {
  const [items, setItems] = useState([
    { id: 1, name: 'old_draft_letter.txt', size: '2 KB' },
    { id: 2, name: 'budget_report_1982.doc', size: '14 KB' },
  ])

  const handleEmpty = () => {
    setItems([])
  }

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-xs text-[var(--os-fg)]">
      <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-2">
        <span className="opacity-70 font-bold">
          {items.length} {items.length === 1 ? 'file' : 'files'} in trash
        </span>
        <Button
          variant="default"
          onClick={handleEmpty}
          disabled={items.length === 0}
        >
          Empty Trash
        </Button>
      </div>

      <div className="flex-1 border-2 border-[var(--os-border)] p-2 min-h-[120px] bg-[var(--os-bg)] overflow-auto">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-50 italic">
            Trash is empty
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((file) => (
              <li
                key={file.id}
                className="flex justify-between items-center py-1 px-1.5 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-default"
              >
                <span>{file.name}</span>
                <span className="text-[10px]">{file.size}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
