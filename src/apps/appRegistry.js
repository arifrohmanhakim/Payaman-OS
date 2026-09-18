import { lazy } from 'react'

import { sheetsAppConfig } from './sheets/config.js'
import { portfolioAppConfig } from './portfolio/config.js'
import { stickyNotesAppConfig } from './stickynotes/config.js'
import { minesweeperAppConfig } from './minesweeper/config.js'
import { snakeAppConfig } from './snake/config.js'
import { desktopPetConfig } from './pet/config.js'
import { browserAppConfig } from './browser/config.js'
import { itunesAppConfig } from './itunes/config.js'
import { payamanChatConfig } from './chat/config.js'
import { weatherAppConfig } from './weather/config.js'
import { mapsAppConfig } from './maps/config.js'
import { fileManagerAppConfig } from './files/config.js'
import { paintAppConfig } from './paint/config.js'
import { calendarAppConfig } from './calendar/config.js'
import { galleryAppConfig } from './gallery/config.js'
import { photobotAppConfig } from './photobot/config.js'
import { terminalAppConfig } from './terminal/config.js'
import { writeAppConfig } from './write/config.js'
import { calculatorAppConfig } from './calculator/config.js'
import { preferencesAppConfig } from './preferences/config.js'
import { aboutAppConfig } from './about/config.js'
import { wastebasketAppConfig } from './wastebasket/config.js'

const PayamanCalcApp = lazy(() => import('./sheets/index.jsx'))
const PortfolioApp = lazy(() => import('./portfolio/index.jsx'))
const StickyNotesApp = lazy(() => import('./stickynotes/index.jsx'))
const MinesweeperApp = lazy(() => import('./minesweeper/index.jsx'))
const SnakeApp = lazy(() => import('./snake/index.jsx'))
const DesktopPetApp = lazy(() => import('./pet/index.jsx'))
const BrowserApp = lazy(() => import('./browser/index.jsx'))
const ITunesApp = lazy(() => import('./itunes/index.jsx'))
const PayamanChatApp = lazy(() => import('./chat/index.jsx'))
const WeatherApp = lazy(() => import('./weather/index.jsx'))
const MapsApp = lazy(() => import('./maps/index.jsx'))
const FileManagerApp = lazy(() => import('./files/index.jsx'))
const PaintApp = lazy(() => import('./paint/index.jsx'))
const CalendarApp = lazy(() => import('./calendar/index.jsx'))
const GalleryApp = lazy(() => import('./gallery/index.jsx'))
const PhotobotApp = lazy(() => import('./photobot/index.jsx'))
const TerminalApp = lazy(() => import('./terminal/index.jsx'))
const WriteApp = lazy(() => import('./write/index.jsx'))
const CalcApp = lazy(() => import('./calculator/index.jsx'))
const PreferencesApp = lazy(() => import('./preferences/index.jsx'))
const AboutApp = lazy(() => import('./about/index.jsx'))
const WastebasketApp = lazy(() => import('./wastebasket/index.jsx'))

export const appRegistry = [
  {
    ...sheetsAppConfig,
    component: PayamanCalcApp,
  },
  {
    ...portfolioAppConfig,
    component: PortfolioApp,
  },
  {
    ...stickyNotesAppConfig,
    component: StickyNotesApp,
  },
  {
    ...minesweeperAppConfig,
    component: MinesweeperApp,
  },
  {
    ...snakeAppConfig,
    component: SnakeApp,
  },
  {
    ...desktopPetConfig,
    component: DesktopPetApp,
  },
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
