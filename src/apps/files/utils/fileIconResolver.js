import { getFileCategory, getFileExtension } from '../../../utils/fileTypes.js'

export function resolveFileIcon(fileName, isDir, mimeType = '') {
  if (isDir || mimeType === 'application/vnd.google-apps.folder') {
    return 'folder'
  }
  const category = getFileCategory(fileName, mimeType)
  const ext = getFileExtension(fileName)

  if (category === 'image') return 'image'
  if (category === 'pdf') return 'pdf'
  if (category === 'audio' || category === 'video') return 'media'
  if (
    category === 'text' &&
    ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)
  ) {
    return 'code'
  }
  return 'document'
}
