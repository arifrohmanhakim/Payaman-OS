import { useState, useEffect, useRef, useCallback } from 'react'
import { soundService } from '../../services/soundService.js'
import { fileSystemService } from '../../services/fileSystemService.js'
import { processCanvasImage, PHOTO_FILTERS } from './filters.js'

export function usePhotobot() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const hasMediaDevices =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)

  const [cameraState, setCameraState] = useState(() =>
    hasMediaDevices ? 'idle' : 'error'
  )
  const [errorMessage, setErrorMessage] = useState(() =>
    hasMediaDevices ? '' : 'This browser does not support WebRTC camera access.'
  )
  const [currentFilter, setCurrentFilter] = useState('normal')
  const [countdown, setCountdown] = useState(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [captures, setCaptures] = useState([])
  const [selectedCapture, setSelectedCapture] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [retryTrigger, setRetryTrigger] = useState(0)

  const startCamera = useCallback(() => {
    setCameraState('idle')
    setErrorMessage('')
    setRetryTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isCancelled = false
    const videoElement = videoRef.current

    if (!navigator.mediaDevices?.getUserMedia) {
      return
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      .then((stream) => {
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoElement) {
          videoElement.srcObject = stream
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch(() => {})
          }
          videoElement.play().catch(() => {})
        }
        setCameraState('streaming')
      })
      .catch((err) => {
        if (isCancelled) return
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('denied')
          setErrorMessage('Camera permission was denied by user or browser.')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraState('not_found')
          setErrorMessage('Camera device (webcam) not found.')
        } else {
          setCameraState('error')
          setErrorMessage(err.message || 'Failed to start camera stream.')
        }
      })

    return () => {
      isCancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [retryTrigger])

  useEffect(() => {
    if (cameraState === 'streaming' && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(() => {})
      }
    }
  }, [cameraState])

  const takeSnapshotNow = useCallback(() => {
    if (!videoRef.current || cameraState !== 'streaming') return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Gambar frame dari video (mirror horizontal agar terasa alami seperti cermin webcam)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    // Terapkan filter retro
    processCanvasImage(canvas, currentFilter)

    const dataUrl = canvas.toDataURL('image/png')
    const timestamp = new Date().toISOString()
    const id = 'photo_' + Date.now()

    const newCapture = {
      id,
      dataUrl,
      timestamp,
      filter: currentFilter,
    }

    setCaptures((prev) => [newCapture, ...prev])
    setSelectedCapture(newCapture)
    setStatusMessage('Photo captured successfully!')

    // Efek flash putih & suara shutter
    setIsFlashing(true)
    soundService.playClick()
    setTimeout(() => setIsFlashing(false), 150)
  }, [cameraState, currentFilter])

  const triggerCountdownAndSnap = useCallback(() => {
    if (countdown !== null || cameraState !== 'streaming') return

    soundService.playClick()
    setCountdown(3)

    let count = 3
    const timer = setInterval(() => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
        soundService.playBeep(660, 0.08)
      } else {
        clearInterval(timer)
        setCountdown(null)
        takeSnapshotNow()
      }
    }, 1000)
  }, [countdown, cameraState, takeSnapshotNow])

  const downloadPhoto = useCallback((photo) => {
    if (!photo?.dataUrl) return
    soundService.playClick()
    const link = document.createElement('a')
    link.download = `${photo.id}.png`
    link.href = photo.dataUrl
    link.click()
  }, [])

  const saveToVFS = useCallback((photo) => {
    if (!photo?.dataUrl) return
    soundService.playClick()
    const fileName = `${photo.id}.txt`
    const fileContent = `PAYAMAN OS PHOTO CAPTURE\nID: ${photo.id}\nTanggal: ${new Date(
      photo.timestamp
    ).toLocaleString('id-ID')}\nFilter: ${photo.filter}\nData: ${photo.dataUrl}`

    const res = fileSystemService.writeFile(`/home/arif/${fileName}`, fileContent, false)
    if (res.success) {
      setStatusMessage(`Saved to VFS: /home/arif/${fileName}`)
    } else {
      setStatusMessage(res.error)
      soundService.playErrorAlert()
    }
  }, [])

  const deleteCapture = useCallback(
    (photoId) => {
      soundService.playClick()
      setCaptures((prev) => prev.filter((p) => p.id !== photoId))
      if (selectedCapture?.id === photoId) {
        setSelectedCapture(null)
      }
    },
    [selectedCapture]
  )

  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('photobot:')) return

      if (action === 'photobot:snap') {
        triggerCountdownAndSnap()
      } else if (action === 'photobot:reload') {
        startCamera()
      } else if (action.startsWith('photobot:filter_')) {
        const filterId = action.replace('photobot:filter_', '')
        setCurrentFilter(filterId)
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [triggerCountdownAndSnap, startCamera])

  return {
    videoRef,
    cameraState,
    errorMessage,
    currentFilter,
    countdown,
    isFlashing,
    captures,
    selectedCapture,
    statusMessage,
    setCurrentFilter,
    startCamera,
    triggerCountdownAndSnap,
    downloadPhoto,
    saveToVFS,
    deleteCapture,
    setSelectedCapture,
    filters: PHOTO_FILTERS,
  }
}
