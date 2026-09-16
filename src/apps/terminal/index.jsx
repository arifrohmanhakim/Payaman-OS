import { useRef, useEffect } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { useOS } from '../../hooks/useOS.js'
import { getPrompt, executeShellCommand } from './terminalShell.js'

const THEME_COLORS = {
  classic: {
    background: '#ffffff',
    foreground: '#000000',
    cursor: '#000000',
    cursorAccent: '#ffffff',
    selectionBackground: '#000000',
    selectionForeground: '#ffffff',
  },
  dark: {
    background: '#141414',
    foreground: '#ffffff',
    cursor: '#ffffff',
    cursorAccent: '#141414',
    selectionBackground: '#ffffff',
    selectionForeground: '#141414',
  },
  amber: {
    background: '#181106',
    foreground: '#ffb000',
    cursor: '#ffb000',
    cursorAccent: '#181106',
    selectionBackground: '#ffb000',
    selectionForeground: '#181106',
  },
  green: {
    background: '#07170c',
    foreground: '#33ff66',
    cursor: '#33ff66',
    cursorAccent: '#07170c',
    selectionBackground: '#33ff66',
    selectionForeground: '#07170c',
  },
  paper: {
    background: '#f5f0e6',
    foreground: '#2c251e',
    cursor: '#2c251e',
    cursorAccent: '#f5f0e6',
    selectionBackground: '#2c251e',
    selectionForeground: '#f5f0e6',
  },
}

export default function TerminalApp({ onClose }) {
  const osContext = useOS()
  const containerRef = useRef(null)
  const termInstanceRef = useRef(null)
  const fitAddonRef = useRef(null)

  const osContextRef = useRef(osContext)
  useEffect(() => {
    osContextRef.current = osContext
  }, [osContext])

  useEffect(() => {
    if (!containerRef.current) return

    const currentTheme = THEME_COLORS[osContext.theme] || THEME_COLORS.classic

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 12,
      lineHeight: 1.2,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      theme: currentTheme,
      convertEol: true,
      allowTransparency: false,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termInstanceRef.current = term
    fitAddonRef.current = fitAddon

    let lineBuffer = ''
    const commandHistory = []
    let historyIndex = -1

    const promptText = () => `${getPrompt()} `

    term.writeln('Payaman OS Terminal (Powered by xterm.js)')
    term.writeln("Type 'help' for a list of available commands.")
    term.writeln('')
    term.write(promptText())

    const handleData = async (data) => {
      // Enter
      if (data === '\r') {
        term.write('\r\n')
        const cmdToRun = lineBuffer.trim()

        if (cmdToRun) {
          commandHistory.push(cmdToRun)
          historyIndex = -1

          const outputs = await executeShellCommand(cmdToRun, {
            osContext: osContextRef.current,
            onClose,
          })

          if (outputs === '__CLEAR__') {
            term.clear()
          } else if (Array.isArray(outputs)) {
            outputs.forEach((line) => {
              term.writeln(line)
            })
          }
        }

        lineBuffer = ''
        term.write(promptText())
        return
      }

      // Backspace
      if (data === '\u007F' || data === '\b') {
        if (lineBuffer.length > 0) {
          lineBuffer = lineBuffer.slice(0, -1)
          term.write('\b \b')
        }
        return
      }

      // Arrow Up (History Prev)
      if (data === '\u001b[A') {
        if (commandHistory.length === 0) return
        const nextIndex =
          historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        historyIndex = nextIndex
        const prevCmd = commandHistory[nextIndex] || ''

        term.write('\b \b'.repeat(lineBuffer.length))
        lineBuffer = prevCmd
        term.write(prevCmd)
        return
      }

      // Arrow Down (History Next)
      if (data === '\u001b[B') {
        if (historyIndex === -1) return
        const nextIndex = historyIndex + 1

        term.write('\b \b'.repeat(lineBuffer.length))
        if (nextIndex >= commandHistory.length) {
          historyIndex = -1
          lineBuffer = ''
        } else {
          historyIndex = nextIndex
          const nextCmd = commandHistory[nextIndex] || ''
          lineBuffer = nextCmd
          term.write(nextCmd)
        }
        return
      }

      // Ctrl + C
      if (data === '\u0003') {
        term.writeln('^C')
        lineBuffer = ''
        historyIndex = -1
        term.write(promptText())
        return
      }

      // Ctrl + L (Clear)
      if (data === '\u000c') {
        term.clear()
        term.write(promptText() + lineBuffer)
        return
      }

      // Ignore unhandled escape sequences
      if (data.startsWith('\u001b')) {
        return
      }

      // Printable characters
      lineBuffer += data
      term.write(data)
    }

    const dataDisposable = term.onData(handleData)

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit()
      } catch {}
    })
    resizeObserver.observe(containerRef.current)

    const focusTimer = setTimeout(() => {
      term.focus()
    }, 50)

    return () => {
      clearTimeout(focusTimer)
      dataDisposable.dispose()
      resizeObserver.disconnect()
      term.dispose()
    }
  }, [onClose, osContext.theme])

  // Sync theme changes dynamically
  useEffect(() => {
    if (termInstanceRef.current) {
      const currentTheme = THEME_COLORS[osContext.theme] || THEME_COLORS.classic
      termInstanceRef.current.options.theme = currentTheme
    }
  }, [osContext.theme])

  return (
    <div
      onClick={() => termInstanceRef.current?.focus()}
      className="w-full h-full p-2 bg-[var(--os-bg)] overflow-hidden cursor-text select-text -m-3 relative"
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
