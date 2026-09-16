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

  playStartupChime() {
    if (!this.soundEnabled) return

    try {
      this.initAudioContext()
      if (!this.audioContext) return

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const now = this.audioContext.currentTime
      const chordFrequencies = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5 chord

      chordFrequencies.forEach((freq) => {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)

        osc.connect(gain)
        gain.connect(this.audioContext.destination)

        osc.start(now)
        osc.stop(now + 1.8)
      })
    } catch {
      // Audio fallback
    }
  }
}

export const soundService = new SoundService()
