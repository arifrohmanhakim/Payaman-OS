import { soundService } from '../../services/soundService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { appRegistry } from '../appRegistry.js'
import { THEMES, PATTERNS } from '../../constants/theme.js'

const SESSION_START_TIME = Date.now()

function safeCalculate(expression) {
  const sanitized = expression.replace(/[^0-9+\-*/().%^ ]/g, '')
  if (!sanitized.trim()) return 'Error: Ekspresi kosong'
  try {
    const fn = new Function(`"use strict"; return (${sanitized.replace(/\^/g, '**')})`)
    const result = fn()
    return isFinite(result) ? String(result) : 'Error: Hasil tidak terhingga'
  } catch {
    return 'Error: Sintaks ekspresi matematika tidak valid'
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
      return ['Kesalahan sintaks: Nama berkas tujuan tidak ditentukan setelah redirection.']
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
          ls: 'ls [path] [-l] : Menampilkan daftar berkas dan direktori.',
          cd: 'cd <path> : Berpindah direktori kerja (contoh: cd .., cd ~, cd /system).',
          cat: 'cat <file> : Menampilkan isi dari sebuah berkas teks.',
          touch: 'touch <file> : Membuat berkas kosong baru.',
          mkdir: 'mkdir <dir> : Membuat folder baru di direktori saat ini.',
          rm: 'rm [-r|-rf] <path> : Menghapus berkas atau folder.',
          echo: 'echo [teks] [>|>> file] : Mencetak teks atau menyimpannya ke berkas.',
          curl: 'curl <url> : Mengirim HTTP request dan menampilkan respon jaringan.',
          calc: 'calc <ekspresi> : Menghitung ekspresi matematika (contoh: calc (12 + 8) * 5).',
          ps: 'ps : Menampilkan daftar jendela proses yang sedang aktif.',
          kill: 'kill <id|pid> : Menghentikan proses atau menutup jendela aplikasi.',
          theme: 'theme [nama] : Mengatur palet warna OS (classic, dark, amber, green, paper).',
          pattern: 'pattern [nama] : Mengatur pola latar desktop (halftone, checkerboard, dll).',
          dock: 'dock [size|pos|autohide] [val] : Mengonfigurasi pengaturan dock via shell.',
        }
        outputLines.push(topicHelps[topic] || `Bantuan untuk '${topic}' tidak ditemukan.`)
      } else {
        outputLines.push(
          'Perintah Berkas & Direktori:',
          '  pwd, cd, ls, cat, touch, mkdir, rm, echo, df',
          '',
          'Perintah Proses & Jendela:',
          '  ps, kill, open',
          '',
          'Perintah Sistem & Pengaturan:',
          '  theme, pattern, dock, uname, whoami, uptime, date, reboot',
          '',
          'Utilitas & Jaringan:',
          '  curl, calc, beep, history, clear, exit',
          '',
          "Ketik 'help <perintah>' untuk melihat panduan spesifik."
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
        outputLines.push('(Direktori kosong)')
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
        outputLines.push('Gunakan: cat <nama_berkas>')
      } else {
        const readRes = fileSystemService.readFile(args[0])
        if (readRes.success) {
          outputLines.push(readRes.content || '(Berkas kosong)')
        } else {
          outputLines.push(readRes.error)
        }
      }
      break

    case 'touch':
      if (!args[0]) {
        outputLines.push('Gunakan: touch <nama_berkas>')
      } else {
        const touchRes = fileSystemService.writeFile(args[0], '', false)
        if (!touchRes.success) {
          outputLines.push(touchRes.error)
        }
      }
      break

    case 'mkdir':
      if (!args[0]) {
        outputLines.push('Gunakan: mkdir <nama_folder>')
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
        outputLines.push('Gunakan: rm [-r] <target>')
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
        'Sistem Berkas         Ukuran     Terpakai   Tersedia   Persentase',
        `/dev/vfs0             ${stats.totalKb} KB   ${stats.usedKb} KB   ${(
          parseFloat(stats.totalKb) - parseFloat(stats.usedKb)
        ).toFixed(2)} KB   ${stats.usedPercent}%`
      )
      break
    }

    case 'ps': {
      const running = osContext.windows || []
      outputLines.push('PID   APLIKASI         STATUS      UKURAN')
      running.forEach((win, index) => {
        const pid = 1000 + index
        const isFocus = osContext.activeWindowId === win.id ? 'FOKUS' : 'LATAR'
        const appName = win.appId.padEnd(16, ' ')
        const size = `${win.width}x${win.height}`
        outputLines.push(`${pid}  ${appName} ${isFocus.padEnd(11, ' ')} ${size}`)
      })
      break
    }

    case 'kill': {
      if (!args[0]) {
        outputLines.push('Gunakan: kill <pid | id_aplikasi>')
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
          outputLines.push(`Proses [${windowToClose.appId}] berhasil dihentikan.`)
        } else {
          outputLines.push(
            `Tidak ada proses yang cocok dengan '${target}'. Ketik 'ps' untuk daftar proses.`
          )
        }
      }
      break
    }

    case 'launchpad':
    case 'apps':
      if (osContext.openLaunchpad) {
        osContext.openLaunchpad()
        outputLines.push('Membuka Launchpad...')
      }
      break

    case 'paint':
    case 'macpaint':
      osContext.openApp('paint')
      outputLines.push('Membuka aplikasi Payaman Paint (MacPaint)...')
      break

    case 'open':
      if (!args[0]) {
        outputLines.push("Gunakan: open <id_aplikasi> (contoh: 'open write', 'open launchpad')")
      } else if (args[0].toLowerCase() === 'launchpad') {
        if (osContext.openLaunchpad) {
          osContext.openLaunchpad()
          outputLines.push('Membuka Launchpad...')
        }
      } else {
        const targetApp = appRegistry.find(
          (a) => a.id.toLowerCase() === args[0].toLowerCase()
        )
        if (targetApp) {
          osContext.openApp(targetApp.id)
          outputLines.push(`Membuka aplikasi [${targetApp.title}]...`)
        } else {
          outputLines.push(
            `Aplikasi '${args[0]}' tidak ditemukan. Pilihan: launchpad, ` +
              appRegistry.map((a) => a.id).join(', ')
          )
        }
      }
      break

    case 'curl':
    case 'fetch': {
      const url = args[0]
      if (!url) {
        outputLines.push('Gunakan: curl <url>')
        break
      }

      const targetUrl =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`

      outputLines.push(`Menghubungi ${targetUrl}...`)
      try {
        const response = await fetch(targetUrl, { mode: 'cors' })
        const text = await response.text()
        const truncated = text.length > 1000 ? text.slice(0, 1000) + '\n... [dipotong]' : text
        outputLines.push(
          `HTTP Status: ${response.status} ${response.statusText}`,
          truncated
        )
      } catch (err) {
        outputLines.push(
          `Gagal melakukan request: ${err.message}. (Kemungkinan CORS dibatasi oleh server tujuan).`
        )
      }
      break
    }

    case 'calc':
    case 'bc':
      if (!argString) {
        outputLines.push('Gunakan: calc <ekspresi matematika> (contoh: calc 15 * (4 + 6))')
      } else {
        const calcResult = safeCalculate(argString)
        outputLines.push(`= ${calcResult}`)
      }
      break

    case 'theme':
      if (!args[0]) {
        outputLines.push(
          `Tema aktif: ${osContext.theme || 'classic'}`,
          'Pilihan tema: ' + THEMES.map((t) => t.id).join(', ')
        )
      } else {
        const selected = THEMES.find((t) => t.id === args[0].toLowerCase())
        if (selected) {
          osContext.setTheme(selected.id)
          outputLines.push(`Tema berhasil diubah menjadi: ${selected.name}`)
        } else {
          outputLines.push(
            `Tema '${args[0]}' tidak valid. Pilihan: ` + THEMES.map((t) => t.id).join(', ')
          )
        }
      }
      break

    case 'pattern':
      if (!args[0]) {
        outputLines.push(
          `Pola aktif: ${osContext.pattern || 'halftone'}`,
          'Pilihan: ' + PATTERNS.map((p) => p.id).join(', ')
        )
      } else {
        const selected = PATTERNS.find((p) => p.id === args[0].toLowerCase())
        if (selected) {
          osContext.setPattern(selected.id)
          outputLines.push(`Pola latar berhasil diubah menjadi: ${selected.name}`)
        } else {
          outputLines.push(
            `Pola '${args[0]}' tidak valid. Pilihan: ` + PATTERNS.map((p) => p.id).join(', ')
          )
        }
      }
      break

    case 'dock': {
      const sub = args[0]?.toLowerCase()
      const val = args[1]?.toLowerCase()

      if (sub === 'size' && ['small', 'medium', 'large'].includes(val)) {
        osContext.updateDockSettings({ size: val })
        outputLines.push(`Ukuran dock diubah menjadi: ${val}`)
      } else if (sub === 'pos' && ['bottom', 'left', 'right'].includes(val)) {
        osContext.updateDockSettings({ position: val })
        outputLines.push(`Posisi dock diubah menjadi: ${val}`)
      } else if (sub === 'autohide') {
        const active = val === 'on' || val === 'true' || val === '1'
        osContext.updateDockSettings({ autoHide: active })
        outputLines.push(`Auto-hide dock ${active ? 'diaktifkan' : 'dinonaktifkan'}.`)
      } else {
        outputLines.push(
          'Konfigurasi Dock saat ini:',
          `  Ukuran: ${osContext.dockSettings?.size || 'medium'}, Posisi: ${
            osContext.dockSettings?.position || 'bottom'
          }, Auto-hide: ${osContext.dockSettings?.autoHide ? 'Aktif' : 'Nonaktif'}`,
          "Gunakan: 'dock size <small|medium|large>', 'dock pos <bottom|left|right>', 'dock autohide <on|off>'"
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
      outputLines.push(`Uptime: ${hours} jam, ${mins % 60} menit, ${sec % 60} detik`)
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
      outputLines.push('Memulai ulang sesi Payaman OS...')
      setTimeout(() => window.location.reload(), 600)
      break

    case 'exit':
      if (onClose) {
        onClose()
        return []
      }
      outputLines.push('Menutup terminal...')
      break

    default:
      outputLines.push(`Perintah '${command}' tidak ditemukan. Ketik 'help' untuk panduan.`)
      break
  }

  return outputLines
}
