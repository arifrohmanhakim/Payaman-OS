import { useState, useEffect, useCallback, useRef } from 'react'
import { PET_SPECIES } from './petData.js'
import { soundService } from '../../services/soundService.js'
import { storageService } from '../../services/storageService.js'

let petGlobalListeners = new Set()

let globalPetState = {
  petId: storageService.getItem('os_pet_id', 'cat'),
  isVisible: storageService.getItem('os_pet_visible', true),
  autoWander: storageService.getItem('os_pet_autowander', true),
  soundEffects: storageService.getItem('os_pet_sound', true),
  hunger: 85,
  happiness: 95,
  energy: 90,
  actionState: 'idle', // 'idle' | 'walking' | 'sleeping' | 'playing' | 'eating'
  speechText: 'Hello from Payaman OS! ❤️',
  speechTimestamp: Date.now(),
}

const notifyPetListeners = () => {
  petGlobalListeners.forEach((listener) => {
    try {
      listener({ ...globalPetState })
    } catch {
      // safe ignore
    }
  })
}

export function useDesktopPet() {
  const [petState, setPetState] = useState({ ...globalPetState })
  const speechTimerRef = useRef(null)

  useEffect(() => {
    const handleUpdate = (nextState) => setPetState(nextState)
    petGlobalListeners.add(handleUpdate)
    return () => {
      petGlobalListeners.delete(handleUpdate)
    }
  }, [])

  const currentSpecies =
    PET_SPECIES.find((p) => p.id === petState.petId) || PET_SPECIES[0]

  const showSpeech = useCallback((text, duration = 3500) => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    globalPetState.speechText = text
    globalPetState.speechTimestamp = Date.now()
    notifyPetListeners()

    speechTimerRef.current = setTimeout(() => {
      globalPetState.speechText = ''
      notifyPetListeners()
    }, duration)
  }, [])

  const playPetSound = useCallback(() => {
    if (!globalPetState.soundEffects) return
    const pitch = currentSpecies.soundPitch || 800
    soundService.playBeep(pitch, 0.08)
    setTimeout(() => {
      soundService.playBeep(pitch * 1.25, 0.06)
    }, 90)
  }, [currentSpecies])

  const setPetId = useCallback(
    (newPetId) => {
      globalPetState.petId = newPetId
      storageService.setItem('os_pet_id', newPetId)
      const newSpecies = PET_SPECIES.find((p) => p.id === newPetId)
      const randomPhrase =
        newSpecies?.phrases[Math.floor(Math.random() * (newSpecies?.phrases.length || 1))] ||
        'Hello!'
      globalPetState.actionState = 'playing'
      showSpeech(`${newSpecies?.name || 'Pet'}: ${randomPhrase}`)
      notifyPetListeners()
      playPetSound()

      setTimeout(() => {
        globalPetState.actionState = 'idle'
        notifyPetListeners()
      }, 1500)
    },
    [showSpeech, playPetSound]
  )

  const toggleVisibility = useCallback(
    (forceState) => {
      const nextVisible =
        typeof forceState === 'boolean' ? forceState : !globalPetState.isVisible
      globalPetState.isVisible = nextVisible
      storageService.setItem('os_pet_visible', nextVisible)
      soundService.playClick()
      notifyPetListeners()
    },
    []
  )

  const toggleAutoWander = useCallback(() => {
    const nextVal = !globalPetState.autoWander
    globalPetState.autoWander = nextVal
    storageService.setItem('os_pet_autowander', nextVal)
    soundService.playClick()
    notifyPetListeners()
  }, [])

  const toggleSoundEffects = useCallback(() => {
    const nextVal = !globalPetState.soundEffects
    globalPetState.soundEffects = nextVal
    storageService.setItem('os_pet_sound', nextVal)
    soundService.playClick()
    notifyPetListeners()
  }, [])

  const feedPet = useCallback(
    (treat) => {
      globalPetState.hunger = Math.min(100, globalPetState.hunger + (treat?.nutrition || 25))
      globalPetState.happiness = Math.min(100, globalPetState.happiness + (treat?.happiness || 15))
      globalPetState.actionState = 'eating'
      showSpeech(`*Nom nom* Loved the ${treat?.name || 'treat'}! 😋`)
      notifyPetListeners()
      playPetSound()

      setTimeout(() => {
        globalPetState.actionState = 'idle'
        notifyPetListeners()
      }, 2000)
    },
    [showSpeech, playPetSound]
  )

  const playWithPet = useCallback(
    (toy) => {
      if (globalPetState.energy < 15) {
        showSpeech("Too sleepy to play right now... 💤")
        return
      }
      globalPetState.happiness = Math.min(100, globalPetState.happiness + (toy?.fun || 30))
      globalPetState.energy = Math.max(10, globalPetState.energy - (toy?.energyCost || 15))
      globalPetState.actionState = 'playing'
      showSpeech(`Yay! Playing with ${toy?.name || 'a toy'}! ✨`)
      notifyPetListeners()
      playPetSound()

      setTimeout(() => {
        globalPetState.actionState = 'idle'
        notifyPetListeners()
      }, 2200)
    },
    [showSpeech, playPetSound]
  )

  const toggleSleep = useCallback(() => {
    const isSleeping = globalPetState.actionState === 'sleeping'
    if (isSleeping) {
      globalPetState.actionState = 'idle'
      globalPetState.energy = Math.min(100, globalPetState.energy + 40)
      showSpeech("Good morning! Feeling energized! ☀️")
      playPetSound()
    } else {
      globalPetState.actionState = 'sleeping'
      showSpeech("Taking a sweet nap... Zzz 💤")
    }
    notifyPetListeners()
  }, [showSpeech, playPetSound])

  const patPet = useCallback(() => {
    globalPetState.happiness = Math.min(100, globalPetState.happiness + 8)
    globalPetState.actionState = 'playing'
    const phrases = currentSpecies.phrases || ['❤️', 'Purr~']
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    showSpeech(`❤️ ${phrase}`)
    playPetSound()
    notifyPetListeners()

    setTimeout(() => {
      if (globalPetState.actionState === 'playing') {
        globalPetState.actionState = 'idle'
        notifyPetListeners()
      }
    }, 1500)
  }, [currentSpecies, showSpeech, playPetSound])

  const setPetAction = useCallback((action) => {
    globalPetState.actionState = action
    notifyPetListeners()
  }, [])

  return {
    petState,
    currentSpecies,
    setPetId,
    toggleVisibility,
    toggleAutoWander,
    toggleSoundEffects,
    feedPet,
    playWithPet,
    toggleSleep,
    patPet,
    showSpeech,
    setPetAction,
  }
}
