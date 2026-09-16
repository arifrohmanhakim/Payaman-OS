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
                content: 'Selamat datang di Payaman OS.\nSistem operasi web monokrom siap pakai.',
                createdAt: new Date().toISOString(),
              },
              'todo.txt': {
                type: 'file',
                content: '1. Desain antarmuka monokrom\n2. Optimasi kinerja\n3. Uji coba terminal',
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
  }

  loadFs() {
    const saved = storageService.getItem(VFS_STORAGE_KEY, null)
    if (!saved || typeof saved !== 'object') {
      storageService.setItem(VFS_STORAGE_KEY, INITIAL_VFS)
      return JSON.parse(JSON.stringify(INITIAL_VFS))
    }
    return saved
  }

  saveFs() {
    storageService.setItem(VFS_STORAGE_KEY, this.fs)
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
      return { success: false, error: `Direktori '${targetPath}' tidak ditemukan.` }
    }
    if (node.type !== 'dir') {
      return { success: false, error: `'${targetPath}' bukan direktori.` }
    }

    this.currentPath = resolved
    return { success: true, path: resolved }
  }

  listDirectory(targetPath = '') {
    const resolved = targetPath ? this.resolvePath(targetPath) : this.currentPath
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `Direktori '${targetPath}' tidak ditemukan.` }
    }
    if (node.type !== 'dir') {
      return { success: false, error: `'${targetPath}' bukan direktori.` }
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
      return { success: false, error: `Berkas '${targetPath}' tidak ditemukan.` }
    }
    if (node.type !== 'file') {
      return { success: false, error: `'${targetPath}' adalah direktori, bukan berkas.` }
    }

    return { success: true, content: node.content || '' }
  }

  writeFile(targetPath, content, append = false) {
    const resolved = this.resolvePath(targetPath)
    const lastSlash = resolved.lastIndexOf('/')
    const dirPath = resolved.slice(0, lastSlash) || '/'
    const fileName = resolved.slice(lastSlash + 1)

    if (!fileName) {
      return { success: false, error: 'Nama berkas tidak valid.' }
    }

    const dirNode = this.getNode(dirPath)
    if (!dirNode || dirNode.type !== 'dir') {
      return { success: false, error: `Direktori tujuan '${dirPath}' tidak ditemukan.` }
    }

    const existing = dirNode.children[fileName]
    if (existing && existing.type === 'dir') {
      return { success: false, error: `'${fileName}' adalah direktori yang sudah ada.` }
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
      return { success: false, error: 'Nama direktori tidak valid.' }
    }

    const parentNode = this.getNode(parentPath)
    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `Direktori induk '${parentPath}' tidak ditemukan.` }
    }

    if (parentNode.children[dirName]) {
      return { success: false, error: `Berkas atau folder '${dirName}' sudah ada.` }
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
      return { success: false, error: 'Tidak dapat menghapus direktori sistem inti.' }
    }

    const lastSlash = resolved.lastIndexOf('/')
    const parentPath = resolved.slice(0, lastSlash) || '/'
    const itemName = resolved.slice(lastSlash + 1)

    const parentNode = this.getNode(parentPath)
    if (!parentNode || !parentNode.children[itemName]) {
      return { success: false, error: `'${targetPath}' tidak ditemukan.` }
    }

    const targetNode = parentNode.children[itemName]
    if (targetNode.type === 'dir' && Object.keys(targetNode.children || {}).length > 0 && !recursive) {
      return {
        success: false,
        error: `Direktori '${itemName}' tidak kosong. Gunakan flag '-r' atau '-rf' untuk menghapus.`,
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
