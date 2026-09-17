import { useState, useEffect, useRef, useCallback } from 'react'
import { soundService } from '../../services/soundService.js'
import { storageService } from '../../services/storageService.js'

const GRID_SIZE = 16
const BASE_SPEED_MS = 220
const MIN_SPEED_MS = 100
const SPEED_ACCELERATION = 2

const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
]

function getInitialFood(snake) {
  let position = { x: 12, y: 8 }
  while (snake.some((seg) => seg.x === position.x && seg.y === position.y)) {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  }
  return position
}

function spawnFood(snake) {
  let position
  while (!position) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    const isOccupied = snake.some((seg) => seg.x === candidate.x && seg.y === candidate.y)
    if (!isOccupied) {
      position = candidate
    }
  }
  return position
}

export default function SnakeApp() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(() => getInitialFood(INITIAL_SNAKE))
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => storageService.getItem('snake_high_score', 0))
  const [gameState, setGameState] = useState('idle') // 'idle' | 'playing' | 'game_over' | 'paused'

  const currentDirRef = useRef({ x: 1, y: 0 })
  const nextDirRef = useRef({ x: 1, y: 0 })
  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef(food)
  const scoreRef = useRef(0)

  // Keep refs synchronized
  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  useEffect(() => {
    foodRef.current = food
  }, [food])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const changeDirection = useCallback((newDir) => {
    const cur = currentDirRef.current
    // Prevent 180 degree instant reversal
    if (
      (newDir.x !== 0 && cur.x !== 0 && newDir.x === -cur.x) ||
      (newDir.y !== 0 && cur.y !== 0 && newDir.y === -cur.y)
    ) {
      return
    }
    nextDirRef.current = newDir
  }, [])

  const startGame = useCallback(() => {
    const startSnake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ]
    const startFood = getInitialFood(startSnake)

    currentDirRef.current = { x: 1, y: 0 }
    nextDirRef.current = { x: 1, y: 0 }
    snakeRef.current = startSnake
    foodRef.current = startFood
    scoreRef.current = 0

    setSnake(startSnake)
    setFood(startFood)
    setScore(0)
    setGameState('playing')
    soundService.playClick()
  }, [])

  const handleGameOver = useCallback(() => {
    setGameState('game_over')
    soundService.playErrorAlert()
    const finalScore = scoreRef.current
    setBestScore((prev) => {
      const highest = Math.max(prev, finalScore)
      storageService.setItem('snake_high_score', highest)
      return highest
    })
  }, [])

  // Self-running continuous game tick loop
  useEffect(() => {
    if (gameState !== 'playing') return

    let timeoutId = null

    const tick = () => {
      const dir = nextDirRef.current
      currentDirRef.current = dir

      const currentSnake = snakeRef.current
      const head = currentSnake[0]
      const newHead = {
        x: head.x + dir.x,
        y: head.y + dir.y,
      }

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        handleGameOver()
        return
      }

      // Self collision
      const isSelfHit = currentSnake.some(
        (seg) => seg.x === newHead.x && seg.y === newHead.y
      )
      if (isSelfHit) {
        handleGameOver()
        return
      }

      const nextSnake = [newHead, ...currentSnake]
      const currentFood = foodRef.current

      // Eat food
      if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
        soundService.playBeep(640, 0.04)
        const nextScore = scoreRef.current + 10
        const newFood = spawnFood(nextSnake)

        scoreRef.current = nextScore
        foodRef.current = newFood
        snakeRef.current = nextSnake

        setScore(nextScore)
        setFood(newFood)
        setSnake(nextSnake)
      } else {
        nextSnake.pop()
        snakeRef.current = nextSnake
        setSnake(nextSnake)
      }

      // Schedule next continuous automatic step
      const currentSpeed = Math.max(
        MIN_SPEED_MS,
        BASE_SPEED_MS - scoreRef.current * SPEED_ACCELERATION
      )
      timeoutId = setTimeout(tick, currentSpeed)
    }

    const currentSpeed = Math.max(
      MIN_SPEED_MS,
      BASE_SPEED_MS - scoreRef.current * SPEED_ACCELERATION
    )
    timeoutId = setTimeout(tick, currentSpeed)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [gameState, handleGameOver])

  // Global Keyboard Control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        changeDirection({ x: 0, y: -1 })
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        changeDirection({ x: 0, y: 1 })
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        changeDirection({ x: -1, y: 0 })
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        changeDirection({ x: 1, y: 0 })
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (gameState === 'idle' || gameState === 'game_over') {
          startGame()
        } else if (gameState === 'playing') {
          setGameState('paused')
        } else if (gameState === 'paused') {
          setGameState('playing')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection, gameState, startGame])

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] p-2 font-mono select-none justify-between overflow-hidden">
      {/* Header info */}
      <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5 text-xs">
        <div className="font-bold flex items-center gap-1.5">
          <span>SCORE:</span>
          <span className="bg-[var(--os-fg)] text-[var(--os-bg)] px-1.5 py-0.2 font-black">
            {score}
          </span>
        </div>

        <div className="text-[11px] opacity-70">
          BEST: <span className="font-bold">{bestScore}</span>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 flex items-center justify-center p-1 relative my-1">
        <div
          className="grid bg-[var(--os-fg)]/5 border-2 border-[var(--os-border)] shadow-inner relative"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: '240px',
            height: '240px',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE
            const y = Math.floor(idx / GRID_SIZE)

            const isHead = snake[0].x === x && snake[0].y === y
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y)
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={idx}
                className="w-full h-full border-[0.5px] border-[var(--os-fg)]/5 flex items-center justify-center"
              >
                {isHead && (
                  <div className="w-[85%] h-[85%] bg-[var(--os-fg)] border border-[var(--os-bg)]" />
                )}
                {isBody && (
                  <div className="w-[75%] h-[75%] bg-[var(--os-fg)]/80" />
                )}
                {isFood && (
                  <div className="w-[70%] h-[70%] rounded-full bg-[var(--os-fg)] animate-pulse" />
                )}
              </div>
            )
          })}

          {/* Game Over / Start Overlay */}
          {gameState !== 'playing' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-center p-2 text-white">
              {gameState === 'idle' && (
                <>
                  <div className="text-sm font-black mb-1">SNAKE RETRO</div>
                  <div className="text-[10px] opacity-80 mb-3">Eat dots & grow</div>
                  <button
                    type="button"
                    onClick={startGame}
                    className="px-3 py-1 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                  >
                    START GAME [↵]
                  </button>
                </>
              )}

              {gameState === 'game_over' && (
                <>
                  <div className="text-sm font-black text-red-400 mb-1">GAME OVER</div>
                  <div className="text-xs mb-2">Final Score: {score}</div>
                  <button
                    type="button"
                    onClick={startGame}
                    className="px-3 py-1 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                  >
                    PLAY AGAIN [↵]
                  </button>
                </>
              )}

              {gameState === 'paused' && (
                <>
                  <div className="text-sm font-black mb-2">GAME PAUSED</div>
                  <button
                    type="button"
                    onClick={() => setGameState('playing')}
                    className="px-3 py-1 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                  >
                    RESUME [SPACE]
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* On-screen D-Pad Controls for Trackpad / Touch */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--os-border)]/30">
        <div className="text-[9px] opacity-60">
          Arrows / WASD to turn • Space to pause
        </div>

        <div className="grid grid-cols-3 gap-1 w-24">
          <div />
          <button
            type="button"
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="p-1 text-center font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs cursor-pointer"
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            onClick={() => changeDirection({ x: -1, y: 0 })}
            className="p-1 text-center font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs cursor-pointer"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => changeDirection({ x: 0, y: 1 })}
            className="p-1 text-center font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs cursor-pointer"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => changeDirection({ x: 1, y: 0 })}
            className="p-1 text-center font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}
