import { storageService } from './storageService.js'

const VFS_STORAGE_KEY = 'payaman_vfs'

const INITIAL_VFS = {
  '/': {
    type: 'dir',
    children: {
      home: {
        type: 'dir',
        children: {
          arif: {
            type: 'dir',
            children: {
              'catatan.txt': {
                type: 'file',
                content: 'Welcome to Payaman OS.\nA monochrome web-based desktop operating system.',
                createdAt: new Date().toISOString(),
              },
              'todo.txt': {
                type: 'file',
                content: '1. Monochrome UI design\n2. Performance optimization\n3. Terminal verification',
                createdAt: new Date().toISOString(),
              },
              'guide.md': {
                type: 'file',
                content: '# Payaman OS User Guide\n\nWelcome to the monochrome web desktop operating system.\n\n## Key Features\n- **Multi-Format File Viewer**: Supports images (PNG, JPG, SVG), PDF documents, text, and Office files.\n- **Google Drive Integration**: Access and open your Google Drive files directly inside the OS.\n- **MacPaint**: Classic retro drawing studio with various tools and fill patterns.\n- **Terminal CLI**: Work with a virtual UNIX terminal shell.\n\n## Quick Tips\n- Double-click any file to open an instant preview.\n- Press `Esc` to close preview modal windows.',
                createdAt: new Date().toISOString(),
              },
              'logo.svg': {
                type: 'file',
                content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#fff" stroke="#111" stroke-width="6"/><rect x="25" y="25" width="150" height="150" fill="#fff" stroke="#111" stroke-width="4"/><circle cx="100" cy="85" r="35" fill="none" stroke="#111" stroke-width="6"/><path d="M70 145 C70 120 130 120 130 145 Z" fill="#111"/><text x="100" y="168" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" fill="#111">PAYAMAN OS</text></svg>',
                createdAt: new Date().toISOString(),
              },
              dokumen: {
                type: 'dir',
                children: {},
              },
            },
          },
        },
      },
      system: {
        type: 'dir',
        children: {
          version: {
            type: 'file',
            content: 'Payaman OS 1.0 (Web Edition)\nBuild: 2026.09\nPlatform: Web/React',
            createdAt: new Date().toISOString(),
          },
          hostname: {
            type: 'file',
            content: 'payaman-box',
            createdAt: new Date().toISOString(),
          },
        },
      },
      tmp: {
        type: 'dir',
        children: {},
      },
    },
  },
}

class FileSystemService {
  constructor() {
    this.currentPath = '/home/arif'
    this.fs = this.loadFs()
    this.listeners = new Set()
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    this.listeners.forEach((callback) => {
      try {
        callback()
      } catch {
        // Abaikan error callback
      }
    })
  }

  loadFs() {
    const saved = storageService.getItem(VFS_STORAGE_KEY, null)
    if (!saved || typeof saved !== 'object') {
      storageService.setItem(VFS_STORAGE_KEY, INITIAL_VFS)
      return JSON.parse(JSON.stringify(INITIAL_VFS))
    }

    const arifDir = saved?.['/']?.children?.home?.children?.arif?.children
    if (arifDir) {
      const initialArif = INITIAL_VFS['/'].children.home.children.arif.children
      let updated = false
      for (const [key, val] of Object.entries(initialArif)) {
        if (!arifDir[key]) {
          arifDir[key] = val
          updated = true
        }
      }
      if (updated) {
        storageService.setItem(VFS_STORAGE_KEY, saved)
      }
    }

    return saved
  }

  saveFs() {
    storageService.setItem(VFS_STORAGE_KEY, this.fs)
    this.notify()
  }

  rename(targetPath, newName) {
    const trimmed = (newName || '').trim()
    if (!trimmed || trimmed.includes('/')) {
      return { success: false, error: 'New file or folder name is invalid.' }
    }

    const resolved = this.resolvePath(targetPath)
    if (resolved === '/' || resolved === '/home' || resolved === '/home/arif') {
      return { success: false, error: 'Cannot rename core system directory.' }
    }

    const lastSlash = resolved.lastIndexOf('/')
    const parentPath = resolved.slice(0, lastSlash) || '/'
    const oldName = resolved.slice(lastSlash + 1)

    const parentNode = this.getNode(parentPath)
    if (!parentNode || !parentNode.children[oldName]) {
      return { success: false, error: `'${oldName}' not found.` }
    }

    if (parentNode.children[trimmed]) {
      return { success: false, error: `'${trimmed}' already exists in this location.` }
    }

    parentNode.children[trimmed] = parentNode.children[oldName]
    delete parentNode.children[oldName]
    this.saveFs()
    return { success: true }
  }

  getCurrentPath() {
    return this.currentPath
  }

  resolvePath(inputPath) {
    if (!inputPath || inputPath === '~') {
      return '/home/arif'
    }

    let normalized = inputPath
    if (normalized.startsWith('~/')) {
      normalized = '/home/arif/' + normalized.slice(2)
    }

    const isAbsolute = normalized.startsWith('/')
    const parts = (isAbsolute ? normalized : `${this.currentPath}/${normalized}`)
      .split('/')
      .filter(Boolean)

    const resolved = []
    for (const part of parts) {
      if (part === '.') continue
      if (part === '..') {
        if (resolved.length > 0) resolved.pop()
      } else {
        resolved.push(part)
      }
    }

    return '/' + resolved.join('/')
  }

  getNode(resolvedPath) {
    if (resolvedPath === '/') return this.fs['/']
    const parts = resolvedPath.split('/').filter(Boolean)
    let current = this.fs['/']

    for (const part of parts) {
      if (!current || current.type !== 'dir' || !current.children) {
        return null
      }
      current = current.children[part]
    }

    return current || null
  }

  changeDirectory(targetPath) {
    const resolved = this.resolvePath(targetPath)
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `Directory '${targetPath}' not found.` }
    }
    if (node.type !== 'dir') {
      return { success: false, error: `'${targetPath}' is not a directory.` }
    }

    this.currentPath = resolved
    return { success: true, path: resolved }
  }

  listDirectory(targetPath = '') {
    const resolved = targetPath ? this.resolvePath(targetPath) : this.currentPath
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `Directory '${targetPath}' not found.` }
    }
    if (node.type !== 'dir') {
      return { success: false, error: `'${targetPath}' is not a directory.` }
    }

    const items = Object.entries(node.children || {}).map(([name, item]) => ({
      name,
      type: item.type,
      size: item.type === 'file' ? (item.content || '').length : 0,
      createdAt: item.createdAt || null,
    }))

    return { success: true, items, path: resolved }
  }

  readFile(targetPath) {
    const resolved = this.resolvePath(targetPath)
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `File '${targetPath}' not found.` }
    }
    if (node.type !== 'file') {
      return { success: false, error: `'${targetPath}' is a directory, not a file.` }
    }

    return { success: true, content: node.content || '' }
  }

  writeFile(targetPath, content, append = false) {
    const resolved = this.resolvePath(targetPath)
    const lastSlash = resolved.lastIndexOf('/')
    const dirPath = resolved.slice(0, lastSlash) || '/'
    const fileName = resolved.slice(lastSlash + 1)

    if (!fileName) {
      return { success: false, error: 'Invalid file name.' }
    }

    const dirNode = this.getNode(dirPath)
    if (!dirNode || dirNode.type !== 'dir') {
      return { success: false, error: `Target directory '${dirPath}' not found.` }
    }

    const existing = dirNode.children[fileName]
    if (existing && existing.type === 'dir') {
      return { success: false, error: `'${fileName}' is an existing directory.` }
    }

    const finalContent = append && existing ? (existing.content || '') + '\n' + content : content

    dirNode.children[fileName] = {
      type: 'file',
      content: finalContent,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.saveFs()
    return { success: true, path: resolved }
  }

  createDirectory(targetPath) {
    const resolved = this.resolvePath(targetPath)
    const lastSlash = resolved.lastIndexOf('/')
    const parentPath = resolved.slice(0, lastSlash) || '/'
    const dirName = resolved.slice(lastSlash + 1)

    if (!dirName) {
      return { success: false, error: 'Invalid directory name.' }
    }

    const parentNode = this.getNode(parentPath)
    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `Parent directory '${parentPath}' not found.` }
    }

    if (parentNode.children[dirName]) {
      return { success: false, error: `File or folder '${dirName}' already exists.` }
    }

    parentNode.children[dirName] = {
      type: 'dir',
      children: {},
      createdAt: new Date().toISOString(),
    }

    this.saveFs()
    return { success: true, path: resolved }
  }

  remove(targetPath, recursive = false) {
    const resolved = this.resolvePath(targetPath)
    if (resolved === '/' || resolved === '/home' || resolved === '/home/arif') {
      return { success: false, error: 'Cannot delete core system directory.' }
    }

    const lastSlash = resolved.lastIndexOf('/')
    const parentPath = resolved.slice(0, lastSlash) || '/'
    const itemName = resolved.slice(lastSlash + 1)

    const parentNode = this.getNode(parentPath)
    if (!parentNode || !parentNode.children[itemName]) {
      return { success: false, error: `'${targetPath}' not found.` }
    }

    const targetNode = parentNode.children[itemName]
    if (targetNode.type === 'dir' && Object.keys(targetNode.children || {}).length > 0 && !recursive) {
      return {
        success: false,
        error: `Directory '${itemName}' is not empty. Use '-r' or '-rf' to remove.`,
      }
    }

    delete parentNode.children[itemName]
    this.saveFs()
    return { success: true }
  }

  getStorageStats() {
    try {
      const raw = JSON.stringify(this.fs)
      const usedBytes = new Blob([raw]).size
      return {
        usedKb: (usedBytes / 1024).toFixed(2),
        totalKb: '5120.00',
        usedPercent: ((usedBytes / (5 * 1024 * 1024)) * 100).toFixed(2),
      }
    } catch {
      return { usedKb: '0', totalKb: '5120.00', usedPercent: '0' }
    }
  }
}

export const fileSystemService = new FileSystemService()
