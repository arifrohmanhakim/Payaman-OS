export const PHOTO_FILTERS = [
  { id: 'normal', name: 'Warna Asli', cssClass: '' },
  { id: 'monochrome', name: 'Monokrom', cssClass: 'grayscale' },
  { id: 'dither_1bit', name: '1-Bit Retro', cssClass: 'grayscale contrast-150' },
  { id: 'invert', name: 'Negatif Film', cssClass: 'invert' },
  { id: 'scanline', name: 'Tabung CRT', cssClass: 'grayscale contrast-125' },
]

export function processCanvasImage(canvas, filterType) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  if (filterType === 'monochrome') {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      // Tambahkan kontras tajam
      const contrast = 1.2
      const adjusted = (gray - 128) * contrast + 128
      const finalVal = Math.max(0, Math.min(255, adjusted))
      data[i] = finalVal
      data[i + 1] = finalVal
      data[i + 2] = finalVal
    }
    ctx.putImageData(imgData, 0, 0)
  } else if (filterType === 'dither_1bit') {
    // 1-Bit thresholding monokrom murni (hitam atau putih)
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      const binary = gray > 120 ? 255 : 0
      data[i] = binary
      data[i + 1] = binary
      data[i + 2] = binary
    }
    ctx.putImageData(imgData, 0, 0)
  } else if (filterType === 'invert') {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }
    ctx.putImageData(imgData, 0, 0)
  } else if (filterType === 'scanline') {
    // Grayscale + garis horizontal gelap setiap 4 piksel
    for (let y = 0; y < height; y++) {
      const isScanline = y % 3 === 0
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        if (isScanline) {
          gray = Math.max(0, gray - 50)
        }
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }
}
