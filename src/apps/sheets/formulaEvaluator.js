export function colIndexToLabel(index) {
  let label = ''
  let num = index
  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label
    num = Math.floor(num / 26) - 1
  }
  return label
}

export function labelToColIndex(label) {
  const clean = label.toUpperCase().trim()
  let index = 0
  for (let i = 0; i < clean.length; i += 1) {
    index = index * 26 + (clean.charCodeAt(i) - 64)
  }
  return index - 1
}

export function cellIdToCoords(cellId) {
  const match = cellId.toUpperCase().match(/^([A-Z]+)([0-9]+)$/)
  if (!match) return null
  const col = labelToColIndex(match[1])
  const row = parseInt(match[2], 10) - 1
  return { col, row }
}

export function coordsToCellId(col, row) {
  return `${colIndexToLabel(col)}${row + 1}`
}

export function parseRange(rangeStr) {
  const parts = rangeStr.split(':')
  if (parts.length === 1) {
    return [parts[0].trim().toUpperCase()]
  }
  const start = cellIdToCoords(parts[0].trim())
  const end = cellIdToCoords(parts[1].trim())
  if (!start || !end) return []

  const minCol = Math.min(start.col, end.col)
  const maxCol = Math.max(start.col, end.col)
  const minRow = Math.min(start.row, end.row)
  const maxRow = Math.max(start.row, end.row)

  const cells = []
  for (let r = minRow; r <= maxRow; r += 1) {
    for (let c = minCol; c <= maxCol; c += 1) {
      cells.push(coordsToCellId(c, r))
    }
  }
  return cells
}

function getCellValueNumber(cellId, data, visited) {
  if (visited.has(cellId)) return 0
  const raw = data[cellId]
  if (raw === undefined || raw === null || raw === '') return 0
  if (typeof raw === 'number') return raw

  const str = String(raw).trim()
  if (str.startsWith('=')) {
    const evaluated = evaluateFormula(str, data, new Set(visited).add(cellId))
    const num = parseFloat(evaluated)
    return isNaN(num) ? 0 : num
  }
  const cleanNum = str.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleanNum)
  return isNaN(parsed) ? 0 : parsed
}

export function evaluateFormula(formulaStr, data, visited = new Set()) {
  if (!formulaStr || !formulaStr.startsWith('=')) {
    return formulaStr
  }

  const expr = formulaStr.substring(1).trim()
  const upperExpr = expr.toUpperCase()

  // Match Functions: SUM, AVERAGE, AVG, COUNT, MIN, MAX, PRODUCT
  const funcMatch = upperExpr.match(/^([A-Z]+)\(([^)]+)\)$/)
  if (funcMatch) {
    const funcName = funcMatch[1]
    const argsStr = funcMatch[2]
    const argList = argsStr.split(',').map((s) => s.trim())

    const numbers = []
    argList.forEach((arg) => {
      if (arg.includes(':')) {
        const rangeCells = parseRange(arg)
        rangeCells.forEach((cId) => {
          numbers.push(getCellValueNumber(cId, data, visited))
        })
      } else if (/^[A-Z]+[0-9]+$/.test(arg)) {
        numbers.push(getCellValueNumber(arg, data, visited))
      } else {
        const val = parseFloat(arg)
        if (!isNaN(val)) numbers.push(val)
      }
    })

    if (numbers.length === 0) return 0

    switch (funcName) {
      case 'SUM':
        return numbers.reduce((a, b) => a + b, 0)
      case 'AVERAGE':
      case 'AVG':
        return numbers.reduce((a, b) => a + b, 0) / numbers.length
      case 'COUNT':
        return numbers.length
      case 'MIN':
        return Math.min(...numbers)
      case 'MAX':
        return Math.max(...numbers)
      case 'PRODUCT':
        return numbers.reduce((a, b) => a * b, 1)
      default:
        break
    }
  }

  // Basic cell reference substitution and arithmetic calculation
  try {
    let mathExpr = upperExpr.replace(/([A-Z]+[0-9]+)/g, (match) => {
      return getCellValueNumber(match, data, visited)
    })

    // Sanitize arithmetic expression (only allow numbers, basic operators, parens, decimal)
    if (!/^[0-9+\-*/().\s]+$/.test(mathExpr)) {
      return '#VALUE!'
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${mathExpr})`)()
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 10000) / 10000
    }
    return result ?? '#ERROR!'
  } catch {
    return '#ERROR!'
  }
}
