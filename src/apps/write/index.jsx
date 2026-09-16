import { useDocument } from './useDocument.js'
import Button from '../../components/ui/Button.jsx'

export default function WriteApp() {
  const {
    content,
    setContent,
    statusMessage,
    wordCount,
    charCount,
    saveDocument,
    clearDocument,
  } = useDocument()

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-[var(--os-fg)]">
      <div className="flex items-center justify-between border-b border-[var(--os-border)] pb-2 text-xs">
        <div className="flex gap-2">
          <Button variant="default" onClick={saveDocument}>
            Save
          </Button>
          <Button variant="default" onClick={clearDocument}>
            Clear
          </Button>
        </div>
        <span className="opacity-70 font-bold">{statusMessage}</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-2 border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs resize-none outline-none focus:ring-1 focus:ring-[var(--os-fg)] min-h-[140px]"
        placeholder="Type notes..."
      />

      <div className="flex justify-between items-center text-[10px] opacity-70 border-t border-[var(--os-border)] pt-1">
        <span>Characters: {charCount}</span>
        <span>Words: {wordCount}</span>
      </div>
    </div>
  )
}
