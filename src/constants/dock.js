export const DOCK_SIZES = [
  { id: 'small', name: 'Kecil', label: '36 px' },
  { id: 'medium', name: 'Sedang', label: '44 px' },
  { id: 'large', name: 'Besar', label: '52 px' },
]

export const DOCK_POSITIONS = [
  { id: 'bottom', name: 'Bawah', description: 'Bawah layar' },
  { id: 'left', name: 'Kiri', description: 'Tepi kiri layar' },
  { id: 'right', name: 'Kanan', description: 'Tepi kanan layar' },
]

export const DEFAULT_DOCK_SETTINGS = {
  size: 'medium',
  position: 'bottom',
  autoHide: false,
  magnification: true,
  showIndicators: true,
  pinnedApps: ['files', 'browser', 'chat', 'maps', 'terminal'],
}
