import { useState, useCallback } from 'react'
import { soundService } from '../../../services/soundService.js'
import { fileSystemService } from '../../../services/fileSystemService.js'

export function useDesktopFileDrop({ openApp, showModal, closeModal }) {
  const [isDragOverFile, setIsDragOverFile] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverFile(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOverFile(false)
    }
  }, [])

  const handleDropFiles = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOverFile(false)

      const files = Array.from(e.dataTransfer.files || [])
      if (files.length === 0) return

      soundService.playClick()

      files.forEach((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''

        // 1. Spreadsheet (.xlsx, .xls, .csv)
        if (['xlsx', 'xls', 'csv'].includes(ext)) {
          fileSystemService.writeFile(
            `/home/arif/dokumen/${file.name}`,
            `[Imported Spreadsheet: ${file.name}]`
          )
          openApp('sheets', { importedFile: file, fileName: file.name })
          return
        }

        // 2. Images (.png, .jpg, .jpeg, .gif, .svg, .webp)
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
          const reader = new FileReader()
          reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target?.result
            if (dataUrl) {
              fileSystemService.writeFile(
                `/home/arif/dokumen/${file.name}`,
                dataUrl
              )
              openApp('gallery', { previewUrl: dataUrl, title: file.name })
            }
          }
          reader.readAsDataURL(file)
          return
        }

        // 3. Text / Markdown / Code / Document files
        const reader = new FileReader()
        reader.onload = (loadEvt) => {
          const text = loadEvt.target?.result
          if (typeof text === 'string') {
            fileSystemService.writeFile(`/home/arif/dokumen/${file.name}`, text)
            openApp('write', { initialContent: text, fileName: file.name })
          }
        }
        reader.readAsText(file)
      })

      showModal({
        type: 'file_imported',
        title: 'File Imported',
        message: `Successfully imported ${files.length} file(s) into Payaman OS (/home/arif/dokumen/).`,
        onConfirm: () => closeModal(),
      })
    },
    [openApp, showModal, closeModal]
  )

  return {
    isDragOverFile,
    handleDragOver,
    handleDragLeave,
    handleDropFiles,
  }
}
