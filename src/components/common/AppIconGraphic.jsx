export default function AppIconGraphic({ iconType, className = 'w-10 h-10' }) {
  switch (iconType) {
    case 'folder':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M2 7 H12 L15 10 H30 V26 H2 Z" />
          <path d="M2 13 H30" />
        </svg>
      )
    case 'document':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M6 3 H20 L26 9 V29 H6 Z" />
          <path d="M20 3 V9 H26" />
          <line x1="10" y1="14" x2="22" y2="14" />
          <line x1="10" y1="18" x2="22" y2="18" />
          <line x1="10" y1="22" x2="18" y2="22" />
        </svg>
      )
    case 'calculator':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="5" y="3" width="22" height="26" rx="2" />
          <rect x="8" y="6" width="16" height="5" />
          <circle cx="10" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
          <circle cx="22" cy="16" r="1.5" />
          <circle cx="10" cy="21" r="1.5" />
          <circle cx="16" cy="21" r="1.5" />
          <circle cx="22" cy="21" r="1.5" />
          <circle cx="10" cy="25" r="1.5" />
          <circle cx="16" cy="25" r="1.5" />
          <circle cx="22" cy="25" r="1.5" />
        </svg>
      )
    case 'trash':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M8 8 L10 27 H22 L24 8 Z" />
          <line x1="6" y1="8" x2="26" y2="8" />
          <path d="M12 8 V5 H20 V8" />
          <line x1="13" y1="12" x2="13" y2="23" />
          <line x1="16" y1="12" x2="16" y2="23" />
          <line x1="19" y1="12" x2="19" y2="23" />
        </svg>
      )
    case 'terminal':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="26" height="24" rx="2" />
          <path d="M7 11 L12 16 L7 21" />
          <line x1="14" y1="21" x2="22" y2="21" />
        </svg>
      )
    default:
      return (
        <div
          className={`${className} border-2 border-current flex items-center justify-center font-mono font-bold text-xs`}
        >
          OS
        </div>
      )
  }
}
