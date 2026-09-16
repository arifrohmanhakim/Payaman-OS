export function getFileExtension(filename = '') {
  const parts = filename.split('.')
  if (parts.length <= 1) return ''
  return parts.pop().toLowerCase()
}

export function getFileCategory(filename = '', mimeType = '') {
  const ext = getFileExtension(filename)
  const mime = (mimeType || '').toLowerCase()

  if (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext)
  ) {
    return 'image'
  }

  if (
    mime === 'application/pdf' ||
    ext === 'pdf'
  ) {
    return 'pdf'
  }

  if (
    mime.includes('wordprocessingml') ||
    mime.includes('msword') ||
    mime.includes('officedocument') ||
    mime.includes('application/vnd.google-apps.document') ||
    mime.includes('application/vnd.google-apps.spreadsheet') ||
    mime.includes('application/vnd.google-apps.presentation') ||
    mime.includes('opendocument') ||
    ['doc', 'docx', 'odt', 'rtf', 'pages', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
  ) {
    return 'doc'
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)
  ) {
    return 'audio'
  }

  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)
  ) {
    return 'video'
  }

  if (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/javascript' ||
    [
      'txt', 'md', 'markdown', 'json', 'js', 'jsx', 'ts', 'tsx',
      'html', 'htm', 'css', 'log', 'csv', 'sh', 'bash', 'zsh',
      'yml', 'yaml', 'xml', 'sql', 'ini', 'env', 'conf', 'py',
      'c', 'cpp', 'h', 'java', 'rs', 'go', 'php'
    ].includes(ext)
  ) {
    return 'text'
  }

  return 'unknown'
}

export function getFileEmoji(filename = '', mimeType = '') {
  const category = getFileCategory(filename, mimeType)
  switch (category) {
    case 'image':
      return '🖼️'
    case 'pdf':
      return '📕'
    case 'doc':
      return '📘'
    case 'audio':
      return '🎵'
    case 'video':
      return '🎬'
    case 'text':
      return '📄'
    default:
      return '📦'
  }
}

export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '-'
  const num = Number(bytes)
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${(num / (1024 * 1024)).toFixed(1)} MB`
}
