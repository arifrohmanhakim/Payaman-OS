class SoundService {
  constructor() {
    this.audioContext = null
    this.soundEnabled = true
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled
  }

  getSoundEnabled() {
    return this.soundEnabled
  }

  initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.audioContext = new AudioCtx()
      }
    }
  }

  playBeep(frequency = 750, duration = 0.08) {
    if (!this.soundEnabled) return

    try {
      this.initAudioContext()
      if (!this.audioContext) return

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      )

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch {
      // Menangani browser tanpa dukungan audio secara aman
    }
  }

  playErrorAlert() {
    this.playBeep(320, 0.15)
  }

  playClick() {
    this.playBeep(1200, 0.02)
  }
}

export const soundService = new SoundService()
