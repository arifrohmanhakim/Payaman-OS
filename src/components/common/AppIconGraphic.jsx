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
    case 'camera':
    case 'photobot':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M4 9 H9 L11 6 H21 L23 9 H28 V26 H4 Z" />
          <circle cx="16" cy="17" r="5" />
          <circle cx="24" cy="12" r="1" />
        </svg>
      )
    case 'gallery':
    case 'image':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="26" height="22" rx="2" />
          <circle cx="10" cy="11" r="2" />
          <path d="M4 22 L11 15 L19 23" />
          <path d="M16 20 L21 15 L28 22" />
        </svg>
      )
    case 'launchpad':
    case 'apps':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="13.5" y="5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="22" y="5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="5" y="13.5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="22" y="13.5" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="5" y="22" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="13.5" y="22" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="22" y="22" width="5" height="5" rx="1" fill="currentColor" />
        </svg>
      )
    case 'paint':
    case 'macpaint':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M16 4 C9 4 4 9 4 16 C4 23 9 28 16 28 C18 28 19 26.5 19 25 C19 24.2 18.7 23.5 18.7 22.7 C18.7 21.2 20 20 21.5 20 H23 C26.8 20 30 16.8 30 13 C30 8 23.7 4 16 4 Z" />
          <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor" />
          <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="20.5" cy="11.5" r="1.5" fill="currentColor" />
          <circle cx="24.5" cy="15.5" r="1.5" fill="currentColor" />
        </svg>
      )
    case 'cloud':
    case 'gdrive':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M9 22 C6 22 4 19.5 4 17 C4 14.5 6 12.5 8.5 12.5 C9 10 11.5 8 14.5 8 C18 8 20.5 10.5 21 13.5 C23 13.5 25 15 25 17.5 C25 20 23 22 20.5 22 Z" />
          <path d="M12 18 L16 14 L20 18" />
          <line x1="16" y1="14" x2="16" y2="24" />
        </svg>
      )
    case 'pdf':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M7 3 H21 L27 9 V29 H7 Z" />
          <path d="M21 3 V9 H27" />
          <text
            x="10"
            y="21"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
          >
            PDF
          </text>
        </svg>
      )
    case 'code':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M6 3 H20 L26 9 V29 H6 Z" />
          <path d="M20 3 V9 H26" />
          <path d="M12 16 L9 19 L12 22" />
          <path d="M20 16 L23 19 L20 22" />
          <line x1="17" y1="15" x2="15" y2="23" />
        </svg>
      )
    case 'media':
    case 'audio':
    case 'video':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="12" />
          <polygon points="13,11 22,16 13,21" fill="currentColor" />
        </svg>
      )
  }
}
