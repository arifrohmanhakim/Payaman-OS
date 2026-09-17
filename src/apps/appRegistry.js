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

import PhotobotApp from './photobot/index.jsx'
import { photobotAppConfig } from './photobot/config.js'

import PaintApp from './paint/index.jsx'
import { paintAppConfig } from './paint/config.js'

import CalendarApp from './calendar/index.jsx'
import { calendarAppConfig } from './calendar/config.js'

import BrowserApp from './browser/index.jsx'
import { browserAppConfig } from './browser/config.js'

import WeatherApp from './weather/index.jsx'
import { weatherAppConfig } from './weather/config.js'

import MapsApp from './maps/index.jsx'
import { mapsAppConfig } from './maps/config.js'

import PayamanChatApp from './chat/index.jsx'
import { payamanChatConfig } from './chat/config.js'

import ITunesApp from './itunes/index.jsx'
import { itunesAppConfig } from './itunes/config.js'

export const appRegistry = [
  {
    ...browserAppConfig,
    component: BrowserApp,
  },
  {
    ...itunesAppConfig,
    component: ITunesApp,
  },
  {
    ...payamanChatConfig,
    component: PayamanChatApp,
  },
  {
    ...weatherAppConfig,
    component: WeatherApp,
  },
  {
    ...mapsAppConfig,
    component: MapsApp,
  },
  {
    ...fileManagerAppConfig,
    component: FileManagerApp,
  },
  {
    ...paintAppConfig,
    component: PaintApp,
  },
  {
    ...calendarAppConfig,
    component: CalendarApp,
  },
  {
    ...galleryAppConfig,
    component: GalleryApp,
  },
  {
    ...photobotAppConfig,
    component: PhotobotApp,
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
