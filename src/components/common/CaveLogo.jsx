export default function CaveLogo({ className = 'w-4 h-4', title = 'Payaman OS' }) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 bg-current select-none ${className}`}
      style={{
        maskImage: 'url(/logo.png)',
        WebkitMaskImage: 'url(/logo.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        imageRendering: 'pixelated',
        transform: 'translateZ(0)',
      }}
    />
  )
}
