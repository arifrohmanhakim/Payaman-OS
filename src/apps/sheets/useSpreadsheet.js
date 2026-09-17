import { useState, useCallback, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { soundService } from '../../services/soundService.js'
import {
  coordsToCellId,
  cellIdToCoords,
  evaluateFormula,
  parseRange,
} from './formulaEvaluator.js'

const DEFAULT_COLS = 16
const DEFAULT_ROWS = 40

const SAMPLE_SHEET_DATA = {
  A1: 'ITEM',
  B1: 'QTY',
  C1: 'PRICE',
  D1: 'TOTAL',
  A2: 'Retro Mechanical Keyboard',
  B2: 2,
  C2: 450000,
  D2: '=B2*C2',
  A3: 'CRT Monitor Filter 14"',
  B3: 1,
  C3: 180000,
  D3: '=B3*C3',
  A4: 'Floppy Disk Box (10x)',
  B4: 3,
  C4: 65000,
  D4: '=B4*C4',
  A5: 'Chiptune Sound Card',
  B5: 1,
  C5: 320000,
  D5: '=B5*C5',
  A6: 'GRAND TOTAL',
  D6: '=SUM(D2:D5)',
}

export function useSpreadsheet() {
  const [sheets, setSheets] = useState([
    {
      name: 'Sheet1',
      data: SAMPLE_SHEET_DATA,
      formatting: {
        A1: { bold: true, align: 'left' },
        B1: { bold: true, align: 'right' },
        C1: { bold: true, align: 'right' },
        D1: { bold: true, align: 'right' },
        A6: { bold: true },
        D6: { bold: true, format: 'currency' },
        C2: { format: 'currency' },
        C3: { format: 'currency' },
        C4: { format: 'currency' },
        C5: { format: 'currency' },
        D2: { format: 'currency' },
        D3: { format: 'currency' },
        D4: { format: 'currency' },
        D5: { format: 'currency' },
      },
    },
  ])

  const [activeSheetIndex, setActiveSheetIndex] = useState(0)
  const [selectedCell, setSelectedCell] = useState('A1')
  const [selectionRange, setSelectionRange] = useState({ start: 'A1', end: 'A1' })
  const [isSelecting, setIsSelecting] = useState(false)
  const [fileName, setFileName] = useState('Payaman_Ledger.xlsx')
  const [statusMessage, setStatusMessage] = useState('Ready')

  const currentSheet = useMemo(
    () => sheets[activeSheetIndex] || sheets[0],
    [sheets, activeSheetIndex]
  )
  const currentData = useMemo(() => currentSheet.data || {}, [currentSheet])
  const currentFormatting = useMemo(() => currentSheet.formatting || {}, [currentSheet])

  const fileInputRef = useRef(null)

  // Get raw or computed value
  const getComputedValue = useCallback(
    (cellId) => {
      const raw = currentData[cellId]
      if (raw === undefined || raw === null) return ''
      if (typeof raw === 'string' && raw.startsWith('=')) {
        return evaluateFormula(raw, currentData)
      }
      return raw
    },
    [currentData]
  )

  // Format value for display
  const getFormattedDisplay = useCallback(
    (cellId) => {
      const val = getComputedValue(cellId)
      if (val === '' || val === undefined || val === null) return ''
      if (typeof val === 'string' && val.startsWith('#')) return val // Error codes

      const format = currentFormatting[cellId]?.format
      const num = typeof val === 'number' ? val : parseFloat(val)

      if (!isNaN(num) && format) {
        if (format === 'currency') {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(num)
        }
        if (format === 'percent') {
          return `${Math.round(num * 100)}%`
        }
        if (format === 'decimal') {
          return num.toFixed(2)
        }
      }
      return String(val)
    },
    [getComputedValue, currentFormatting]
  )

  const updateCell = useCallback(
    (cellId, value) => {
      setSheets((prev) => {
        const next = [...prev]
        const sheet = { ...next[activeSheetIndex] }
        const nextData = { ...sheet.data }

        if (value === '' || value === undefined || value === null) {
          delete nextData[cellId]
        } else {
          // Parse numerical input if not formula
          if (typeof value === 'string' && !value.startsWith('=')) {
            const num = Number(value)
            nextData[cellId] = !isNaN(num) && value.trim() !== '' ? num : value
          } else {
            nextData[cellId] = value
          }
        }

        sheet.data = nextData
        next[activeSheetIndex] = sheet
        return next
      })
    },
    [activeSheetIndex]
  )

  const toggleFormat = useCallback(
    (formatType, value) => {
      soundService.playClick()
      const cellsToFormat = parseRange(
        `${selectionRange.start}:${selectionRange.end}`
      )

      setSheets((prev) => {
        const next = [...prev]
        const sheet = { ...next[activeSheetIndex] }
        const nextFormatting = { ...sheet.formatting }

        cellsToFormat.forEach((cId) => {
          const prevCellFmt = nextFormatting[cId] || {}
          if (formatType === 'format') {
            nextFormatting[cId] = {
              ...prevCellFmt,
              format: prevCellFmt.format === value ? null : value,
            }
          } else {
            nextFormatting[cId] = {
              ...prevCellFmt,
              [formatType]:
                value !== undefined ? value : !prevCellFmt[formatType],
            }
          }
        })

        sheet.formatting = nextFormatting
        next[activeSheetIndex] = sheet
        return next
      })
    },
    [activeSheetIndex, selectionRange]
  )

  // Load Real Excel File (.xlsx, .xls, .csv)
  const loadExcelFile = useCallback((file) => {
    if (!file) return
    soundService.playClick()
    setStatusMessage(`Opening ${file.name}...`)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setStatusMessage('Error: No sheets found in workbook')
          return
        }

        const newSheets = workbook.SheetNames.map((sheetName) => {
          const ws = workbook.Sheets[sheetName]
          const sheetData = {}

          // Read all cells from worksheet
          Object.keys(ws).forEach((key) => {
            if (key.startsWith('!')) return
            const cell = ws[key]
            if (cell && cell.v !== undefined) {
              if (cell.f) {
                sheetData[key] = `=${cell.f}`
              } else {
                sheetData[key] = cell.v
              }
            }
          })

          return {
            name: sheetName,
            data: sheetData,
            formatting: {},
          }
        })

        setSheets(newSheets)
        setActiveSheetIndex(0)
        setSelectedCell('A1')
        setSelectionRange({ start: 'A1', end: 'A1' })
        setFileName(file.name)
        setStatusMessage(`Successfully loaded ${file.name}`)
      } catch {
        setStatusMessage('Failed to parse Excel file.')
      }
    }

    reader.onerror = () => {
      setStatusMessage('Error reading file from disk.')
    }

    reader.readAsArrayBuffer(file)
  }, [])

  // Export to Real Excel File (.xlsx)
  const exportToExcel = useCallback(
    (name = fileName) => {
      soundService.playClick()
      try {
        const wb = XLSX.utils.book_new()

        sheets.forEach((sh) => {
          const rows = []
          let maxRow = 1
          let maxCol = 1

          Object.keys(sh.data || {}).forEach((cId) => {
            const coords = cellIdToCoords(cId)
            if (coords) {
              maxCol = Math.max(maxCol, coords.col + 1)
              maxRow = Math.max(maxRow, coords.row + 1)
            }
          })

          for (let r = 0; r < maxRow; r += 1) {
            const rowData = []
            for (let c = 0; c < maxCol; c += 1) {
              const cellId = coordsToCellId(c, r)
              const val = sh.data[cellId]
              rowData.push(val !== undefined ? val : '')
            }
            rows.push(rowData)
          }

          const ws = XLSX.utils.aoa_to_sheet(rows)
          XLSX.utils.book_append_sheet(wb, ws, sh.name || 'Sheet1')
        })

        const finalName = name.endsWith('.xlsx') ? name : `${name}.xlsx`
        XLSX.writeFile(wb, finalName)
        setStatusMessage(`Exported as ${finalName}`)
      } catch {
        setStatusMessage('Export failed.')
      }
    },
    [fileName, sheets]
  )

  // Export to CSV
  const exportToCSV = useCallback(() => {
    soundService.playClick()
    try {
      const rows = []
      let maxRow = 1
      let maxCol = 1

      Object.keys(currentData).forEach((cId) => {
        const coords = cellIdToCoords(cId)
        if (coords) {
          maxCol = Math.max(maxCol, coords.col + 1)
          maxRow = Math.max(maxRow, coords.row + 1)
        }
      })

      for (let r = 0; r < maxRow; r += 1) {
        const rowData = []
        for (let c = 0; c < maxCol; c += 1) {
          const cellId = coordsToCellId(c, r)
          const computed = getComputedValue(cellId)
          rowData.push(computed !== undefined ? computed : '')
        }
        rows.push(rowData)
      }

      const ws = XLSX.utils.aoa_to_sheet(rows)
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName.replace(/\.[^/.]+$/, '')}.csv`
      link.click()
      setStatusMessage('Exported as CSV')
    } catch {
      setStatusMessage('CSV export failed.')
    }
  }, [currentData, getComputedValue, fileName])

  // Add Sheet
  const addSheet = useCallback(() => {
    soundService.playClick()
    const nextNum = sheets.length + 1
    const newSheet = {
      name: `Sheet${nextNum}`,
      data: {},
      formatting: {},
    }
    setSheets((prev) => [...prev, newSheet])
    setActiveSheetIndex(sheets.length)
  }, [sheets.length])

  // Summary statistics for selected range
  const selectionSummary = useMemo(() => {
    const cells = parseRange(`${selectionRange.start}:${selectionRange.end}`)
    const numbers = []
    let filledCount = 0

    cells.forEach((cId) => {
      const val = getComputedValue(cId)
      if (val !== '' && val !== undefined && val !== null) {
        filledCount += 1
        const num = typeof val === 'number' ? val : parseFloat(val)
        if (!isNaN(num)) numbers.push(num)
      }
    })

    const sum = numbers.reduce((a, b) => a + b, 0)
    const avg = numbers.length > 0 ? sum / numbers.length : 0

    return {
      count: filledCount,
      numericCount: numbers.length,
      sum: Math.round(sum * 100) / 100,
      avg: Math.round(avg * 100) / 100,
    }
  }, [selectionRange, getComputedValue])

  return {
    sheets,
    activeSheetIndex,
    setActiveSheetIndex,
    currentSheet,
    currentData,
    currentFormatting,
    selectedCell,
    setSelectedCell,
    selectionRange,
    setSelectionRange,
    isSelecting,
    setIsSelecting,
    fileName,
    setFileName,
    statusMessage,
    fileInputRef,
    totalCols: DEFAULT_COLS,
    totalRows: DEFAULT_ROWS,
    getComputedValue,
    getFormattedDisplay,
    updateCell,
    toggleFormat,
    loadExcelFile,
    exportToExcel,
    exportToCSV,
    addSheet,
    selectionSummary,
  }
}
