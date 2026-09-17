import { useState, useEffect, useRef } from 'react'
import CaveLogo from '../common/CaveLogo.jsx'

function MatrixRainCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const characters = '0123456789PAYAMAN-OS_ABCDEF!@#$%^&*()_+'
    const fontSize = 14
    const columns = Math.floor(width / fontSize)
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50))

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#f0f0f0'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i += 1) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length))
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(text, x, y)

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += 1
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}

function StarfieldCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const numStars = 400
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
    }))

    const speed = 4

    const render = () => {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2

      ctx.fillStyle = 'white'
      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i]
        star.z -= speed
        if (star.z <= 0) {
          star.z = width
          star.x = (Math.random() - 0.5) * width * 2
          star.y = (Math.random() - 0.5) * height * 2
        }

        const k = 250 / star.z
        const px = star.x * k + cx
        const py = star.y * k + cy

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const size = Math.max(1, (1 - star.z / width) * 3)
          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}

function BouncingLogo() {
  const [pos, setPos] = useState({ x: 100, y: 100 })
  const velRef = useRef({ vx: 3, vy: 2.5 })
  const posRef = useRef({ x: 100, y: 100 })

  useEffect(() => {
    let animationId
    const logoW = 160
    const logoH = 80

    const update = () => {
      const maxX = window.innerWidth - logoW
      const maxY = window.innerHeight - logoH

      let { x, y } = posRef.current
      let { vx, vy } = velRef.current

      x += vx
      y += vy

      if (x <= 0) {
        x = 0
        vx = -vx
      } else if (x >= maxX) {
        x = maxX
        vx = -vx
      }

      if (y <= 0) {
        y = 0
        vy = -vy
      } else if (y >= maxY) {
        y = maxY
        vy = -vy
      }

      velRef.current = { vx, vy }
      posRef.current = { x, y }
      setPos({ x, y })

      animationId = requestAnimationFrame(update)
    }

    animationId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
      <div
        className="absolute flex items-center gap-3 p-3 bg-neutral-900 border-2 border-white/80 text-white font-mono select-none"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          width: '160px',
        }}
      >
        <CaveLogo className="w-8 h-8 shrink-0 invert" />
        <div className="leading-none">
          <div className="font-black text-xs">PAYAMAN</div>
          <div className="text-[9px] opacity-70">OS 2026</div>
        </div>
      </div>
    </div>
  )
}

export default function ScreenSaver({ isActive, onDismiss, mode = 'matrix' }) {
  useEffect(() => {
    if (!isActive) return

    const handleActivity = () => {
      onDismiss()
    }

    window.addEventListener('mousemove', handleActivity, { passive: true })
    window.addEventListener('mousedown', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity, { passive: true })
    window.addEventListener('touchstart', handleActivity, { passive: true })
    window.addEventListener('wheel', handleActivity, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      window.removeEventListener('wheel', handleActivity)
    }
  }, [isActive, onDismiss])

  if (!isActive) return null

  return (
    <div
      aria-label="Payaman Screen Saver"
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-black cursor-none select-none overflow-hidden"
    >
      {mode === 'matrix' && <MatrixRainCanvas />}
      {mode === 'starfield' && <StarfieldCanvas />}
      {mode === 'bounce' && <BouncingLogo />}

      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 pointer-events-none tracking-widest uppercase">
        Move mouse or press any key to unlock
      </div>
    </div>
  )
}
