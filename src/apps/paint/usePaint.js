import { useState, useRef, useEffect, useCallback } from 'react'
import { soundService } from '../../services/soundService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { PATTERN_DEFINITIONS, RETRO_COLOR_PALETTE, getPatternCanvas, hexToRgb } from './patterns.js'

const CANVAS_WIDTH = 560
const CANVAS_HEIGHT = 380
const MAX_HISTORY = 20

export function usePaint() {
  const canvasRef = useRef(null)
  const [activeTool, setActiveTool] = useState('pencil')
  const [activePatternId, setActivePatternId] = useState('black')
  const [activeColor, setActiveColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [statusMessage, setStatusMessage] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Dialog teks
  const [textPrompt, setTextPrompt] = useState(null)

  const isDrawingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d', { willReadFrequently: true })
  }, [])

  const saveHistorySnapshot = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Buang history di depan historyIndex jika ada redo sebelumnya
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(imgData)

    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift()
    }

    historyRef.current = newHistory
    historyIndexRef.current = newHistory.length - 1

    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [getCanvasContext])

  // Inisialisasi kanvas pertama kali
  useEffect(() => {
    const ctx = getCanvasContext()
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.imageSmoothingEnabled = false

    saveHistorySnapshot()
  }, [getCanvasContext, saveHistorySnapshot])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    const ctx = getCanvasContext()
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
    soundService.playClick()
  }, [getCanvasContext])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const ctx = getCanvasContext()
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
    soundService.playClick()
  }, [getCanvasContext])

  const clearCanvas = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    saveHistorySnapshot()
    soundService.playClick()
    setStatusMessage('Kanvas dibersihkan.')
  }, [getCanvasContext, saveHistorySnapshot])

  const invertCanvas = useCallback(() => {
    const ctx = getCanvasContext()
    if (!ctx) return
    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }
    ctx.putImageData(imgData, 0, 0)
    saveHistorySnapshot()
    soundService.playClick()
    setStatusMessage('Warna kanvas dibalikkan.')
  }, [getCanvasContext, saveHistorySnapshot])

  const getPointerPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / rect.width
    const scaleY = CANVAS_HEIGHT / rect.height
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    }
  }

  const applyPatternFill = (ctx) => {
    const patternDef = PATTERN_DEFINITIONS.find((p) => p.id === activePatternId)
    if (!patternDef || patternDef.id === 'black') {
      ctx.fillStyle = activeColor
      return
    }
    if (patternDef.id === 'white') {
      ctx.fillStyle = '#ffffff'
      return
    }
    const patternCanvas = getPatternCanvas(patternDef, activeColor, '#ffffff')
    const pattern = ctx.createPattern(patternCanvas, 'repeat')
    ctx.fillStyle = pattern || activeColor
  }

  // Flood fill algorithm
  const performFloodFill = (startX, startY) => {
    const ctx = getCanvasContext()
    if (!ctx) return
    if (startX < 0 || startX >= CANVAS_WIDTH || startY < 0 || startY >= CANVAS_HEIGHT) return

    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    const data = imgData.data

    const startIndex = (startY * CANVAS_WIDTH + startX) * 4
    const startR = data[startIndex]
    const startG = data[startIndex + 1]
    const startB = data[startIndex + 2]

    const patternDef = PATTERN_DEFINITIONS.find((p) => p.id === activePatternId) || PATTERN_DEFINITIONS[0]
    const fg = hexToRgb(activeColor)
    const bg = { r: 255, g: 255, b: 255 }

    // Buat fungsi penentu warna piksel berdasarkan pola
    const getPatternColor = (x, y) => {
      if (patternDef.id === 'black') return fg
      if (patternDef.id === 'white') return bg
      const bit = (patternDef.data[y % 8] >> (7 - (x % 8))) & 1
      return bit === 1 ? fg : bg
    }

    // Jika warna start sudah sama dengan fill pada titik ini dan polanya solid, hindari infinite loop
    if (patternDef.id === 'black' && startR === fg.r && startG === fg.g && startB === fg.b) return
    if (patternDef.id === 'white' && startR === 255 && startG === 255 && startB === 255) return

    const matchesStartColor = (index) => {
      return (
        Math.abs(data[index] - startR) < 32 &&
        Math.abs(data[index + 1] - startG) < 32 &&
        Math.abs(data[index + 2] - startB) < 32
      )
    }

    const queue = [[startX, startY]]
    const visited = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT)
    visited[startY * CANVAS_WIDTH + startX] = 1

    while (queue.length > 0) {
      const [curX, curY] = queue.pop()
      const curIdx = (curY * CANVAS_WIDTH + curX) * 4

      const colorVal = getPatternColor(curX, curY)
      data[curIdx] = colorVal.r
      data[curIdx + 1] = colorVal.g
      data[curIdx + 2] = colorVal.b
      data[curIdx + 3] = 255

      const neighbors = [
        [curX + 1, curY],
        [curX - 1, curY],
        [curX, curY + 1],
        [curX, curY - 1],
      ]

      for (let i = 0; i < neighbors.length; i++) {
        const [nx, ny] = neighbors[i]
        if (nx >= 0 && nx < CANVAS_WIDTH && ny >= 0 && ny < CANVAS_HEIGHT) {
          const nCoord = ny * CANVAS_WIDTH + nx
          if (!visited[nCoord]) {
            visited[nCoord] = 1
            if (matchesStartColor(nCoord * 4)) {
              queue.push([nx, ny])
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0)
    saveHistorySnapshot()
    soundService.playClick()
  }

  // Spray effect
  const sprayPoints = (x, y, ctx) => {
    const radius = 12
    const density = 14
    applyPatternFill(ctx)

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * radius
      const px = Math.floor(x + Math.cos(angle) * r)
      const py = Math.floor(y + Math.sin(angle) * r)
      if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
        ctx.fillRect(px, py, 1, 1)
      }
    }
  }

  const handleMouseDown = (e) => {
    const pos = getPointerPos(e)
    const ctx = getCanvasContext()
    if (!ctx) return

    if (activeTool === 'bucket') {
      performFloodFill(pos.x, pos.y)
      return
    }

    if (activeTool === 'text') {
      setTextPrompt({ x: pos.x, y: pos.y, text: '' })
      return
    }

    isDrawingRef.current = true
    startPosRef.current = pos
    snapshotRef.current = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.lineWidth = lineWidth
    ctx.lineCap = activeTool === 'pencil' ? 'butt' : 'round'
    ctx.lineJoin = 'round'

    if (activeTool === 'pencil') {
      ctx.strokeStyle = activeColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === 'brush') {
      applyPatternFill(ctx)
      ctx.strokeStyle = ctx.fillStyle
      ctx.lineWidth = lineWidth * 2
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === 'eraser') {
      const eraserSize = lineWidth * 5 + 6
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(pos.x - eraserSize / 2, pos.y - eraserSize / 2, eraserSize, eraserSize)
    } else if (activeTool === 'spray') {
      sprayPoints(pos.x, pos.y, ctx)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return
    const pos = getPointerPos(e)
    const ctx = getCanvasContext()
    if (!ctx) return

    if (activeTool === 'pencil') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === 'brush') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === 'eraser') {
      const eraserSize = lineWidth * 5 + 6
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(pos.x - eraserSize / 2, pos.y - eraserSize / 2, eraserSize, eraserSize)
    } else if (activeTool === 'spray') {
      sprayPoints(pos.x, pos.y, ctx)
    } else if (['line', 'rect', 'rect-fill', 'circle', 'circle-fill'].includes(activeTool)) {
      // Pulihkan snapshot sebelum menggambar preview bentuk
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0)
      }

      ctx.lineWidth = lineWidth
      ctx.strokeStyle = activeColor
      applyPatternFill(ctx)

      const start = startPosRef.current
      const width = pos.x - start.x
      const height = pos.y - start.y

      if (activeTool === 'line') {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (activeTool === 'rect') {
        ctx.strokeRect(start.x, start.y, width, height)
      } else if (activeTool === 'rect-fill') {
        ctx.fillRect(start.x, start.y, width, height)
        ctx.strokeRect(start.x, start.y, width, height)
      } else if (activeTool === 'circle') {
        ctx.beginPath()
        ctx.ellipse(
          start.x + width / 2,
          start.y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      } else if (activeTool === 'circle-fill') {
        ctx.beginPath()
        ctx.ellipse(
          start.x + width / 2,
          start.y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        )
        ctx.fill()
        ctx.stroke()
      }
    }
  }

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const ctx = getCanvasContext()
    if (ctx) {
      ctx.beginPath()
    }
    saveHistorySnapshot()
  }

  const handleApplyText = (text) => {
    if (!textPrompt || !text.trim()) {
      setTextPrompt(null)
      return
    }

    const ctx = getCanvasContext()
    if (ctx) {
      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = activeColor
      ctx.fillText(text, textPrompt.x, textPrompt.y)
      saveHistorySnapshot()
      soundService.playClick()
    }
    setTextPrompt(null)
  }

  const saveToVFS = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const fileName = `paint_${Date.now().toString().slice(-6)}.png`
    const path = `/home/arif/${fileName}`

    const result = fileSystemService.writeFile(path, dataUrl)
    if (result.success) {
      soundService.playClick()
      setStatusMessage(`Tersimpan di: ${path}`)
    } else {
      soundService.playErrorAlert()
      setStatusMessage(`Gagal menyimpan: ${result.error}`)
    }
  }, [])

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `payaman_paint_${Date.now().toString().slice(-6)}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    soundService.playClick()
    setStatusMessage('Gambar berhasil diunduh.')
  }, [])

  return {
    canvasRef,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    activeTool,
    activePatternId,
    activeColor,
    lineWidth,
    statusMessage,
    canUndo,
    canRedo,
    textPrompt,
    patterns: PATTERN_DEFINITIONS,
    colors: RETRO_COLOR_PALETTE,
    setActiveTool,
    setActivePatternId,
    setActiveColor,
    setLineWidth,
    setTextPrompt,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleApplyText,
    undo,
    redo,
    clearCanvas,
    invertCanvas,
    saveToVFS,
    downloadImage,
  }
}
