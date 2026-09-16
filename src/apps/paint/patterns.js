// Definisi pola 8x8 monokrom ala MacPaint klasik
export const PATTERN_DEFINITIONS = [
  {
    id: 'black',
    name: 'Hitam Solid',
    data: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
  },
  {
    id: 'gray-75',
    name: 'Abu 75%',
    data: [0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb, 0xee, 0xbb],
  },
  {
    id: 'gray-50',
    name: 'Abu 50% (Halftone)',
    data: [0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55],
  },
  {
    id: 'gray-25',
    name: 'Abu 25%',
    data: [0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22],
  },
  {
    id: 'white',
    name: 'Putih Solid',
    data: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  },
  {
    id: 'diagonal-right',
    name: 'Garis Miring Kanan',
    data: [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01],
  },
  {
    id: 'diagonal-left',
    name: 'Garis Miring Kiri',
    data: [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80],
  },
  {
    id: 'horizontal',
    name: 'Garis Mendatar',
    data: [0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00],
  },
  {
    id: 'vertical',
    name: 'Garis Tegak',
    data: [0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa],
  },
  {
    id: 'crosshatch',
    name: 'Anyaman (Crosshatch)',
    data: [0xff, 0x88, 0x88, 0x88, 0xff, 0x88, 0x88, 0x88],
  },
  {
    id: 'bricks',
    name: 'Batu Bata (Bricks)',
    data: [0xff, 0x20, 0x20, 0xff, 0x02, 0x02, 0xff, 0x20],
  },
  {
    id: 'dots',
    name: 'Titik-titik (Dots)',
    data: [0x00, 0x18, 0x3c, 0x3c, 0x18, 0x00, 0x00, 0x00],
  },
]

export const RETRO_COLOR_PALETTE = [
  { id: 'black', hex: '#000000', name: 'Hitam' },
  { id: 'white', hex: '#ffffff', name: 'Putih' },
  { id: 'dark-gray', hex: '#555555', name: 'Abu-abu Gelap' },
  { id: 'light-gray', hex: '#aaaaaa', name: 'Abu-abu Terang' },
  { id: 'maroon', hex: '#800000', name: 'Merah Marun' },
  { id: 'red', hex: '#e60000', name: 'Merah' },
  { id: 'orange', hex: '#ff7700', name: 'Oranye' },
  { id: 'yellow', hex: '#ffdd00', name: 'Kuning' },
  { id: 'lime', hex: '#88dd00', name: 'Hijau Muda' },
  { id: 'green', hex: '#008800', name: 'Hijau' },
  { id: 'teal', hex: '#008888', name: 'Teal' },
  { id: 'cyan', hex: '#00ccff', name: 'Cyan' },
  { id: 'blue', hex: '#0044cc', name: 'Biru' },
  { id: 'indigo', hex: '#330088', name: 'Indigo' },
  { id: 'purple', hex: '#880088', name: 'Ungu' },
  { id: 'magenta', hex: '#dd00aa', name: 'Magenta' },
  { id: 'pink', hex: '#ff99cc', name: 'Pink' },
  { id: 'brown', hex: '#663300', name: 'Cokelat' },
  { id: 'beige', hex: '#ddccaa', name: 'Krem' },
  { id: 'navy', hex: '#001144', name: 'Biru Tua' },
]

export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '')
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex
  const bigint = parseInt(fullHex, 16) || 0
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const patternCache = new Map()

export function getPatternCanvas(patternDef, fgHex = '#000000', bgHex = '#ffffff') {
  const cacheKey = `${patternDef.id}_${fgHex}_${bgHex}`
  if (patternCache.has(cacheKey)) {
    return patternCache.get(cacheKey)
  }

  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  const imgData = ctx.createImageData(8, 8)

  const fg = hexToRgb(fgHex)
  const bg = hexToRgb(bgHex)

  for (let y = 0; y < 8; y++) {
    const rowByte = patternDef.data[y]
    for (let x = 0; x < 8; x++) {
      const bit = (rowByte >> (7 - x)) & 1
      const index = (y * 8 + x) * 4
      if (bit === 1) {
        imgData.data[index] = fg.r
        imgData.data[index + 1] = fg.g
        imgData.data[index + 2] = fg.b
        imgData.data[index + 3] = 255
      } else {
        imgData.data[index] = bg.r
        imgData.data[index + 1] = bg.g
        imgData.data[index + 2] = bg.b
        imgData.data[index + 3] = 255
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  patternCache.set(cacheKey, canvas)
  return canvas
}
