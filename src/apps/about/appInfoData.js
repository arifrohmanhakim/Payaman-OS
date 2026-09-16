export const SYSTEM_INFO = {
  name: 'Payaman OS',
  version: '1.0 (Sonoma Edition)',
  build: '2026.09',
  architecture: 'Client-side Modular Web OS',
  tagline: 'Retro Monochrome Desktop Environment',
  specs: [
    { label: 'Processor', value: 'JavaScript V8 / Web Runtime' },
    { label: 'UI Framework', value: 'React 19 + Vite' },
    { label: 'Styling Engine', value: 'Tailwind CSS v4 (Monochrome)' },
    { label: 'Memory', value: '16 MB Virtual RAM' },
    { label: 'Storage', value: 'Virtual File System (LocalStorage)' },
    { label: 'Cloud Drive', value: 'Google Drive API v3 (Connected)' },
    { label: 'Display', value: 'Monochrome Retina (1-bit / Halftone)' },
  ],
  credits: [
    { role: 'Core Architect', name: 'Arif & Payaman Lab' },
    { role: 'Component Engine', name: 'React 19' },
    { role: 'Terminal Shell', name: 'xterm.js' },
    { role: 'Audio Synthesizer', name: 'Web Audio API' },
    { role: 'License', name: 'MIT Open Source' },
  ],
}

export const APPS_INFO = {
  finder: {
    id: 'finder',
    title: 'Finder',
    version: '1.0',
    iconType: 'folder',
    category: 'System Shell',
    tagline: 'Desktop workspace and shell coordinator',
    description:
      'The foundational desktop manager that organizes icons, manages window layering, and handles app launching in Payaman OS.',
    specs: [
      { label: 'Layer', value: 'Desktop Shell' },
      { label: 'Window Logic', value: 'Z-Index Stack Manager' },
      { label: 'Status', value: 'Running' },
    ],
    shortcuts: [
      { key: '⌘O', desc: 'Open File Manager' },
      { key: '⌘N', desc: 'Create New Note' },
      { key: '⌘M', desc: 'Minimize Window' },
      { key: '⌘W', desc: 'Close Window' },
    ],
  },
  browser: {
    id: 'browser',
    title: 'Browser',
    version: '1.0',
    iconType: 'browser',
    category: 'Internet & Web',
    tagline: 'Retro-modern Web Explorer and Search Portal',
    description:
      'Explore the World Wide Web, search with DuckDuckGo, bookmark favorite sites, and view web pages inside a classic monochrome desktop window.',
    specs: [
      { label: 'Rendering Mode', value: 'Multi-Tab Sandboxed Iframe' },
      { label: 'Search Engine', value: 'DuckDuckGo / Global Web' },
      { label: 'Security', value: 'W3C Origin Isolation' },
    ],
    shortcuts: [
      { key: '⌘T', desc: 'New Tab' },
      { key: '⌘W', desc: 'Close Current Tab' },
      { key: '⌘R', desc: 'Reload Webpage' },
      { key: '⌘L', desc: 'Focus Address Bar' },
      { key: '⌘D', desc: 'Toggle Bookmark' },
    ],
  },
  weather: {
    id: 'weather',
    title: 'Weather',
    version: '1.0',
    iconType: 'weather',
    category: 'Weather & Climate',
    tagline: 'Global Real-time Weather & Atmospheric Forecast',
    description:
      'Live weather conditions, 24-hour hourly timeline, 7-day extended forecasts, and atmospheric telemetry powered by Open-Meteo.',
    specs: [
      { label: 'Data Source', value: 'Open-Meteo Global API' },
      { label: 'Forecast Period', value: '7 Days / 24 Hours' },
      { label: 'Telemetry', value: 'Humidity, Wind, UV, Pressure' },
    ],
    shortcuts: [
      { key: '⌘R', desc: 'Refresh Weather Data' },
      { key: '⌘F', desc: 'Search City' },
      { key: '⌘U', desc: 'Toggle Celsius / Fahrenheit' },
      { key: '⌘W', desc: 'Close Window' },
    ],
  },
  maps: {
    id: 'maps',
    title: 'Maps',
    version: '1.0',
    iconType: 'map',
    category: 'Navigation & Geography',
    tagline: 'Interactive Global Cartography & Geocoding',
    description:
      'Explore world maps, pinpoint locations, search global addresses, and navigate with OpenStreetMap open data and retro monochrome filters.',
    specs: [
      { label: 'Map Provider', value: 'OpenStreetMap (OSM) / Nominatim' },
      { label: 'Coverage', value: 'Worldwide Street & Topography' },
      { label: 'Style Engine', value: '1-Bit Retro & Standard OSM' },
    ],
    shortcuts: [
      { key: '⌘F', desc: 'Search Location' },
      { key: '⌘+', desc: 'Zoom In' },
      { key: '⌘-', desc: 'Zoom Out' },
      { key: '⌘L', desc: 'Locate My Position' },
      { key: '⌘W', desc: 'Close Window' },
    ],
  },
  files: {
    id: 'files',
    title: 'File Manager',
    version: '1.0',
    iconType: 'folder',
    category: 'Storage & Files',
    tagline: 'Local VFS & Cloud Google Drive Explorer',
    description:
      'Explore, create, and organize documents and media across local virtual storage and connected Google Drive with instant file previewing.',
    specs: [
      { label: 'Local VFS', value: 'Indexed JSON Tree' },
      { label: 'Cloud Sync', value: 'Google Drive REST API' },
      { label: 'Previewer', value: 'PDF, Image, Text, Audio, Video' },
    ],
    shortcuts: [
      { key: '⇧⌘N', desc: 'New Folder' },
      { key: '⌘N', desc: 'New File' },
      { key: '⌘U', desc: 'Upload Files' },
      { key: '⌫', desc: 'Delete Selected Item' },
    ],
  },
  paint: {
    id: 'paint',
    title: 'MacPaint',
    version: '1.0',
    iconType: 'paint',
    category: 'Graphics & Illustration',
    tagline: 'Classic 1-bit monochrome graphics canvas',
    description:
      'Retro bitmap drawing software featuring authentic pencil strokes, spray nozzles, pattern buckets, geometric shapes, and image downloads.',
    specs: [
      { label: 'Resolution', value: '512 × 342 Bitmap Canvas' },
      { label: 'Color Depth', value: '1-bit High Contrast' },
      { label: 'Undo Buffer', value: 'Multi-step History' },
    ],
    shortcuts: [
      { key: '⌘S', desc: 'Save to Documents' },
      { key: '⌘Z', desc: 'Undo Stroke' },
      { key: '⌘Y', desc: 'Redo Stroke' },
      { key: '⌘U', desc: 'Download Bitmap' },
    ],
  },
  write: {
    id: 'write',
    title: 'Notes',
    version: '1.0',
    iconType: 'document',
    category: 'Text & Productivity',
    tagline: 'Distraction-free text and markdown editor',
    description:
      'Fast and focused text drafting notebook with automated localStorage persistence, quick document loading, and plaintext export.',
    specs: [
      { label: 'Type Engine', value: 'Plaintext Buffer' },
      { label: 'Auto-Save', value: 'Continuous Storage Sync' },
      { label: 'Format', value: 'Markdown & Text (.txt)' },
    ],
    shortcuts: [
      { key: '⌘S', desc: 'Save Note to VFS' },
      { key: '⌘N', desc: 'New Blank Note' },
      { key: '⌘A', desc: 'Select All Text' },
    ],
  },
  calc: {
    id: 'calc',
    title: 'Calculator',
    version: '1.0',
    iconType: 'calculator',
    category: 'Mathematics & Utilities',
    tagline: 'Retro desk arithmetic calculator',
    description:
      'Instant monochrome calculator supporting standard four-operation arithmetic, percentages, and clipboard copying.',
    specs: [
      { label: 'Precision', value: 'Double Precision 64-bit' },
      { label: 'Keypad', value: 'Standard 10-Key Layout' },
      { label: 'Audio', value: 'Mechanical Click Synth' },
    ],
    shortcuts: [
      { key: 'Esc', desc: 'Clear All (AC)' },
      { key: 'Enter', desc: 'Calculate Result' },
      { key: '⌘C', desc: 'Copy Display Value' },
    ],
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    version: '1.0',
    iconType: 'terminal',
    category: 'System Shell',
    tagline: 'Virtual UNIX-style command shell',
    description:
      'Interactive command shell built on xterm.js offering simulated POSIX commands, pipeline filtering, script execution, and VFS management.',
    specs: [
      { label: 'Terminal', value: 'xterm.js WebGL / Canvas' },
      { label: 'Commands', value: 'ls, cd, cat, echo, grep, rm, sysinfo' },
      { label: 'Encoding', value: 'UTF-8 Monospace' },
    ],
    shortcuts: [
      { key: '⌃C', desc: 'Cancel Running Command' },
      { key: '⌃L', desc: 'Clear Shell View' },
      { key: 'Tab', desc: 'Auto-complete Path' },
    ],
  },
  gallery: {
    id: 'gallery',
    title: 'Photo Gallery',
    version: '1.0',
    iconType: 'gallery',
    category: 'Media & Viewer',
    tagline: 'High-contrast monochrome photo collection',
    description:
      'Image inspection tool designed with monochrome contrast enhancement filters and gallery navigation.',
    specs: [
      { label: 'Color Space', value: '1-bit Dithered Monochrome' },
      { label: 'Navigation', value: 'Sequential Carousel' },
      { label: 'Source', value: 'Local VFS & Static Assets' },
    ],
    shortcuts: [
      { key: '← / →', desc: 'Previous / Next Image' },
      { key: 'Space', desc: 'Toggle Fullscreen' },
    ],
  },
  photobot: {
    id: 'photobot',
    title: 'Photobot',
    version: '1.0',
    iconType: 'photobot',
    category: 'Camera & Capture',
    tagline: 'Vintage photo booth with live webcam filters',
    description:
      'Real-time webcam snapshot booth featuring live pixel shaders including matrix green phosphor, threshold dither, and sepia tone.',
    specs: [
      { label: 'Camera Feed', value: 'HTML5 MediaDevices API' },
      { label: 'Filters', value: 'Threshold, Dither, Matrix, Sepia' },
      { label: 'Storage', value: 'Direct VFS Photo Save' },
    ],
    shortcuts: [
      { key: 'Space', desc: 'Snap Instant Photo' },
      { key: '⌘R', desc: 'Reload Camera Feed' },
    ],
  },
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    version: '1.0',
    iconType: 'calendar',
    category: 'Time & Scheduling',
    tagline: 'Desktop monthly calendar and date planner',
    description:
      'Monochrome calendar with month-by-month navigation, date highlighting, and local note entries synced with the system clock.',
    specs: [
      { label: 'Calendar Grid', value: 'Standard Gregorian 7-Day' },
      { label: 'Clock Sync', value: 'Active Real-Time Clock' },
      { label: 'Storage', value: 'Local Schedule Notes' },
    ],
    shortcuts: [
      { key: 'T', desc: 'Jump to Today' },
      { key: '← / →', desc: 'Previous / Next Month' },
    ],
  },
  preferences: {
    id: 'preferences',
    title: 'System Preferences',
    version: '1.0',
    iconType: 'preferences',
    category: 'System Settings',
    tagline: 'Appearance and sound customizer',
    description:
      'Configure desktop background patterns, monochrome display themes, sound effects, and dock preferences.',
    specs: [
      { label: 'Themes', value: 'Classic, Dark, Paper, Amber' },
      { label: 'Patterns', value: 'Halftone, Grid, Dot, Diagonal' },
      { label: 'Audio', value: 'Web Audio Click Synthesizer' },
    ],
    shortcuts: [{ key: '⌘,', desc: 'Open Preferences' }],
  },
  wastebasket: {
    id: 'wastebasket',
    title: 'Wastebasket',
    version: '1.0',
    iconType: 'trash',
    category: 'System Utility',
    tagline: 'Deleted item holding area',
    description:
      'Holds deleted virtual files safely until you choose to restore them or permanently empty the trash.',
    specs: [
      { label: 'Storage', value: 'VFS Trash Directory (/trash)' },
      { label: 'Purge Mode', value: 'Immediate Sector Erase' },
    ],
    shortcuts: [{ key: '⌘⌫', desc: 'Move Selected to Trash' }],
  },
}

export function getAboutInfo(targetAppId) {
  if (!targetAppId || targetAppId === 'system') {
    return { isSystem: true, ...SYSTEM_INFO }
  }

  const appInfo = APPS_INFO[targetAppId]
  if (appInfo) {
    return { isSystem: false, ...appInfo }
  }

  return { isSystem: true, ...SYSTEM_INFO }
}
