import { useContext } from 'react'
import { OSContext } from '../context/OSContextInstance.js'

export function useOS() {
  const context = useContext(OSContext)
  if (!context) {
    throw new Error('useOS harus digunakan di dalam OSProvider')
  }
  return context
}
