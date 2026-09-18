import CaveLogo from './CaveLogo.jsx'

export default function AppIconGraphic({ iconType, className = 'w-10 h-10' }) {
  const pixelSvgProps = {
    className: `${className} fill-current text-current select-none shrink-0`,
    viewBox: '0 0 16 16',
    shapeRendering: 'crispEdges',
    'aria-hidden': 'true',
  }

  switch (iconType) {
    case 'cave':
    case 'system':
    case 'payaman':
    case 'apple':
      return <CaveLogo className={className} />

    case 'wifi':
      return (
        <svg {...pixelSvgProps}>
          {/* Top arc */}
          <rect x="2" y="3" width="12" height="1" />
          <rect x="1" y="4" width="2" height="1" />
          <rect x="13" y="4" width="2" height="1" />
          {/* Middle arc */}
          <rect x="4" y="6" width="8" height="1" />
          <rect x="3" y="7" width="2" height="1" />
          <rect x="11" y="7" width="2" height="1" />
          {/* Inner arc */}
          <rect x="6" y="9" width="4" height="1" />
          <rect x="5" y="10" width="2" height="1" />
          <rect x="9" y="10" width="2" height="1" />
          {/* Base dot */}
          <rect x="7" y="12" width="2" height="2" />
        </svg>
      )

    case 'bluetooth':
      return (
        <svg {...pixelSvgProps}>
          <rect x="7" y="1" width="2" height="14" />
          {/* Top arrow */}
          <rect x="9" y="2" width="2" height="2" />
          <rect x="11" y="4" width="2" height="2" />
          <rect x="9" y="6" width="2" height="2" />
          <rect x="5" y="4" width="2" height="2" />
          <rect x="3" y="6" width="2" height="2" />
          {/* Bottom arrow */}
          <rect x="9" y="8" width="2" height="2" />
          <rect x="11" y="10" width="2" height="2" />
          <rect x="9" y="12" width="2" height="2" />
          <rect x="5" y="10" width="2" height="2" />
          <rect x="3" y="8" width="2" height="2" />
        </svg>
      )

    case 'sound':
    case 'volume':
    case 'speaker':
      return (
        <svg {...pixelSvgProps}>
          {/* Speaker body */}
          <rect x="2" y="6" width="3" height="4" />
          <rect x="5" y="5" width="2" height="6" />
          <rect x="7" y="4" width="2" height="8" />
          <rect x="9" y="3" width="1" height="10" />
          {/* Sound waves */}
          <rect x="11" y="5" width="1" height="6" />
          <rect x="12" y="4" width="1" height="2" />
          <rect x="12" y="10" width="1" height="2" />
          <rect x="14" y="3" width="1" height="10" />
          <rect x="13" y="2" width="1" height="2" />
          <rect x="13" y="12" width="1" height="2" />
        </svg>
      )

    case 'sound-mute':
    case 'volume-mute':
      return (
        <svg {...pixelSvgProps}>
          {/* Speaker body */}
          <rect x="1" y="6" width="3" height="4" />
          <rect x="4" y="5" width="2" height="6" />
          <rect x="6" y="4" width="2" height="8" />
          <rect x="8" y="3" width="1" height="10" />
          {/* Mute X */}
          <rect x="11" y="6" width="1" height="1" />
          <rect x="15" y="6" width="1" height="1" />
          <rect x="12" y="7" width="1" height="1" />
          <rect x="14" y="7" width="1" height="1" />
          <rect x="13" y="8" width="1" height="1" />
          <rect x="12" y="9" width="1" height="1" />
          <rect x="14" y="9" width="1" height="1" />
          <rect x="11" y="10" width="1" height="1" />
          <rect x="15" y="10" width="1" height="1" />
        </svg>
      )

    case 'portfolio':
    case 'aboutme':
    case 'about-me':
    case 'profile':
    case 'developer':
    case 'user':
    case 'avatar':
      return (
        <svg {...pixelSvgProps}>
          {/* Circular Frame Pixel Outline */}
          <rect x="4" y="1" width="8" height="1" />
          <rect x="2" y="2" width="2" height="1" />
          <rect x="12" y="2" width="2" height="1" />
          <rect x="1" y="3" width="1" height="2" />
          <rect x="14" y="3" width="1" height="2" />
          <rect x="1" y="5" width="1" height="6" />
          <rect x="14" y="5" width="1" height="6" />
          <rect x="1" y="11" width="1" height="2" />
          <rect x="14" y="11" width="1" height="2" />
          <rect x="2" y="13" width="2" height="1" />
          <rect x="12" y="13" width="2" height="1" />
          <rect x="4" y="14" width="8" height="1" />

          {/* User Head */}
          <rect x="6" y="3" width="4" height="4" />
          <rect x="5" y="4" width="6" height="2" />

          {/* Neck */}
          <rect x="7" y="7" width="2" height="1" />

          {/* User Shoulders / Bust */}
          <rect x="5" y="8" width="6" height="1" />
          <rect x="4" y="9" width="8" height="1" />
          <rect x="3" y="10" width="10" height="3" />
        </svg>
      )

    case 'itunes':
    case 'music':
    case 'song':
      return (
        <svg {...pixelSvgProps}>
          {/* Top Beam */}
          <rect x="4" y="2" width="9" height="2" />
          <rect x="4" y="3" width="9" height="2" />
          {/* Left Stem */}
          <rect x="4" y="4" width="2" height="7" />
          {/* Right Stem */}
          <rect x="11" y="4" width="2" height="6" />
          {/* Left Note Head */}
          <rect x="2" y="9" width="4" height="3" />
          {/* Right Note Head */}
          <rect x="9" y="8" width="4" height="3" />
        </svg>
      )

    case 'folder':
      return (
        <svg {...pixelSvgProps}>
          {/* Folder Tab */}
          <rect x="1" y="2" width="6" height="3" />
          {/* Main Body Outline */}
          <rect x="1" y="4" width="14" height="10" />
          {/* Folder Cutout Inner Highlight */}
          <rect x="2" y="6" width="12" height="7" fill="var(--os-bg)" />
          {/* Horizon Line */}
          <rect x="2" y="7" width="12" height="1" />
        </svg>
      )

    case 'document':
    case 'write':
    case 'note':
      return (
        <svg {...pixelSvgProps}>
          {/* Document Paper */}
          <rect x="2" y="1" width="12" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Dog-ear fold */}
          <rect x="9" y="1" width="5" height="5" />
          <rect x="9" y="1" width="4" height="4" fill="var(--os-bg)" />
          <rect x="9" y="5" width="5" height="1" />
          <rect x="9" y="1" width="1" height="5" />
          {/* Pixel text lines */}
          <rect x="4" y="7" width="8" height="1" />
          <rect x="4" y="9" width="8" height="1" />
          <rect x="4" y="11" width="6" height="1" />
        </svg>
      )

    case 'calculator':
      return (
        <svg {...pixelSvgProps}>
          {/* Body */}
          <rect x="2" y="1" width="12" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* LCD Screen */}
          <rect x="4" y="3" width="8" height="3" />
          <rect x="5" y="4" width="6" height="1" fill="var(--os-bg)" />
          {/* Buttons 3x3 */}
          <rect x="4" y="8" width="2" height="1" />
          <rect x="7" y="8" width="2" height="1" />
          <rect x="10" y="8" width="2" height="1" />
          <rect x="4" y="10" width="2" height="1" />
          <rect x="7" y="10" width="2" height="1" />
          <rect x="10" y="10" width="2" height="1" />
          <rect x="4" y="12" width="2" height="1" />
          <rect x="7" y="12" width="2" height="1" />
          <rect x="10" y="12" width="2" height="1" />
        </svg>
      )

    case 'sheets':
    case 'sheet':
    case 'spreadsheet':
    case 'excel':
    case 'calc-sheet':
      return (
        <svg {...pixelSvgProps}>
          {/* Table Grid Frame */}
          <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Header row */}
          <rect x="1" y="5" width="14" height="1" />
          {/* Column vertical line */}
          <rect x="5" y="1" width="1" height="14" />
          <rect x="10" y="5" width="1" height="10" />
          {/* Row horizontal line */}
          <rect x="1" y="9" width="14" height="1" />
          {/* Cell data pixels */}
          <rect x="2" y="3" width="2" height="1" />
          <rect x="7" y="3" width="5" height="1" />
          <rect x="7" y="7" width="2" height="1" />
          <rect x="12" y="7" width="2" height="1" />
          <rect x="7" y="11" width="2" height="1" />
          <rect x="12" y="11" width="2" height="1" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...pixelSvgProps}>
          {/* Calendar Body */}
          <rect x="1" y="3" width="14" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Spiral Bindings */}
          <rect x="3" y="1" width="2" height="3" />
          <rect x="7" y="1" width="2" height="3" />
          <rect x="11" y="1" width="2" height="3" />
          {/* Header bar */}
          <rect x="1" y="6" width="14" height="1" />
          {/* Date Dots Grid */}
          <rect x="3" y="8" width="2" height="1" />
          <rect x="7" y="8" width="2" height="1" />
          <rect x="11" y="8" width="2" height="1" />
          <rect x="3" y="10" width="2" height="1" />
          <rect x="7" y="10" width="2" height="1" />
          <rect x="11" y="10" width="2" height="1" />
          <rect x="3" y="12" width="2" height="1" />
          <rect x="7" y="12" width="2" height="1" />
          <rect x="11" y="12" width="2" height="1" />
        </svg>
      )

    case 'trash':
      return (
        <svg {...pixelSvgProps}>
          {/* Lid Handle */}
          <rect x="6" y="1" width="4" height="1" />
          {/* Lid */}
          <rect x="2" y="2" width="12" height="2" />
          {/* Bin Base Outline */}
          <rect x="3" y="4" width="10" height="11" />
          <rect x="4" y="5" width="8" height="9" fill="var(--os-bg)" />
          {/* Vertical Ribs */}
          <rect x="5" y="6" width="1" height="7" />
          <rect x="7" y="6" width="2" height="7" />
          <rect x="10" y="6" width="1" height="7" />
        </svg>
      )

    case 'terminal':
      return (
        <svg {...pixelSvgProps}>
          {/* Monitor Screen Frame */}
          <rect x="1" y="1" width="14" height="11" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Monitor Stand */}
          <rect x="6" y="12" width="4" height="1" />
          <rect x="4" y="13" width="8" height="2" />
          {/* Prompt Symbol '>' */}
          <rect x="3" y="4" width="1" height="1" />
          <rect x="4" y="5" width="1" height="1" />
          <rect x="5" y="6" width="1" height="1" />
          <rect x="4" y="7" width="1" height="1" />
          <rect x="3" y="8" width="1" height="1" />
          {/* Cursor Block '_' */}
          <rect x="7" y="7" width="3" height="2" />
        </svg>
      )

    case 'camera':
    case 'photobot':
      return (
        <svg {...pixelSvgProps}>
          {/* Shutter Button & Flash */}
          <rect x="4" y="2" width="3" height="2" />
          <rect x="10" y="2" width="2" height="2" />
          {/* Camera Body */}
          <rect x="1" y="4" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Lens Circle */}
          <rect x="6" y="6" width="4" height="6" />
          <rect x="5" y="7" width="6" height="4" />
          <rect x="7" y="8" width="2" height="2" fill="var(--os-bg)" />
          {/* Flash window */}
          <rect x="11" y="6" width="2" height="2" />
        </svg>
      )

    case 'gallery':
    case 'image':
      return (
        <svg {...pixelSvgProps}>
          {/* Photo Frame */}
          <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Sun Pixel */}
          <rect x="10" y="3" width="3" height="3" />
          {/* Mountain Peaks */}
          <rect x="3" y="11" width="2" height="3" />
          <rect x="4" y="9" width="2" height="5" />
          <rect x="5" y="7" width="2" height="7" />
          <rect x="7" y="9" width="2" height="5" />
          <rect x="8" y="10" width="2" height="4" />
          <rect x="9" y="8" width="2" height="6" />
          <rect x="10" y="6" width="2" height="8" />
          <rect x="12" y="8" width="2" height="6" />
        </svg>
      )

    case 'launchpad':
    case 'apps':
      return (
        <svg {...pixelSvgProps}>
          {/* 3x3 App Blocks */}
          <rect x="2" y="2" width="3" height="3" />
          <rect x="6.5" y="2" width="3" height="3" />
          <rect x="11" y="2" width="3" height="3" />

          <rect x="2" y="6.5" width="3" height="3" />
          <rect x="6.5" y="6.5" width="3" height="3" />
          <rect x="11" y="6.5" width="3" height="3" />

          <rect x="2" y="11" width="3" height="3" />
          <rect x="6.5" y="11" width="3" height="3" />
          <rect x="11" y="11" width="3" height="3" />
        </svg>
      )

    case 'search':
    case 'spotlight':
    case 'find':
      return (
        <svg {...pixelSvgProps}>
          {/* Lens Circle 8-bit */}
          <rect x="3" y="1" width="6" height="1" />
          <rect x="2" y="2" width="8" height="1" />
          <rect x="1" y="3" width="10" height="6" />
          <rect x="2" y="9" width="8" height="1" />
          <rect x="3" y="10" width="6" height="1" />
          <rect x="3" y="3" width="6" height="6" fill="var(--os-bg)" />
          {/* Diagonal Pixel Handle */}
          <rect x="9" y="9" width="2" height="2" />
          <rect x="11" y="11" width="2" height="2" />
          <rect x="13" y="13" width="2" height="2" />
        </svg>
      )

    case 'bomb':
    case 'minesweeper':
      return (
        <svg {...pixelSvgProps}>
          {/* Fuse & Spark */}
          <rect x="12" y="1" width="2" height="2" />
          <rect x="10" y="3" width="2" height="2" />
          <rect x="8" y="4" width="2" height="2" />
          {/* Bomb Sphere */}
          <rect x="4" y="6" width="8" height="8" />
          <rect x="3" y="7" width="10" height="6" />
          <rect x="5" y="5" width="6" height="10" />
          {/* Specular Highlight */}
          <rect x="5" y="7" width="2" height="2" fill="var(--os-bg)" />
        </svg>
      )

    case 'game':
    case 'snake':
    case 'joystick':
      return (
        <svg {...pixelSvgProps}>
          {/* Gamepad Body */}
          <rect x="1" y="4" width="14" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* D-Pad + */}
          <rect x="3" y="7" width="5" height="2" />
          <rect x="4.5" y="5.5" width="2" height="5" />
          {/* Buttons A & B */}
          <rect x="10" y="8" width="2" height="2" />
          <rect x="12" y="6" width="2" height="2" />
        </svg>
      )

    case 'stickynote':
    case 'stickies':
    case 'sticky':
    case 'memo':
      return (
        <svg {...pixelSvgProps}>
          {/* Note Frame */}
          <rect x="2" y="1" width="12" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Folded Corner */}
          <rect x="10" y="11" width="4" height="4" />
          <rect x="10" y="11" width="3" height="3" fill="var(--os-bg)" />
          <rect x="10" y="11" width="4" height="1" />
          <rect x="10" y="11" width="1" height="4" />
          {/* Note scribble lines */}
          <rect x="4" y="4" width="8" height="1" />
          <rect x="4" y="6" width="8" height="1" />
          <rect x="4" y="8" width="5" height="1" />
        </svg>
      )

    case 'paint':
    case 'macpaint':
      return (
        <svg {...pixelSvgProps}>
          {/* Palette Frame */}
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Thumb hole */}
          <rect x="4" y="9" width="3" height="3" />
          <rect x="5" y="10" width="1" height="1" fill="var(--os-bg)" />
          {/* Paint Swatches */}
          <rect x="4" y="4" width="2" height="2" />
          <rect x="7" y="3" width="2" height="2" />
          <rect x="10" y="4" width="2" height="2" />
          {/* Brush handle & tip */}
          <rect x="11" y="9" width="2" height="2" />
          <rect x="12" y="11" width="2" height="2" />
        </svg>
      )

    case 'browser':
    case 'globe':
    case 'web':
    case 'internet':
      return (
        <svg {...pixelSvgProps}>
          {/* Globe Circle Outline */}
          <rect x="4" y="1" width="8" height="1" />
          <rect x="2" y="2" width="12" height="1" />
          <rect x="1" y="4" width="14" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="2" y="13" width="12" height="1" />
          <rect x="4" y="14" width="8" height="1" />
          {/* Equator & Meridians */}
          <rect x="1" y="7" width="14" height="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="7" y="1" width="2" height="14" />
          <rect x="4" y="3" width="1" height="10" />
          <rect x="11" y="3" width="1" height="10" />
        </svg>
      )

    case 'weather':
    case 'sun':
      return (
        <svg {...pixelSvgProps}>
          {/* Sun Center */}
          <rect x="5" y="5" width="6" height="6" />
          {/* Rays */}
          <rect x="7" y="1" width="2" height="2" />
          <rect x="7" y="13" width="2" height="2" />
          <rect x="1" y="7" width="2" height="2" />
          <rect x="13" y="7" width="2" height="2" />
          <rect x="3" y="3" width="2" height="2" />
          <rect x="11" y="11" width="2" height="2" />
          <rect x="3" y="11" width="2" height="2" />
          <rect x="11" y="3" width="2" height="2" />
        </svg>
      )

    case 'moon':
      return (
        <svg {...pixelSvgProps}>
          <rect x="5" y="2" width="6" height="2" />
          <rect x="3" y="4" width="8" height="2" />
          <rect x="2" y="6" width="8" height="4" />
          <rect x="3" y="10" width="8" height="2" />
          <rect x="5" y="12" width="6" height="2" />
          {/* Cutout Inner */}
          <rect x="7" y="4" width="6" height="8" fill="var(--os-bg)" />
        </svg>
      )

    case 'cloud':
    case 'cloud-sun':
    case 'cloud-rain':
    case 'cloud-snow':
    case 'cloud-lightning':
    case 'fog':
      return (
        <svg {...pixelSvgProps}>
          {/* Cloud Main Puffs */}
          <rect x="5" y="3" width="6" height="4" />
          <rect x="2" y="6" width="12" height="5" />
          {/* Rain / Lightning / Base */}
          {iconType === 'cloud-rain' ? (
            <>
              <rect x="4" y="12" width="1" height="3" />
              <rect x="8" y="12" width="1" height="3" />
              <rect x="12" y="12" width="1" height="3" />
            </>
          ) : iconType === 'cloud-snow' ? (
            <>
              <rect x="4" y="13" width="2" height="2" />
              <rect x="8" y="12" width="2" height="2" />
              <rect x="12" y="13" width="2" height="2" />
            </>
          ) : iconType === 'cloud-lightning' ? (
            <>
              <rect x="8" y="10" width="3" height="2" />
              <rect x="6" y="12" width="4" height="1" />
              <rect x="7" y="13" width="2" height="2" />
            </>
          ) : iconType === 'fog' ? (
            <>
              <rect x="2" y="12" width="12" height="1" />
              <rect x="4" y="14" width="8" height="1" />
            </>
          ) : (
            <rect x="2" y="10" width="12" height="2" />
          )}
        </svg>
      )

    case 'preferences':
    case 'gear':
      return (
        <svg {...pixelSvgProps}>
          {/* 8-bit Gear Teeth */}
          <rect x="6" y="1" width="4" height="14" />
          <rect x="1" y="6" width="14" height="4" />
          <rect x="3" y="3" width="10" height="10" />
          {/* Center Hole */}
          <rect x="6" y="6" width="4" height="4" fill="var(--os-bg)" />
          <rect x="7" y="7" width="2" height="2" />
        </svg>
      )

    case 'about':
    case 'info':
      return (
        <svg {...pixelSvgProps}>
          {/* 8-bit Info Badge */}
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* 'i' dot */}
          <rect x="7" y="4" width="2" height="2" />
          {/* 'i' body */}
          <rect x="7" y="7" width="2" height="5" />
          <rect x="6" y="7" width="2" height="1" />
          <rect x="6" y="11" width="4" height="1" />
        </svg>
      )

    case 'cloud-drive':
    case 'gdrive':
      return (
        <svg {...pixelSvgProps}>
          {/* Cloud Outline */}
          <rect x="5" y="2" width="6" height="3" />
          <rect x="2" y="5" width="12" height="5" />
          {/* Arrow up */}
          <rect x="7" y="8" width="2" height="6" />
          <rect x="6" y="9" width="4" height="1" />
          <rect x="5" y="10" width="6" height="1" />
        </svg>
      )

    case 'pdf':
      return (
        <svg {...pixelSvgProps}>
          {/* Document Frame */}
          <rect x="2" y="1" width="12" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* PDF Box */}
          <rect x="3" y="5" width="10" height="6" />
          <rect x="4" y="6" width="8" height="4" fill="var(--os-bg)" />
          {/* Text Line */}
          <rect x="4" y="12" width="8" height="1" />
        </svg>
      )

    case 'code':
      return (
        <svg {...pixelSvgProps}>
          {/* Document Frame */}
          <rect x="2" y="1" width="12" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* '<' */}
          <rect x="4" y="6" width="1" height="1" />
          <rect x="3" y="7" width="1" height="2" />
          <rect x="4" y="9" width="1" height="1" />
          {/* '>' */}
          <rect x="11" y="6" width="1" height="1" />
          <rect x="12" y="7" width="1" height="2" />
          <rect x="11" y="9" width="1" height="1" />
          {/* '/' */}
          <rect x="9" y="5" width="1" height="2" />
          <rect x="8" y="7" width="1" height="2" />
          <rect x="7" y="9" width="1" height="2" />
          <rect x="6" y="11" width="1" height="2" />
        </svg>
      )

    case 'media':
    case 'audio':
    case 'video':
      return (
        <svg {...pixelSvgProps}>
          {/* Reel Frame */}
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Play Triangle */}
          <rect x="6" y="5" width="1" height="6" />
          <rect x="7" y="6" width="1" height="4" />
          <rect x="8" y="7" width="2" height="2" />
        </svg>
      )

    case 'map':
    case 'maps':
    case 'location':
    case 'navigation':
    case 'gps':
      return (
        <svg {...pixelSvgProps}>
          {/* Folded Map Zigzag Top */}
          <rect x="1" y="3" width="1" height="11" />
          <rect x="2" y="2" width="2" height="1" />
          <rect x="4" y="1" width="2" height="1" />
          <rect x="6" y="2" width="2" height="1" />
          <rect x="8" y="3" width="2" height="1" />
          <rect x="10" y="2" width="2" height="1" />
          <rect x="12" y="1" width="2" height="1" />
          <rect x="14" y="2" width="1" height="11" />

          {/* Folded Map Zigzag Bottom */}
          <rect x="2" y="13" width="2" height="1" />
          <rect x="4" y="12" width="2" height="1" />
          <rect x="6" y="13" width="2" height="1" />
          <rect x="8" y="14" width="2" height="1" />
          <rect x="10" y="13" width="2" height="1" />
          <rect x="12" y="12" width="2" height="1" />

          {/* Panel Fold Creases */}
          <rect x="5" y="2" width="1" height="10" />
          <rect x="10" y="2" width="1" height="10" />

          {/* Route / Road Paths */}
          <rect x="2" y="8" width="3" height="1" />
          <rect x="4" y="6" width="1" height="2" />
          <rect x="11" y="9" width="3" height="1" />
          <rect x="12" y="6" width="1" height="3" />

          {/* Map Location Pin Marker */}
          <rect x="6" y="2" width="4" height="4" />
          <rect x="7" y="3" width="2" height="2" fill="var(--os-bg)" />
          <rect x="7" y="6" width="2" height="2" />
          <rect x="7.5" y="8" width="1" height="1" />
        </svg>
      )

    case 'chat':
    case 'message':
    case 'ai':
    case 'bot':
      return (
        <svg {...pixelSvgProps}>
          {/* Speech Bubble */}
          <rect x="1" y="2" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Bubble Tail */}
          <rect x="3" y="11" width="3" height="3" />
          {/* 3 Dots */}
          <rect x="4" y="6" width="2" height="2" />
          <rect x="7" y="6" width="2" height="2" />
          <rect x="10" y="6" width="2" height="2" />
        </svg>
      )

    case 'pet':
    case 'paw':
    case 'cat':
    case 'dog':
      return (
        <svg {...pixelSvgProps}>
          {/* Main Paw Pad */}
          <rect x="4" y="8" width="8" height="6" />
          <rect x="5" y="7" width="6" height="8" />
          {/* 4 Toe Pads */}
          <rect x="3" y="4" width="2" height="3" />
          <rect x="6" y="3" width="2" height="3" />
          <rect x="9" y="3" width="2" height="3" />
          <rect x="12" y="4" width="2" height="3" />
        </svg>
      )

    default:
      return (
        <svg {...pixelSvgProps}>
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="6" y="6" width="4" height="4" />
        </svg>
      )
  }
}
