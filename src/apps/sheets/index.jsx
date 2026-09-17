import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { soundService } from '../../services/soundService.js'
import { useSpreadsheet } from './useSpreadsheet.js'
import {
  colIndexToLabel,
  coordsToCellId,
  cellIdToCoords,
  parseRange,
} from './formulaEvaluator.js'

export default function PayamanCalcApp() {
  const {
    sheets,
    activeSheetIndex,
    setActiveSheetIndex,
    currentData,
    currentFormatting,
    selectedCell,
    setSelectedCell,
    selectionRange,
    setSelectionRange,
    isSelecting,
    setIsSelecting,
    fileName,
    statusMessage,
    fileInputRef,
    totalCols,
    totalRows,
    getComputedValue,
    getFormattedDisplay,
    updateCell,
    toggleFormat,
    loadExcelFile,
    exportToExcel,
    exportToCSV,
    addSheet,
    selectionSummary,
  } = useSpreadsheet()

  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const cellInputRef = useRef(null)
  const formulaInputRef = useRef(null)

  const rawCellValue = currentData[selectedCell] !== undefined ? String(currentData[selectedCell]) : ''

  // Focus input when inline editing starts
  useEffect(() => {
    if (isEditing && cellInputRef.current) {
      cellInputRef.current.focus()
      cellInputRef.current.select()
    }
  }, [isEditing])

  const handleCellSelect = useCallback((cellId, isRangeExtend = false) => {
    soundService.playClick()
    setSelectedCell(cellId)
    setEditingValue(currentData[cellId] !== undefined ? String(currentData[cellId]) : '')
    setIsEditing(false)
    if (!isRangeExtend) {
      setSelectionRange({ start: cellId, end: cellId })
    } else {
      setSelectionRange((prev) => ({ ...prev, end: cellId }))
    }
  }, [currentData, setSelectedCell, setSelectionRange])

  const handleCellMouseDown = (cellId, e) => {
    if (e.shiftKey) {
      handleCellSelect(cellId, true)
    } else {
      setIsSelecting(true)
      handleCellSelect(cellId, false)
    }
  }

  const handleCellMouseEnter = (cellId) => {
    if (isSelecting) {
      setSelectionRange((prev) => ({ ...prev, end: cellId }))
    }
  }

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false)
  }, [setIsSelecting])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  const startEditing = useCallback((initialChar = '') => {
    setIsEditing(true)
    setEditingValue(initialChar || rawCellValue)
  }, [rawCellValue])

  const commitEditing = useCallback(() => {
    if (isEditing) {
      updateCell(selectedCell, editingValue)
      setIsEditing(false)
    }
  }, [isEditing, selectedCell, editingValue, updateCell])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditingValue(rawCellValue)
  }, [rawCellValue])

  // Keyboard navigation on grid
  const handleKeyDown = (e) => {
    const coords = cellIdToCoords(selectedCell)
    if (!coords) return

    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitEditing()
        const nextRow = Math.min(totalRows - 1, coords.row + 1)
        handleCellSelect(coordsToCellId(coords.col, nextRow))
      } else if (e.key === 'Escape') {
        cancelEditing()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        commitEditing()
        const nextCol = Math.min(totalCols - 1, coords.col + 1)
        handleCellSelect(coordsToCellId(nextCol, coords.row))
      }
      return
    }

    // Normal grid navigation
    let newCol = coords.col
    let newRow = coords.row

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      newRow = Math.max(0, coords.row - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      newRow = Math.min(totalRows - 1, coords.row + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      newCol = Math.max(0, coords.col - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      newCol = Math.min(totalCols - 1, coords.col + 1)
    } else if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault()
      startEditing()
      return
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      const cells = parseRange(`${selectionRange.start}:${selectionRange.end}`)
      cells.forEach((cId) => updateCell(cId, ''))
      setEditingValue('')
      return
    } else if (e.key === 'Tab') {
      e.preventDefault()
      newCol = Math.min(totalCols - 1, coords.col + 1)
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Immediate typing replaces cell content
      startEditing(e.key)
      return
    }

    if (newCol !== coords.col || newRow !== coords.row) {
      handleCellSelect(coordsToCellId(newCol, newRow), e.shiftKey)
    }
  }

  // Check if a cell is inside the active selection rectangle
  const selectedRangeCells = useMemo(() => {
    return new Set(parseRange(`${selectionRange.start}:${selectionRange.end}`))
  }, [selectionRange])

  // Drag & drop file handler
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadExcelFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleInsertFormula = (funcName) => {
    soundService.playClick()
    const coords = cellIdToCoords(selectedCell)
    if (!coords) return
    let formula = `=${funcName}()`
    if (coords.row > 0) {
      const topRange = `${coordsToCellId(coords.col, 0)}:${coordsToCellId(coords.col, coords.row - 1)}`
      formula = `=${funcName}(${topRange})`
    }
    updateCell(selectedCell, formula)
    setEditingValue(formula)
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
      className={`flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none outline-none relative ${
        isDragOver ? 'ring-4 ring-inset ring-amber-500' : ''
      }`}
    >
      {/* Hidden File Input for .xlsx / .xls / .csv */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            loadExcelFile(e.target.files[0])
          }
        }}
      />

      {/* Drag overlay notice */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm pointer-events-none">
          📊 Drop Excel / CSV file here to open in Payaman Calc
        </div>
      )}

      {/* Top Ribbon & Menu Bar */}
      <div className="border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] flex flex-wrap items-center justify-between p-1.5 gap-2 shrink-0">
        {/* Left: File actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Open real Excel file (.xlsx, .xls, .csv)"
            className="px-2 py-1 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 font-bold cursor-pointer os-window-shadow flex items-center gap-1"
          >
            <span>📂</span>
            <span>Open Excel</span>
          </button>

          <button
            type="button"
            onClick={() => exportToExcel()}
            title="Save and download as real Excel (.xlsx)"
            className="px-2 py-1 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 font-bold cursor-pointer os-window-shadow flex items-center gap-1"
          >
            <span>💾</span>
            <span>Save .xlsx</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            title="Export as CSV"
            className="px-2 py-1 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 font-bold cursor-pointer os-window-shadow"
          >
            CSV
          </button>
        </div>

        {/* Center: Formatting Toolbar */}
        <div className="flex items-center gap-1 border-x border-[var(--os-border)]/40 px-2">
          {/* Bold */}
          <button
            type="button"
            onClick={() => toggleFormat('bold')}
            title="Toggle Bold"
            className={`w-6 h-6 border flex items-center justify-center font-bold cursor-pointer ${
              currentFormatting[selectedCell]?.bold
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                : 'border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
            }`}
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => toggleFormat('italic')}
            title="Toggle Italic"
            className={`w-6 h-6 border flex items-center justify-center italic font-serif cursor-pointer ${
              currentFormatting[selectedCell]?.italic
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                : 'border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
            }`}
          >
            I
          </button>

          {/* Number Formats */}
          <button
            type="button"
            onClick={() => toggleFormat('format', 'currency')}
            title="Currency Format (Rp)"
            className={`px-1.5 h-6 border text-[11px] font-bold flex items-center cursor-pointer ${
              currentFormatting[selectedCell]?.format === 'currency'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                : 'border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
            }`}
          >
            Rp
          </button>

          <button
            type="button"
            onClick={() => toggleFormat('format', 'percent')}
            title="Percent Format (%)"
            className={`px-1.5 h-6 border text-[11px] font-bold flex items-center cursor-pointer ${
              currentFormatting[selectedCell]?.format === 'percent'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                : 'border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
            }`}
          >
            %
          </button>

          <button
            type="button"
            onClick={() => toggleFormat('format', 'decimal')}
            title="Decimal Format (.00)"
            className={`px-1.5 h-6 border text-[11px] font-bold flex items-center cursor-pointer ${
              currentFormatting[selectedCell]?.format === 'decimal'
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]'
                : 'border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10'
            }`}
          >
            .00
          </button>
        </div>

        {/* Right: Quick Functions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleInsertFormula('SUM')}
            title="Auto SUM Formula"
            className="px-2 py-1 border border-[var(--os-border)]/60 hover:bg-[var(--os-fg)]/10 font-bold cursor-pointer text-[11px]"
          >
            ∑ SUM
          </button>

          <button
            type="button"
            onClick={() => handleInsertFormula('AVERAGE')}
            title="Auto AVERAGE Formula"
            className="px-2 py-1 border border-[var(--os-border)]/60 hover:bg-[var(--os-fg)]/10 font-bold cursor-pointer text-[11px]"
          >
            x̄ AVG
          </button>
        </div>
      </div>

      {/* Formula Bar (fx) */}
      <div className="flex items-center border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] p-1 gap-1 text-xs shrink-0">
        {/* Cell Address Box */}
        <div className="w-14 text-center py-0.5 font-bold border border-[var(--os-border)] bg-[var(--os-fg)]/5">
          {selectedCell}
        </div>

        {/* Formula Symbol */}
        <span className="font-serif italic font-bold px-1 opacity-70">fx</span>

        {/* Formula Input Box */}
        <input
          ref={formulaInputRef}
          type="text"
          value={editingValue}
          onChange={(e) => {
            setEditingValue(e.target.value)
            updateCell(selectedCell, e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          placeholder="Enter text, number, or formula (e.g. =SUM(A1:A5), =B2*C2)..."
          className="flex-1 px-2 py-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)]/60 focus:outline-none placeholder:text-[var(--os-fg)]/30 font-mono text-xs"
        />
      </div>

      {/* Spreadsheet Grid Viewport */}
      <div className="flex-1 overflow-auto bg-[var(--os-bg)] relative min-h-0">
        <table className="border-collapse text-xs w-full select-none">
          <thead>
            <tr className="sticky top-0 z-20 bg-[var(--os-bg)] shadow-[0_1px_0px_var(--os-border)]">
              {/* Corner Header */}
              <th className="w-10 min-w-10 h-6 border-r border-b border-[var(--os-border)] bg-[var(--os-fg)]/10 text-center font-bold text-[10px] sticky left-0 z-30" />

              {/* Column Headers A, B, C... */}
              {Array.from({ length: totalCols }).map((_, colIdx) => {
                const label = colIndexToLabel(colIdx)
                const isColSelected = selectedCell.startsWith(label)
                return (
                  <th
                    key={label}
                    className={`min-w-28 w-28 h-6 border-r border-b border-[var(--os-border)] font-bold text-center text-[11px] ${
                      isColSelected
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                        : 'bg-[var(--os-fg)]/5 text-[var(--os-fg)]'
                    }`}
                  >
                    {label}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: totalRows }).map((_, rowIdx) => {
              const rowNum = rowIdx + 1
              const isRowSelected = selectedCell.endsWith(String(rowNum))

              return (
                <tr key={rowNum} className="h-6">
                  {/* Row Header (1, 2, 3...) */}
                  <td
                    className={`w-10 min-w-10 text-center border-r border-b border-[var(--os-border)] font-bold text-[10px] sticky left-0 z-10 ${
                      isRowSelected
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                        : 'bg-[var(--os-fg)]/5 text-[var(--os-fg)]'
                    }`}
                  >
                    {rowNum}
                  </td>

                  {/* Data Cells */}
                  {Array.from({ length: totalCols }).map((_, colIdx) => {
                    const cellId = coordsToCellId(colIdx, rowIdx)
                    const isSelected = selectedCell === cellId
                    const isInRange = selectedRangeCells.has(cellId)
                    const fmt = currentFormatting[cellId] || {}
                    const displayValue = getFormattedDisplay(cellId)
                    const isFormula = String(currentData[cellId] || '').startsWith('=')

                    return (
                      <td
                        key={cellId}
                        onMouseDown={(e) => handleCellMouseDown(cellId, e)}
                        onMouseEnter={() => handleCellMouseEnter(cellId)}
                        onDoubleClick={() => startEditing()}
                        className={`border-r border-b border-[var(--os-border)]/40 px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis relative cursor-cell ${
                          isSelected
                            ? 'ring-2 ring-inset ring-[var(--os-fg)] bg-[var(--os-fg)]/15 font-bold z-10'
                            : isInRange
                              ? 'bg-[var(--os-fg)]/10'
                              : 'hover:bg-[var(--os-fg)]/5'
                        } ${fmt.bold ? 'font-bold' : ''} ${fmt.italic ? 'italic' : ''} ${
                          fmt.align === 'center'
                            ? 'text-center'
                            : fmt.align === 'right' || (!fmt.align && typeof getComputedValue(cellId) === 'number')
                              ? 'text-right'
                              : 'text-left'
                        }`}
                      >
                        {isEditing && isSelected ? (
                          <input
                            ref={cellInputRef}
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={commitEditing}
                            className="absolute inset-0 w-full h-full px-1.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-fg)] focus:outline-none font-mono text-xs z-20"
                          />
                        ) : (
                          <span>{displayValue}</span>
                        )}

                        {/* Formula Indicator Marker in corner */}
                        {isFormula && !isSelected && (
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sheet Tabs Bar (Bottom Navigation) */}
      <div className="border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-between px-2 py-1 shrink-0 text-xs">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {sheets.map((sheet, index) => {
            const isActive = activeSheetIndex === index
            return (
              <button
                key={sheet.name + index}
                type="button"
                onClick={() => {
                  soundService.playClick()
                  setActiveSheetIndex(index)
                }}
                className={`px-3 py-1 font-bold border-t border-x border-[var(--os-border)] cursor-pointer text-[11px] ${
                  isActive
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] shadow-[0_-2px_0px_var(--os-border)]'
                    : 'bg-[var(--os-bg)] hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)] opacity-70'
                }`}
              >
                {sheet.name}
              </button>
            )
          })}

          <button
            type="button"
            onClick={addSheet}
            title="Add New Sheet"
            className="px-2 py-0.5 border border-[var(--os-border)]/60 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] font-bold text-xs cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Real-time summary of selected range */}
        <div className="flex items-center gap-3 text-[10px] opacity-75 font-bold">
          <span>File: {fileName}</span>
          {selectionSummary.count > 1 && (
            <>
              <span>Count: {selectionSummary.count}</span>
              {selectionSummary.numericCount > 0 && (
                <>
                  <span>Sum: {selectionSummary.sum}</span>
                  <span>Avg: {selectionSummary.avg}</span>
                </>
              )}
            </>
          )}
          <span className="opacity-50">| {statusMessage}</span>
        </div>
      </div>
    </div>
  )
}
