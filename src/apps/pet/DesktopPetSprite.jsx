import { useState, useEffect, useRef, useCallback } from 'react'
import { PetSpriteGraphics } from './PetSprites.jsx'
import { useDesktopPet } from './useDesktopPet.js'

export default function DesktopPetSprite() {
  const {
    petState,
    currentSpecies,
    patPet,
    setPetAction,
  } = useDesktopPet()

  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? Math.max(60, window.innerWidth - 180) : 320,
    y: typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 150) : 480,
  })
  const [direction, setDirection] = useState('right')
  const [walkStep, setWalkStep] = useState(0)
  const [idleTick, setIdleTick] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Subtle continuous idle breathing & tail wagging tick
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setIdleTick((prev) => (prev + 1) % 100)
    }, 280)
    return () => clearInterval(tickTimer)
  }, [])

  const posRef = useRef(position)

  useEffect(() => {
    posRef.current = position
  }, [position])

  const targetPosRef = useRef(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const idleTimerRef = useRef(null)
  const animFrameRef = useRef(null)

  // Pick a new random destination on desktop
  const pickNewDestination = useCallback(() => {
    if (typeof window === 'undefined') return
    const screenW = window.innerWidth
    const screenH = window.innerHeight

    // Boundaries: leave space for MenuBar at top (30px) and Dock at bottom (70px)
    const minX = 20
    const maxX = screenW - 70
    const minY = 40
    const maxY = screenH - 100

    const currentX = posRef.current.x
    const currentY = posRef.current.y

    // Wander distance between 100px and 350px
    const wanderDist = 120 + Math.random() * 200
    const angle = Math.random() * Math.PI * 2

    let targetX = currentX + Math.cos(angle) * wanderDist
    let targetY = currentY + Math.sin(angle) * (wanderDist * 0.5) // Less vertical movement for natural walking

    targetX = Math.min(Math.max(minX, targetX), maxX)
    targetY = Math.min(Math.max(minY, targetY), maxY)

    targetPosRef.current = { x: targetX, y: targetY }
    setDirection(targetX < currentX ? 'left' : 'right')
    setPetAction('walking')
  }, [setPetAction])

  // Continuous walking animation engine
  useEffect(() => {
    if (
      !petState.isVisible ||
      !petState.autoWander ||
      petState.actionState === 'sleeping' ||
      petState.actionState === 'eating' ||
      isDragging
    ) {
      targetPosRef.current = null
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      return
    }

    let lastStepTime = Date.now()

    const moveStep = () => {
      // If we don't have a destination, wait idle then pick one
      if (!targetPosRef.current) {
        if (!idleTimerRef.current) {
          setPetAction('idle')
          // Idle for 2.5 to 5 seconds before walking again
          const idleDuration = 2500 + Math.random() * 2500
          idleTimerRef.current = setTimeout(() => {
            idleTimerRef.current = null
            pickNewDestination()
          }, idleDuration)
        }
        animFrameRef.current = requestAnimationFrame(moveStep)
        return
      }

      const curr = posRef.current
      const target = targetPosRef.current

      const dx = target.x - curr.x
      const dy = target.y - curr.y
      const dist = Math.hypot(dx, dy)

      // Reached destination
      if (dist < 3) {
        setPosition({ x: target.x, y: target.y })
        targetPosRef.current = null
        setPetAction('idle')
        animFrameRef.current = requestAnimationFrame(moveStep)
        return
      }

      // Move speed: ~1.4px per frame (smooth walking pace)
      const speed = 1.4
      const moveX = (dx / dist) * speed
      const moveY = (dy / dist) * speed

      const nextX = curr.x + moveX
      const nextY = curr.y + moveY

      setPosition({ x: nextX, y: nextY })
      setDirection(dx < 0 ? 'left' : 'right')

      // Alternate walk steps every 140ms
      const now = Date.now()
      if (now - lastStepTime > 140) {
        lastStepTime = now
        setWalkStep((prev) => (prev + 1) % 4)
      }

      animFrameRef.current = requestAnimationFrame(moveStep)
    }

    animFrameRef.current = requestAnimationFrame(moveStep)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [
    petState.isVisible,
    petState.autoWander,
    petState.actionState,
    isDragging,
    pickNewDestination,
    setPetAction,
  ])

  // Drag & drop handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    targetPosRef.current = null
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    dragOffsetRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }
    e.stopPropagation()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 768

    const newX = Math.min(Math.max(10, e.clientX - dragOffsetRef.current.x), screenW - 60)
    const newY = Math.min(Math.max(30, e.clientY - dragOffsetRef.current.y), screenH - 75)

    if (newX < posRef.current.x) setDirection('left')
    else if (newX > posRef.current.x) setDirection('right')

    setPosition({ x: newX, y: newY })
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
    }
  }, [isDragging])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!petState.isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 40,
        userSelect: 'none',
        touchAction: 'none',
      }}
      className="group cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={patPet}
    >
      {/* Speech / Reaction Bubble */}
      {petState.speechText && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 min-w-28 max-w-52 bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] px-2 py-0.5 text-[10px] font-mono font-bold text-center shadow-[1px_1px_0px_var(--os-shadow)] pointer-events-none whitespace-normal z-50 animate-bounce">
          {petState.speechText}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--os-bg)] border-r border-b border-[var(--os-border)] rotate-45" />
        </div>
      )}

      {/* Cute Compact Pet Character Body */}
      <div
        className={`relative p-0.5 transition-transform ${
          isHovered ? 'scale-115' : ''
        }`}
      >
        <PetSpriteGraphics
          species={petState.petId}
          state={petState.actionState}
          direction={direction}
          walkStep={walkStep}
          idleTick={idleTick}
          className="w-12 h-12 text-[var(--os-fg)]"
        />

        {/* Status mini tag on hover */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[var(--os-bg)] text-[var(--os-fg)] text-[8px] font-bold px-1 py-0 border border-[var(--os-border)] opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none whitespace-nowrap">
          {currentSpecies.name}
        </div>
      </div>
    </div>
  )
}
