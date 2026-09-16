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
    case 'calendar':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="4" y="5" width="24" height="23" rx="2" />
          <line x1="4" y1="11" x2="28" y2="11" />
          <line x1="9" y1="2" x2="9" y2="6" />
          <line x1="23" y1="2" x2="23" y2="6" />
          <circle cx="9" cy="16" r="1.2" fill="currentColor" />
          <circle cx="16" cy="16" r="1.2" fill="currentColor" />
          <circle cx="23" cy="16" r="1.2" fill="currentColor" />
          <circle cx="9" cy="22" r="1.2" fill="currentColor" />
          <circle cx="16" cy="22" r="1.2" fill="currentColor" />
          <circle cx="23" cy="22" r="1.2" fill="currentColor" />
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
    case 'browser':
    case 'globe':
    case 'web':
    case 'internet':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="12" />
          <line x1="4" y1="16" x2="28" y2="16" />
          <ellipse cx="16" cy="16" rx="6" ry="12" />
          <path d="M7 10 C10 12, 22 12, 25 10" />
          <path d="M7 22 C10 20, 22 20, 25 22" />
        </svg>
      )
    case 'weather':
    case 'sun':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="3" x2="16" y2="6" />
          <line x1="16" y1="26" x2="16" y2="29" />
          <line x1="3" y1="16" x2="6" y2="16" />
          <line x1="26" y1="16" x2="29" y2="16" />
          <line x1="6.8" y1="6.8" x2="8.9" y2="8.9" />
          <line x1="23.1" y1="23.1" x2="25.2" y2="25.2" />
          <line x1="6.8" y1="25.2" x2="8.9" y2="23.1" />
          <line x1="23.1" y1="8.9" x2="25.2" y2="6.8" />
        </svg>
      )
    case 'moon':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M21 5 C15.5 6 11 10.5 11 16.5 C11 22.5 15.5 27 21 28 C12 28 5 21 5 12 C5 9 6 6.5 7.5 4.5 C7 5.5 7 6.5 7 7.5 C7 14 12 19 18.5 19 C19.5 19 20.5 18.8 21.5 18.5 C20.5 20.5 18.5 22 16 22" />
          <path d="M14 6 C10 8 8 12 8 16 C8 22 12.5 26.5 18.5 26.5 C21.5 26.5 24 25.5 26 23.5 C20 23.5 15 18.5 15 12.5 C15 9.5 16 7 18 5 C16.5 5 15.2 5.3 14 6 Z" />
        </svg>
      )
    case 'cloud':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M9 24 H23 C26.3 24 29 21.3 29 18 C29 14.8 26.5 12.2 23.4 12 C22.6 7.5 18.7 4 14 4 C8.5 4 4 8.5 4 14 C4 14.3 4 14.7 4.1 15 C2.3 16.3 1 18.5 1 21 C1 24.3 3.7 27 7 27" />
          <path d="M8 24 H24 C27 24 29 21.8 29 19 C29 16.2 26.8 14 24 14 C23.8 14 23.5 14 23.2 14.1 C22.2 9.5 18.2 6 13.5 6 C8.3 6 4 10.3 4 15.5 C4 16 4.1 16.6 4.2 17.1 C2.3 18.2 1 20.4 1 23 C1 26.3 3.7 29 7 29 H24" />
        </svg>
      )
    case 'cloud-sun':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M12 6 C14 6 15.8 7.2 16.6 9" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="19" y1="5" x2="17.6" y2="6.4" />
          <line x1="22" y1="12" x2="20" y2="12" />
          <path d="M7 26 H23 C26.3 26 29 23.3 29 20 C29 17 26.7 14.5 23.8 14.1 C22.8 9.5 18.8 6 14 6 C9 6 4.8 10 4.1 15 C2.3 16.2 1 18.4 1 21 C1 23.8 3.2 26 6 26 Z" />
        </svg>
      )
    case 'cloud-rain':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M7 20 H23 C26.3 20 29 17.5 29 14.5 C29 11.8 26.8 9.5 24 9.1 C23 5.5 19.5 3 15 3 C10.5 3 6.8 6.5 6.1 11 C4.3 12 3 14 3 16.2 C3 18.5 4.8 20 7 20 Z" />
          <line x1="9" y1="23" x2="7" y2="28" />
          <line x1="15" y1="23" x2="13" y2="28" />
          <line x1="21" y1="23" x2="19" y2="28" />
        </svg>
      )
    case 'cloud-snow':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M7 20 H23 C26.3 20 29 17.5 29 14.5 C29 11.8 26.8 9.5 24 9.1 C23 5.5 19.5 3 15 3 C10.5 3 6.8 6.5 6.1 11 C4.3 12 3 14 3 16.2 C3 18.5 4.8 20 7 20 Z" />
          <circle cx="8" cy="25" r="1" fill="currentColor" />
          <circle cx="15" cy="25" r="1" fill="currentColor" />
          <circle cx="22" cy="25" r="1" fill="currentColor" />
          <circle cx="11.5" cy="28" r="1" fill="currentColor" />
          <circle cx="18.5" cy="28" r="1" fill="currentColor" />
        </svg>
      )
    case 'cloud-lightning':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M7 19 H23 C26.3 19 29 16.5 29 13.5 C29 10.8 26.8 8.5 24 8.1 C23 4.5 19.5 2 15 2 C10.5 2 6.8 5.5 6.1 10 C4.3 11 3 13 3 15.2 C3 17.5 4.8 19 7 19 Z" />
          <polygon points="14,20 10,26 15,26 13,31 20,23 15,23" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'fog':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M6 14 H24 C26.5 14 28 12.2 28 10 C28 7.8 26 6 23.5 6 C22.5 3.5 19.5 2 16 2 C12 2 8.8 4.5 8.1 8.2 C6.8 9 6 10.2 6 11.8" />
          <line x1="4" y1="18" x2="28" y2="18" />
          <line x1="7" y1="22" x2="25" y2="22" />
          <line x1="5" y1="26" x2="27" y2="26" />
        </svg>
      )
    case 'preferences':
    case 'gear':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="5" />
          <path d="M16 3 V7 M16 25 V29 M3 16 H7 M25 16 H29 M6.8 6.8 L9.6 9.6 M22.4 22.4 L25.2 25.2 M6.8 25.2 L9.6 22.4 M22.4 9.6 L25.2 6.8" />
        </svg>
      )
    case 'about':
    case 'info':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="12" />
          <circle cx="16" cy="11" r="1.5" fill="currentColor" />
          <line x1="16" y1="15" x2="16" y2="22" />
          <line x1="14" y1="15" x2="16" y2="15" />
          <line x1="13" y1="22" x2="19" y2="22" />
        </svg>
      )
    case 'cloud-drive':
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
    case 'map':
    case 'maps':
    case 'location':
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M3 7 L10 4 L22 8 L29 5 V25 L22 28 L10 24 L3 27 Z" />
          <line x1="10" y1="4" x2="10" y2="24" />
          <line x1="22" y1="8" x2="22" y2="28" />
          <circle cx="16" cy="14" r="2" fill="currentColor" />
          <path d="M16 16 L16 19" />
        </svg>
      )
    default:
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="24" height="24" rx="3" />
          <circle cx="16" cy="16" r="4" />
        </svg>
      )
  }
}
