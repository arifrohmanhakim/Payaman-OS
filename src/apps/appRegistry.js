import WriteApp from './write/index.jsx'
import { writeAppConfig } from './write/config.js'

import CalcApp from './calculator/index.jsx'
import { calculatorAppConfig } from './calculator/config.js'

import AboutApp from './about/index.jsx'
import { aboutAppConfig } from './about/config.js'

import PreferencesApp from './preferences/index.jsx'
import { preferencesAppConfig } from './preferences/config.js'

import WastebasketApp from './wastebasket/index.jsx'
import { wastebasketAppConfig } from './wastebasket/config.js'

import TerminalApp from './terminal/index.jsx'
import { terminalAppConfig } from './terminal/config.js'

import FileManagerApp from './files/index.jsx'
import { fileManagerAppConfig } from './files/config.js'

import GalleryApp from './gallery/index.jsx'
import { galleryAppConfig } from './gallery/config.js'

export const appRegistry = [
  {
    ...fileManagerAppConfig,
    component: FileManagerApp,
  },
  {
    ...galleryAppConfig,
    component: GalleryApp,
  },
  {
    ...terminalAppConfig,
    component: TerminalApp,
  },
  {
    ...writeAppConfig,
    component: WriteApp,
  },
  {
    ...calculatorAppConfig,
    component: CalcApp,
  },
  {
    ...preferencesAppConfig,
    component: PreferencesApp,
  },
  {
    ...aboutAppConfig,
    component: AboutApp,
  },
  {
    ...wastebasketAppConfig,
    component: WastebasketApp,
  },
]

export const getAppById = (appId) => {
  return appRegistry.find((app) => app.id === appId) || null
}

export const getDesktopApps = () => {
  return appRegistry.filter((app) => app.showOnDesktop !== false)
}
