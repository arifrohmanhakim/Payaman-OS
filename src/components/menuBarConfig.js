export function getMenuBarConfig(activeAppId, activeAppTitle) {
  const isFinder = !activeAppId
  const appName = isFinder ? 'Finder' : (activeAppTitle || 'App')

  const appleMenu = {
    label: '',
    isApple: true,
    items: [
      { label: 'About Payaman OS', action: 'about_os' },
      { label: 'System Preferences...', action: 'preferences', shortcut: '⌘,' },
      { divider: true },
      { label: 'Launchpad', action: 'launchpad', shortcut: 'F4' },
      { divider: true },
      { label: 'Clean Desktop', action: 'clean_desktop' },
      { label: 'Reset Window Session', action: 'reset_session' },
      { label: 'Empty Trash...', action: 'empty_trash' },
      { divider: true },
      { label: 'Restart...', action: 'restart' },
    ],
  }

  const appMenu = {
    label: appName,
    isAppName: true,
    items: isFinder
      ? [
          { label: 'About Finder', action: 'about_finder' },
          { divider: true },
          { label: 'Preferences...', action: 'preferences', shortcut: '⌘,' },
          { label: 'Empty Trash...', action: 'empty_trash' },
        ]
      : [
          { label: `About ${appName}`, action: 'about_app' },
          { divider: true },
          { label: `Hide ${appName}`, action: 'minimize_active', shortcut: '⌘H' },
          { divider: true },
          { label: `Quit ${appName}`, action: 'close_active', shortcut: '⌘Q' },
        ],
  }

  let dynamicMenus = []

  switch (activeAppId) {
    case 'browser':
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'New Tab', action: 'browser:new_tab', shortcut: '⌘T' },
            { label: 'Close Tab', action: 'browser:close_tab', shortcut: '⌘W' },
            { divider: true },
            { label: 'Open in External Browser', action: 'browser:open_external', shortcut: '⌘O' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⇧⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Cut', disabled: true, shortcut: '⌘X' },
            { label: 'Copy', disabled: true, shortcut: '⌘C' },
            { label: 'Paste', disabled: true, shortcut: '⌘V' },
            { divider: true },
            { label: 'Select Address Bar', action: 'browser:focus_address', shortcut: '⌘L' },
          ],
        },
        {
          label: 'View',
          items: [
            { label: 'Reload Page', action: 'browser:reload', shortcut: '⌘R' },
            { label: 'Go to Home Portal', action: 'browser:home', shortcut: '⇧⌘H' },
          ],
        },
        {
          label: 'History',
          items: [
            { label: 'Back', action: 'browser:back', shortcut: '⌘[' },
            { label: 'Forward', action: 'browser:forward', shortcut: '⌘]' },
            { divider: true },
            { label: 'Home Page', action: 'browser:home' },
          ],
        },
        {
          label: 'Bookmarks',
          items: [
            { label: 'Bookmark Current Page', action: 'browser:bookmark', shortcut: '⌘D' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Browser Help', action: 'help_app' }],
        },
      ]
      break

    case 'files':
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'New Folder...', action: 'files:new_folder', shortcut: '⇧⌘N' },
            { label: 'New File...', action: 'files:new_file', shortcut: '⌘N' },
            { label: 'Upload Files...', action: 'files:upload', shortcut: '⌘U' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Rename Item...', action: 'files:rename' },
            { label: 'Delete Item', action: 'files:delete', shortcut: '⌫' },
          ],
        },
        {
          label: 'View',
          items: [
            { label: 'as Icons (Grid)', action: 'files:view_grid', shortcut: '⌘1' },
            { label: 'as List', action: 'files:view_list', shortcut: '⌘2' },
            { divider: true },
            { label: 'Refresh', action: 'files:refresh', shortcut: '⌘R' },
          ],
        },
        {
          label: 'Go',
          items: [
            { label: 'Home (~)', action: 'files:go_home', shortcut: '⇧⌘H' },
            { label: 'Documents', action: 'files:go_documents', shortcut: '⇧⌘O' },
            { label: 'System', action: 'files:go_system' },
            { label: 'Root (/)', action: 'files:go_root' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'File Manager Help', action: 'help_files' }],
        },
      ]
      break

    case 'paint':
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'Save to VFS', action: 'paint:save', shortcut: '⌘S' },
            { label: 'Download PNG', action: 'paint:download', shortcut: '⇧⌘S' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Undo', action: 'paint:undo', shortcut: '⌘Z' },
            { label: 'Redo', action: 'paint:redo', shortcut: '⇧⌘Z' },
            { divider: true },
            { label: 'Clear Canvas', action: 'paint:clear', shortcut: '⌘K' },
            { label: 'Invert Colors', action: 'paint:invert', shortcut: '⌘I' },
          ],
        },
        {
          label: 'Tools',
          items: [
            { label: 'Pencil (1px)', action: 'paint:tool_pencil', shortcut: 'P' },
            { label: 'Paint Brush', action: 'paint:tool_brush', shortcut: 'B' },
            { label: 'Eraser', action: 'paint:tool_eraser', shortcut: 'E' },
            { label: 'Paint Bucket', action: 'paint:tool_bucket', shortcut: 'G' },
            { label: 'Spray Can', action: 'paint:tool_spray', shortcut: 'S' },
            { divider: true },
            { label: 'Straight Line', action: 'paint:tool_line', shortcut: 'L' },
            { label: 'Rectangle', action: 'paint:tool_rect', shortcut: 'R' },
            { label: 'Circle', action: 'paint:tool_circle', shortcut: 'C' },
            { label: 'Text Tool', action: 'paint:tool_text', shortcut: 'T' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'MacPaint Help', action: 'help_paint' }],
        },
      ]
      break

    case 'write':
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'New Note', action: 'write:new', shortcut: '⌘N' },
            { label: 'Save to Disk', action: 'write:save', shortcut: '⌘S' },
            { label: 'Clear Document', action: 'write:clear' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Undo', action: 'write:undo', shortcut: '⌘Z' },
            { divider: true },
            { label: 'Select All', action: 'write:select_all', shortcut: '⌘A' },
          ],
        },
        {
          label: 'Format',
          items: [
            { label: 'Plain Text (Monospace)', disabled: true },
            { label: 'Auto Save: Enabled', disabled: true },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Notes Help', action: 'help_write' }],
        },
      ]
      break

    case 'calculator':
    case 'calc':
      dynamicMenus = [
        {
          label: 'File',
          items: [{ label: 'Close Window', action: 'close_active', shortcut: '⌘W' }],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Clear Entry', action: 'calc:clear', shortcut: 'C' },
            { divider: true },
            { label: 'Copy Result', action: 'calc:copy', shortcut: '⌘C' },
          ],
        },
        {
          label: 'View',
          items: [{ label: 'Pocket Calculator', disabled: true }],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Calculator Help', action: 'help_calc' }],
        },
      ]
      break

    case 'terminal':
      dynamicMenus = [
        {
          label: 'Shell',
          items: [
            { label: 'Clear Buffer', action: 'terminal:clear', shortcut: '⌘K' },
            { label: 'Reset Terminal', action: 'terminal:reset' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Copy Selection', action: 'terminal:copy', shortcut: '⌘C' },
            { label: 'Paste Clipboard', action: 'terminal:paste', shortcut: '⌘V' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Terminal Help (Command Guide)', action: 'help_terminal' }],
        },
      ]
      break

    case 'gallery':
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'Reload Photos', action: 'gallery:reload', shortcut: '⌘R' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'View',
          items: [
            { label: 'Toggle Monochrome / Color', action: 'gallery:toggle_mono', shortcut: '⌘M' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Gallery Help', action: 'help_gallery' }],
        },
      ]
      break

    case 'photobot':
      dynamicMenus = [
        {
          label: 'Camera',
          items: [
            { label: 'Take Photo (3s Timer)', action: 'photobot:snap', shortcut: 'Space' },
            { label: 'Reload Camera Stream', action: 'photobot:reload', shortcut: '⌘R' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Filter',
          items: [
            { label: 'Original Color', action: 'photobot:filter_normal' },
            { label: 'Monochrome', action: 'photobot:filter_monochrome' },
            { label: '1-Bit Retro', action: 'photobot:filter_dither_1bit' },
            { label: 'Negative Film', action: 'photobot:filter_invert' },
            { label: 'CRT Scanline', action: 'photobot:filter_scanline' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Photobot Help', action: 'help_photobot' }],
        },
      ]
      break

    case 'calendar':
      dynamicMenus = [
        {
          label: 'File',
          items: [{ label: 'Close Window', action: 'close_active', shortcut: '⌘W' }],
        },
        {
          label: 'View',
          items: [
            { label: 'Jump to Today', action: 'calendar:today', shortcut: '⌘T' },
            { label: 'Previous Month', action: 'calendar:prev', shortcut: '←' },
            { label: 'Next Month', action: 'calendar:next', shortcut: '→' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Calendar Help', action: 'help_calendar' }],
        },
      ]
      break

    case 'preferences':
    case 'about':
    case 'wastebasket':
      dynamicMenus = [
        {
          label: 'File',
          items: [{ label: 'Close Window', action: 'close_active', shortcut: '⌘W' }],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', shortcut: '⌘M' },
            { label: 'Close Window', action: 'close_active', shortcut: '⌘W' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: `${appName} Help`, action: 'help_app' }],
        },
      ]
      break

    default:
      // Finder / Desktop default menu
      dynamicMenus = [
        {
          label: 'File',
          items: [
            { label: 'Open File Manager', action: 'files', shortcut: '⌘O' },
            { label: 'Open Browser', action: 'browser', shortcut: '⌘B' },
            { label: 'Open Notes', action: 'new_note', shortcut: '⌘N' },
            { label: 'Open Terminal', action: 'terminal' },
            { label: 'Open Calendar', action: 'calendar' },
            { label: 'Open Calculator', action: 'calculator' },
            { divider: true },
            { label: 'Close Window', action: 'close_active', disabled: true, shortcut: '⌘W' },
          ],
        },
        {
          label: 'Edit',
          items: [
            { label: 'Undo', disabled: true, shortcut: '⌘Z' },
            { label: 'Redo', disabled: true, shortcut: '⇧⌘Z' },
            { divider: true },
            { label: 'Cut', disabled: true, shortcut: '⌘X' },
            { label: 'Copy', disabled: true, shortcut: '⌘C' },
            { label: 'Paste', disabled: true, shortcut: '⌘V' },
            { label: 'Select All', action: 'clean_desktop', shortcut: '⌘A' },
          ],
        },
        {
          label: 'View',
          items: [
            { label: 'Icon View', action: 'view_icon' },
            { label: 'List View', action: 'view_list' },
            { divider: true },
            { label: 'Clean Desktop', action: 'clean_desktop' },
          ],
        },
        {
          label: 'Go',
          items: [
            { label: 'Home (~)', action: 'go_home', shortcut: '⇧⌘H' },
            { label: 'Documents', action: 'go_documents', shortcut: '⇧⌘O' },
            { label: 'System', action: 'go_system' },
            { label: 'Root (/)', action: 'go_root', shortcut: '⇧⌘C' },
            { label: 'Trash', action: 'wastebasket' },
          ],
        },
        {
          label: 'Window',
          items: [
            { label: 'Minimize', action: 'minimize_active', disabled: true, shortcut: '⌘M' },
            { label: 'Zoom', action: 'zoom_active', disabled: true },
            { divider: true },
            { label: 'Bring All to Front', action: 'bring_all_front' },
          ],
        },
        {
          label: 'Help',
          items: [{ label: 'Payaman OS Help', action: 'help_os' }],
        },
      ]
      break
  }

  return [appleMenu, appMenu, ...dynamicMenus]
}
