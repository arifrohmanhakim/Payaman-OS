import { useState, useCallback } from 'react'
import { soundService } from '../../services/soundService.js'
import { appRegistry } from '../appRegistry.js'
import { THEMES, PATTERNS } from '../../constants/theme.js'

const WELCOME_MESSAGES = [
  'Payaman OS Command Shell v1.0',
  "Ketik 'help' untuk melihat daftar perintah yang tersedia.",
  '',
]

export function useTerminal({ osContext, onClose }) {
  const [outputLines, setOutputLines] = useState(
    WELCOME_MESSAGES.map((text) => ({ type: 'info', text }))
  )
  const [commandHistory, setCommandHistory] = useState([])
  const [historyPointer, setHistoryPointer] = useState(-1)
  const [inputValue, setInputValue] = useState('')

  const appendLines = useCallback((lines) => {
    setOutputLines((prev) => [...prev, ...lines])
  }, [])

  const executeCommand = useCallback(
    (commandLine) => {
      const trimmed = commandLine.trim()
      if (!trimmed) {
        appendLines([{ type: 'command', text: `payaman@os:~$ ` }])
        return
      }

      setCommandHistory((prev) => [...prev, trimmed])
      setHistoryPointer(-1)

      const [command, ...args] = trimmed.split(/\s+/)
      const cmd = command.toLowerCase()
      const argString = args.join(' ')

      const newOutputs = [{ type: 'command', text: `payaman@os:~$ ${trimmed}` }]

      switch (cmd) {
        case 'help':
          newOutputs.push(
            { type: 'info', text: 'Perintah yang tersedia:' },
            { type: 'info', text: '  help              Tampilkan bantuan perintah' },
            { type: 'info', text: '  clear / cls       Bersihkan layar terminal' },
            { type: 'info', text: '  ls / dir          Daftar aplikasi terpasang' },
            { type: 'info', text: '  open <app>        Buka aplikasi (contoh: open write)' },
            { type: 'info', text: '  theme [nama]      Lihat atau ubah tema tampilan' },
            { type: 'info', text: '  pattern [nama]    Lihat atau ubah pola desktop' },
            { type: 'info', text: '  date              Tampilkan waktu dan tanggal lokal' },
            { type: 'info', text: '  whoami            Tampilkan nama pengguna saat ini' },
            { type: 'info', text: '  uname / ver       Informasi sistem operasi' },
            { type: 'info', text: '  echo [teks]       Cetak ulang teks ke layar' },
            { type: 'info', text: '  beep              Bunyikan nada sistem retro' },
            { type: 'info', text: '  history           Daftar riwayat perintah' },
            { type: 'info', text: '  exit              Tutup jendela terminal' }
          )
          break

        case 'clear':
        case 'cls':
          setOutputLines([])
          setInputValue('')
          return

        case 'ls':
        case 'dir':
          newOutputs.push({ type: 'info', text: 'Aplikasi terpasang di Payaman OS:' })
          appRegistry.forEach((app) => {
            newOutputs.push({
              type: 'info',
              text: `  - ${app.id.padEnd(14)} : ${app.title}`,
            })
          })
          break

        case 'open':
          if (!args[0]) {
            newOutputs.push({
              type: 'error',
              text: "Gunakan: open <id_aplikasi> (contoh: 'open calc')",
            })
          } else {
            const targetApp = appRegistry.find(
              (a) => a.id.toLowerCase() === args[0].toLowerCase()
            )
            if (targetApp) {
              osContext.openApp(targetApp.id)
              newOutputs.push({
                type: 'info',
                text: `Membuka aplikasi: ${targetApp.title}...`,
              })
            } else {
              newOutputs.push({
                type: 'error',
                text: `Aplikasi '${args[0]}' tidak ditemukan. Ketik 'ls' untuk melihat daftar aplikasi.`,
              })
            }
          }
          break

        case 'theme':
          if (!args[0]) {
            newOutputs.push(
              { type: 'info', text: `Tema aktif: ${osContext.theme || 'classic'}` },
              { type: 'info', text: 'Pilihan tema: ' + THEMES.map((t) => t.id).join(', ') },
              { type: 'info', text: "Gunakan 'theme <nama>' untuk mengubah tema." }
            )
          } else {
            const targetTheme = THEMES.find((t) => t.id === args[0].toLowerCase())
            if (targetTheme) {
              osContext.setTheme(targetTheme.id)
              newOutputs.push({
                type: 'info',
                text: `Tema berhasil diubah ke: ${targetTheme.name}`,
              })
            } else {
              newOutputs.push({
                type: 'error',
                text: `Tema '${args[0]}' tidak valid. Pilihan: ` + THEMES.map((t) => t.id).join(', '),
              })
            }
          }
          break

        case 'pattern':
          if (!args[0]) {
            newOutputs.push(
              { type: 'info', text: `Pola latar aktif: ${osContext.pattern || 'halftone'}` },
              { type: 'info', text: 'Pilihan pola: ' + PATTERNS.map((p) => p.id).join(', ') },
              { type: 'info', text: "Gunakan 'pattern <nama>' untuk mengubah pola latar desktop." }
            )
          } else {
            const targetPattern = PATTERNS.find((p) => p.id === args[0].toLowerCase())
            if (targetPattern) {
              osContext.setPattern(targetPattern.id)
              newOutputs.push({
                type: 'info',
                text: `Pola latar berhasil diubah ke: ${targetPattern.name}`,
              })
            } else {
              newOutputs.push({
                type: 'error',
                text: `Pola '${args[0]}' tidak valid. Pilihan: ` + PATTERNS.map((p) => p.id).join(', '),
              })
            }
          }
          break

        case 'date':
          newOutputs.push({
            type: 'info',
            text: new Date().toLocaleString('id-ID', {
              dateStyle: 'full',
              timeStyle: 'medium',
            }),
          })
          break

        case 'whoami':
          newOutputs.push({ type: 'info', text: 'arif@payaman-os' })
          break

        case 'uname':
        case 'version':
        case 'ver':
          newOutputs.push(
            { type: 'info', text: 'Payaman OS Version 1.0 (Web Edition)' },
            { type: 'info', text: 'Monochrome Desktop Interface with Window Manager' }
          )
          break

        case 'echo':
          newOutputs.push({ type: 'info', text: argString })
          break

        case 'beep':
          soundService.playBeep(880, 0.15)
          newOutputs.push({ type: 'info', text: '🔔 Beep!' })
          break

        case 'history':
          commandHistory.forEach((item, index) => {
            newOutputs.push({ type: 'info', text: `  ${index + 1}  ${item}` })
          })
          break

        case 'exit':
          if (onClose) {
            onClose()
            return
          }
          newOutputs.push({ type: 'info', text: 'Menutup terminal...' })
          break

        default:
          newOutputs.push({
            type: 'error',
            text: `Perintah '${command}' tidak dikenali. Ketik 'help' untuk daftar perintah.`,
          })
          break
      }

      appendLines(newOutputs)
      setInputValue('')
    },
    [appendLines, commandHistory, osContext, onClose]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        executeCommand(inputValue)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (commandHistory.length === 0) return
        const nextPointer =
          historyPointer === -1
            ? commandHistory.length - 1
            : Math.max(0, historyPointer - 1)
        setHistoryPointer(nextPointer)
        setInputValue(commandHistory[nextPointer] || '')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyPointer === -1) return
        const nextPointer = historyPointer + 1
        if (nextPointer >= commandHistory.length) {
          setHistoryPointer(-1)
          setInputValue('')
        } else {
          setHistoryPointer(nextPointer)
          setInputValue(commandHistory[nextPointer] || '')
        }
      }
    },
    [commandHistory, executeCommand, historyPointer, inputValue]
  )

  return {
    outputLines,
    inputValue,
    setInputValue,
    handleKeyDown,
  }
}
