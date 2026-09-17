import { useState, useEffect, useCallback, useMemo } from 'react'
import { soundService } from '../../services/soundService.js'
import { storageService } from '../../services/storageService.js'

const DIFFICULTY = {
  easy: { rows: 9, cols: 9, mines: 10, label: '9x9' },
  medium: { rows: 12, cols: 12, mines: 20, label: '12x12' },
}

function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  )
}

function populateMines(board, rows, cols, totalMines, safeRow, safeCol) {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  let placed = 0

  while (placed < totalMines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)

    // Ensure safe area around first clicked cell
    const isSafe = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1

    if (!newBoard[r][c].isMine && !isSafe) {
      newBoard[r][c].isMine = true
      placed += 1
    }
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (newBoard[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count += 1
          }
        }
      }
      newBoard[r][c].adjacentMines = count
    }
  }

  return newBoard
}

export default function MinesweeperApp() {
  const [level, setLevel] = useState('easy')
  const [flagMode, setFlagMode] = useState(false)
  const [gameStatus, setGameStatus] = useState('idle') // 'idle' | 'playing' | 'won' | 'lost'
  const [timer, setTimer] = useState(0)
  const [bestTime, setBestTime] = useState(() => storageService.getItem('minesweeper_best_easy', null))

  const { rows, cols, mines } = DIFFICULTY[level]
  const [board, setBoard] = useState(() => createEmptyBoard(rows, cols))

  const resetGame = useCallback(
    (newLevel = level) => {
      const cfg = DIFFICULTY[newLevel]
      setBoard(createEmptyBoard(cfg.rows, cfg.cols))
      setGameStatus('idle')
      setTimer(0)
      setBestTime(storageService.getItem(`minesweeper_best_${newLevel}`, null))
      soundService.playClick()
    },
    [level]
  )

  useEffect(() => {
    let interval = null
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimer((t) => Math.min(999, t + 1))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStatus])

  const flaggedCount = useMemo(() => {
    let count = 0
    board.forEach((r) => r.forEach((c) => {
      if (c.isFlagged) count += 1
    }))
    return count
  }, [board])

  const remainingMines = Math.max(0, mines - flaggedCount)

  const revealCell = useCallback(
    (r, c) => {
      if (gameStatus === 'won' || gameStatus === 'lost') return

      let currentBoard = board
      if (gameStatus === 'idle') {
        currentBoard = populateMines(board, rows, cols, mines, r, c)
        setGameStatus('playing')
      }

      const cell = currentBoard[r][c]
      if (cell.isRevealed || cell.isFlagged) return

      if (cell.isMine) {
        // Hit a mine - Game Over
        const revealed = currentBoard.map((row) =>
          row.map((cl) => (cl.isMine ? { ...cl, isRevealed: true } : cl))
        )
        setBoard(revealed)
        setGameStatus('lost')
        soundService.playErrorAlert()
        return
      }

      // Flood fill empty areas
      const newBoard = currentBoard.map((row) => row.map((cl) => ({ ...cl })))
      const queue = [[r, c]]
      newBoard[r][c].isRevealed = true

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()
        if (newBoard[cr][cc].adjacentMines === 0) {
          for (let dr = -1; dr <= 1; dr += 1) {
            for (let dc = -1; dc <= 1; dc += 1) {
              const nr = cr + dr
              const nc = cc + dc
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                !newBoard[nr][nc].isRevealed &&
                !newBoard[nr][nc].isFlagged &&
                !newBoard[nr][nc].isMine
              ) {
                newBoard[nr][nc].isRevealed = true
                queue.push([nr, nc])
              }
            }
          }
        }
      }

      // Check win condition
      let unrevealedSafeCount = 0
      for (let ro = 0; ro < rows; ro += 1) {
        for (let co = 0; co < cols; co += 1) {
          if (!newBoard[ro][co].isMine && !newBoard[ro][co].isRevealed) {
            unrevealedSafeCount += 1
          }
        }
      }

      setBoard(newBoard)
      soundService.playClick()

      if (unrevealedSafeCount === 0) {
        setGameStatus('won')
        soundService.playBeep(880, 0.2)
        const currentBest = storageService.getItem(`minesweeper_best_${level}`, null)
        if (!currentBest || timer < currentBest) {
          storageService.setItem(`minesweeper_best_${level}`, timer)
          setBestTime(timer)
        }
      }
    },
    [board, gameStatus, rows, cols, mines, level, timer]
  )

  const toggleFlag = useCallback(
    (e, r, c) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (gameStatus === 'won' || gameStatus === 'lost' || board[r][c].isRevealed) return

      soundService.playClick()
      setBoard((prev) => {
        const copy = prev.map((row) => row.map((cl) => ({ ...cl })))
        copy[r][c].isFlagged = !copy[r][c].isFlagged
        return copy
      })
    },
    [board, gameStatus]
  )

  const handleCellClick = (r, c) => {
    if (flagMode) {
      toggleFlag(null, r, c)
    } else {
      revealCell(r, c)
    }
  }

  const faceIcon = useMemo(() => {
    if (gameStatus === 'won') return '😎'
    if (gameStatus === 'lost') return '😵'
    return '🙂'
  }, [gameStatus])

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] p-2 font-mono select-none overflow-hidden justify-between">
      {/* Top Controls: Level selector & Flag toggle */}
      <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5 text-xs">
        <div className="flex gap-1">
          {Object.keys(DIFFICULTY).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setLevel(lvl)
                resetGame(lvl)
              }}
              className={`px-1.5 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer ${
                level === lvl
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                  : 'bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10'
              }`}
            >
              {DIFFICULTY[lvl].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFlagMode((f) => !f)}
          className={`px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer flex items-center gap-1 ${
            flagMode
              ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
              : 'bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10'
          }`}
        >
          <span>🚩 Flag:</span>
          <span>{flagMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Retro Status Header (Mines Counter - Face Reset - Timer) */}
      <div className="flex items-center justify-between bg-[var(--os-fg)]/5 border-2 border-[var(--os-border)] p-1.5 my-1.5">
        <div className="bg-[var(--os-bg)] border border-[var(--os-border)] px-2 py-0.5 text-sm font-black tracking-widest text-center min-w-12">
          {String(remainingMines).padStart(3, '0')}
        </div>

        <button
          type="button"
          onClick={() => resetGame(level)}
          className="text-base px-2 py-0.5 border-2 border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer active:translate-y-0.5 transition-all"
        >
          {faceIcon}
        </button>

        <div className="bg-[var(--os-bg)] border border-[var(--os-border)] px-2 py-0.5 text-sm font-black tracking-widest text-center min-w-12">
          {String(timer).padStart(3, '0')}
        </div>
      </div>

      {/* Minesweeper Grid Board */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
        <div
          className="border-2 border-[var(--os-border)] bg-[var(--os-border)] shadow-inner"
          style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${cols}, ${level === 'easy' ? '28px' : '23px'})`,
            gridTemplateRows: `repeat(${rows}, ${level === 'easy' ? '28px' : '23px'})`,
            gap: '1px',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isRevealed = cell.isRevealed

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  className={`w-full h-full flex items-center justify-center font-bold font-mono transition-none cursor-pointer ${
                    level === 'easy' ? 'text-xs' : 'text-[11px]'
                  } ${
                    isRevealed
                      ? cell.isMine
                        ? 'bg-red-500 text-white font-black'
                        : 'bg-[var(--os-bg)] text-[var(--os-fg)]'
                      : 'bg-[var(--os-fg)]/15 hover:bg-[var(--os-fg)]/25 border border-t-[var(--os-bg)] border-l-[var(--os-bg)] border-b-[var(--os-fg)]/50 border-r-[var(--os-fg)]/50 active:border-none'
                  }`}
                >
                  {isRevealed ? (
                    cell.isMine ? (
                      '💣'
                    ) : cell.adjacentMines > 0 ? (
                      <span>{cell.adjacentMines}</span>
                    ) : null
                  ) : cell.isFlagged ? (
                    '🚩'
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] opacity-65 border-t border-[var(--os-border)]/30 pt-1">
        <span>Right-click or Flag mode to mark 🚩</span>
        <span>Best: {bestTime !== null ? `${bestTime}s` : '--'}</span>
      </div>
    </div>
  )
}
