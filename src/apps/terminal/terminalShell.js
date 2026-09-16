import { soundService } from '../../services/soundService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { appRegistry } from '../appRegistry.js'
import { THEMES, PATTERNS } from '../../constants/theme.js'

const SESSION_START_TIME = Date.now()

function safeCalculate(expression) {
  const sanitized = expression.replace(/[^0-9+\-*/().%^ ]/g, '')
  if (!sanitized.trim()) return 'Error: Empty expression'
  try {
    const fn = new Function(`"use strict"; return (${sanitized.replace(/\^/g, '**')})`)
    const result = fn()
    return isFinite(result) ? String(result) : 'Error: Result is infinity'
  } catch {
    return 'Error: Invalid mathematical expression syntax'
  }
}

export function getPrompt() {
  const currentPath = fileSystemService.getCurrentPath()
  const displayPath = currentPath.startsWith('/home/arif')
    ? '~' + currentPath.slice('/home/arif'.length)
    : currentPath
  return `arif@payaman:${displayPath || '/'} $`
}

export async function executeShellCommand(commandLine, { osContext, onClose }) {
  const trimmed = commandLine.trim()
  if (!trimmed) return []

  const outputLines = []

  if (trimmed.includes('>') || trimmed.includes('>>')) {
    const isAppend = trimmed.includes('>>')
    const parts = trimmed.split(isAppend ? '>>' : '>')
    const leftCmd = parts[0].trim()
    const targetFile = parts[1]?.trim()

    if (!targetFile) {
      return ['Syntax error: Destination file name not specified after redirection.']
    }

    let contentToWrite = ''
    if (leftCmd.startsWith('echo ')) {
      contentToWrite = leftCmd.slice(5).replace(/^['"]|['"]$/g, '')
    } else {
      contentToWrite = leftCmd
    }

    const writeRes = fileSystemService.writeFile(targetFile, contentToWrite, isAppend)
    if (!writeRes.success) {
      return [writeRes.error]
    }
    return []
  }

  const [command, ...args] = trimmed.split(/\s+/)
  const cmd = command.toLowerCase()
  const argString = args.join(' ')

  switch (cmd) {
    case 'help':
      if (args[0]) {
        const topic = args[0].toLowerCase()
        const topicHelps = {
          ls: 'ls [path] [-l] : List files and directories.',
          cd: 'cd <path> : Change working directory (e.g. cd .., cd ~, cd /system).',
          cat: 'cat <file> : Display text file content.',
          touch: 'touch <file> : Create a new empty file.',
          mkdir: 'mkdir <dir> : Create a new folder.',
          rm: 'rm [-r|-rf] <path> : Remove file or directory.',
          echo: 'echo [text] [>|>> file] : Print text or append/write to file.',
          curl: 'curl <url> : Send HTTP request and display response.',
          calc: 'calc <expression> : Calculate math expression (e.g. calc (12 + 8) * 5).',
          ps: 'ps : List running application process windows.',
          kill: 'kill <id|pid> : Terminate process or close window.',
          theme: 'theme [name] : Set OS theme palette (classic, dark, amber, green, paper).',
          pattern: 'pattern [name] : Set desktop wallpaper pattern (halftone, checkerboard, etc).',
          dock: 'dock [size|pos|autohide] [val] : Configure dock settings via shell.',
          profile: 'profile [name] : Change terminal color profile (basic, pro, grass, homebrew, ocean).',
        }
        outputLines.push(topicHelps[topic] || `Help for '${topic}' not found.`)
      } else {
        outputLines.push(
          'File & Directory Commands:',
          '  pwd, cd, ls, cat, touch, mkdir, rm, echo, df',
          '',
          'Process & Window Commands:',
          '  ps, kill, open',
          '',
          'System & Settings Commands:',
          '  theme, pattern, dock, uname, whoami, uptime, date, reboot',
          '',
          'Terminal Commands:',
          '  profile - Change terminal color profile (basic, pro, grass, homebrew, ocean)',
          '',
          'Utilities & Network:',
          '  curl, calc, beep, history, clear, exit',
          '',
          "Type 'help <command>' for specific guide."
        )
      }
      break

    case 'pwd':
      outputLines.push(fileSystemService.getCurrentPath())
      break

    case 'cd': {
      const target = args[0] || '~'
      const res = fileSystemService.changeDirectory(target)
      if (!res.success) {
        outputLines.push(res.error)
      }
      break
    }

    case 'ls':
    case 'dir': {
      const isDetailed = args.includes('-l')
      const targetPath = args.find((a) => !a.startsWith('-')) || ''
      const res = fileSystemService.listDirectory(targetPath)
      if (!res.success) {
        outputLines.push(res.error)
      } else if (res.items.length === 0) {
        outputLines.push('(Directory is empty)')
      } else if (isDetailed) {
        res.items.forEach((item) => {
          const typeChar = item.type === 'dir' ? 'd' : '-'
          const size = String(item.size).padStart(6, ' ')
          outputLines.push(
            `${typeChar}rwxr-xr-x  1 arif arif  ${size} B  ${item.name}${
              item.type === 'dir' ? '/' : ''
            }`
          )
        })
      } else {
        const formatted = res.items
          .map((item) => (item.type === 'dir' ? `[${item.name}]` : item.name))
          .join('   ')
        outputLines.push(formatted)
      }
      break
    }

    case 'cat':
      if (!args[0]) {
        outputLines.push('Usage: cat <filename>')
      } else {
        const readRes = fileSystemService.readFile(args[0])
        if (readRes.success) {
          outputLines.push(readRes.content || '(Empty file)')
        } else {
          outputLines.push(readRes.error)
        }
      }
      break

    case 'touch':
      if (!args[0]) {
        outputLines.push('Usage: touch <filename>')
      } else {
        const touchRes = fileSystemService.writeFile(args[0], '', false)
        if (!touchRes.success) {
          outputLines.push(touchRes.error)
        }
      }
      break

    case 'mkdir':
      if (!args[0]) {
        outputLines.push('Usage: mkdir <directory_name>')
      } else {
        const mkdirRes = fileSystemService.createDirectory(args[0])
        if (!mkdirRes.success) {
          outputLines.push(mkdirRes.error)
        }
      }
      break

    case 'rm': {
      const isRecursive = args.includes('-r') || args.includes('-rf')
      const target = args.find((a) => !a.startsWith('-'))
      if (!target) {
        outputLines.push('Usage: rm [-r] <target>')
      } else {
        const rmRes = fileSystemService.remove(target, isRecursive)
        if (!rmRes.success) {
          outputLines.push(rmRes.error)
        }
      }
      break
    }

    case 'echo':
      outputLines.push(argString)
      break

    case 'df': {
      const stats = fileSystemService.getStorageStats()
      outputLines.push(
        'Filesystem            Size       Used       Available  Capacity',
        `/dev/vfs0             ${stats.totalKb} KB   ${stats.usedKb} KB   ${(
          parseFloat(stats.totalKb) - parseFloat(stats.usedKb)
        ).toFixed(2)} KB   ${stats.usedPercent}%`
      )
      break
    }

    case 'ps': {
      const running = osContext.windows || []
      outputLines.push('PID   APPLICATION      STATUS      SIZE')
      running.forEach((win, index) => {
        const pid = 1000 + index
        const isFocus = osContext.activeWindowId === win.id ? 'FOCUS' : 'BACKGROUND'
        const appName = win.appId.padEnd(16, ' ')
        const size = `${win.width}x${win.height}`
        outputLines.push(`${pid}  ${appName} ${isFocus.padEnd(11, ' ')} ${size}`)
      })
      break
    }

    case 'kill': {
      if (!args[0]) {
        outputLines.push('Usage: kill <pid | app_id>')
      } else {
        const target = args[0]
        const running = osContext.windows || []
        let windowToClose = null

        if (/^\d+$/.test(target)) {
          const targetPid = parseInt(target, 10)
          const winIndex = targetPid - 1000
          if (running[winIndex]) {
            windowToClose = running[winIndex]
          }
        } else {
          windowToClose = running.find((w) => w.appId.toLowerCase() === target.toLowerCase())
        }

        if (windowToClose) {
          osContext.closeWindow(windowToClose.id)
          outputLines.push(`Process [${windowToClose.appId}] terminated.`)
        } else {
          outputLines.push(
            `No process matching '${target}'. Type 'ps' for process list.`
          )
        }
      }
      break
    }

    case 'launchpad':
    case 'apps':
      if (osContext.openLaunchpad) {
        osContext.openLaunchpad()
        outputLines.push('Opening Launchpad...')
      }
      break

    case 'paint':
    case 'macpaint':
      osContext.openApp('paint')
      outputLines.push('Opening Payaman Paint (MacPaint)...')
      break

    case 'open':
      if (!args[0]) {
        outputLines.push("Usage: open <app_id> (e.g. 'open write', 'open launchpad')")
      } else if (args[0].toLowerCase() === 'launchpad') {
        if (osContext.openLaunchpad) {
          osContext.openLaunchpad()
          outputLines.push('Opening Launchpad...')
        }
      } else {
        const targetApp = appRegistry.find(
          (a) => a.id.toLowerCase() === args[0].toLowerCase()
        )
        if (targetApp) {
          osContext.openApp(targetApp.id)
          outputLines.push(`Opening application [${targetApp.title}]...`)
        } else {
          outputLines.push(
            `Application '${args[0]}' not found. Available: launchpad, ` +
              appRegistry.map((a) => a.id).join(', ')
          )
        }
      }
      break

    case 'curl':
    case 'fetch': {
      const url = args[0]
      if (!url) {
        outputLines.push('Usage: curl <url>')
        break
      }

      const targetUrl =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`

      outputLines.push(`Connecting to ${targetUrl}...`)
      try {
        const response = await fetch(targetUrl, { mode: 'cors' })
        const text = await response.text()
        const truncated = text.length > 1000 ? text.slice(0, 1000) + '\n... [truncated]' : text
        outputLines.push(
          `HTTP Status: ${response.status} ${response.statusText}`,
          truncated
        )
      } catch (err) {
        outputLines.push(
          `Request failed: ${err.message}. (CORS may be restricted by target server).`
        )
      }
      break
    }

    case 'calc':
    case 'bc':
      if (!argString) {
        outputLines.push('Usage: calc <math_expression> (e.g. calc 15 * (4 + 6))')
      } else {
        const calcResult = safeCalculate(argString)
        outputLines.push(`= ${calcResult}`)
      }
      break

    case 'theme':
      if (!args[0]) {
        outputLines.push(
          `Active theme: ${osContext.theme || 'classic'}`,
          'Available themes: ' + THEMES.map((t) => t.id).join(', ')
        )
      } else {
        const selected = THEMES.find((t) => t.id === args[0].toLowerCase())
        if (selected) {
          osContext.setTheme(selected.id)
          outputLines.push(`Theme changed to: ${selected.name}`)
        } else {
          outputLines.push(
            `Invalid theme '${args[0]}'. Available: ` + THEMES.map((t) => t.id).join(', ')
          )
        }
      }
      break

    case 'pattern':
      if (!args[0]) {
        outputLines.push(
          `Active pattern: ${osContext.pattern || 'halftone'}`,
          'Available patterns: ' + PATTERNS.map((p) => p.id).join(', ')
        )
      } else {
        const selected = PATTERNS.find((p) => p.id === args[0].toLowerCase())
        if (selected) {
          osContext.setPattern(selected.id)
          outputLines.push(`Desktop pattern changed to: ${selected.name}`)
        } else {
          outputLines.push(
            `Invalid pattern '${args[0]}'. Available: ` + PATTERNS.map((p) => p.id).join(', ')
          )
        }
      }
      break

    case 'dock': {
      const sub = args[0]?.toLowerCase()
      const val = args[1]?.toLowerCase()

      if (sub === 'size' && ['small', 'medium', 'large'].includes(val)) {
        osContext.updateDockSettings({ size: val })
        outputLines.push(`Dock size changed to: ${val}`)
      } else if (sub === 'pos' && ['bottom', 'left', 'right'].includes(val)) {
        osContext.updateDockSettings({ position: val })
        outputLines.push(`Dock position changed to: ${val}`)
      } else if (sub === 'autohide') {
        const active = val === 'on' || val === 'true' || val === '1'
        osContext.updateDockSettings({ autoHide: active })
        outputLines.push(`Dock auto-hide ${active ? 'enabled' : 'disabled'}.`)
      } else {
        outputLines.push(
          'Current Dock Configuration:',
          `  Size: ${osContext.dockSettings?.size || 'medium'}, Position: ${
            osContext.dockSettings?.position || 'bottom'
          }, Auto-hide: ${osContext.dockSettings?.autoHide ? 'Enabled' : 'Disabled'}`,
          "Usage: 'dock size <small|medium|large>', 'dock pos <bottom|left|right>', 'dock autohide <on|off>'"
        )
      }
      break
    }

    case 'clear':
    case 'cls':
      return '__CLEAR__'

    case 'date':
      outputLines.push(
        new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })
      )
      break

    case 'uptime': {
      const sec = Math.floor((Date.now() - SESSION_START_TIME) / 1000)
      const mins = Math.floor(sec / 60)
      const hours = Math.floor(mins / 60)
      outputLines.push(`Uptime: ${hours} hours, ${mins % 60} minutes, ${sec % 60} seconds`)
      break
    }

    case 'whoami':
      outputLines.push('arif@payaman-os')
      break

    case 'hostname':
      outputLines.push('payaman-box')
      break

    case 'uname':
      outputLines.push(
        args.includes('-a')
          ? 'PayamanOS payaman-box 1.0.0-web #1 SMP React-Vite x86_64 xterm.js WebKit/Blink'
          : 'PayamanOS'
      )
      break

    case 'beep': {
      const freq = parseFloat(args[0]) || 880
      const dur = parseFloat(args[1]) || 0.15
      soundService.playBeep(freq, dur)
      outputLines.push(`🔔 Beep (${freq}Hz, ${dur}s)`)
      break
    }

    case 'reboot':
    case 'restart':
      outputLines.push('Restarting Payaman OS session...')
      setTimeout(() => window.location.reload(), 600)
      break

    case 'exit':
      if (onClose) {
        onClose()
        return []
      }
      outputLines.push('Closing terminal...')
      break

    default:
      outputLines.push(`Command '${command}' not found. Type 'help' for available commands.`)
      break
  }

  return outputLines
}
