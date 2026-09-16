import { useRef, useEffect } from 'react'
import { useOS } from '../../hooks/useOS.js'
import { useTerminal } from './useTerminal.js'

export default function TerminalApp({ onClose }) {
  const osContext = useOS()
  const { outputLines, inputValue, setInputValue, handleKeyDown } = useTerminal({
    osContext,
    onClose,
  })

  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const terminalAreaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [outputLines])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      ref={terminalAreaRef}
      onClick={handleContainerClick}
      className="h-full flex flex-col bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-text cursor-text -m-3 p-3 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {outputLines.map((line, idx) => (
          <div
            key={idx}
            className={`leading-relaxed whitespace-pre-wrap ${
              line.type === 'error'
                ? 'opacity-80 underline'
                : line.type === 'command'
                ? 'font-bold'
                : 'opacity-90'
            }`}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center pt-1">
          <span className="font-bold select-none mr-2">payaman@os:~$</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent border-none outline-none text-[var(--os-fg)] font-mono text-xs p-0 m-0 cursor-text"
            />
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
