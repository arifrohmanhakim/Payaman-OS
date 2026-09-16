import { useState, useEffect, useCallback, useRef } from 'react'
import { storageService } from '../../services/storageService.js'
import { soundService } from '../../services/soundService.js'
import { DEFAULT_BOOKMARKS, HOME_PAGE_URL, normalizeBrowserUrl } from './bookmarksData.js'

const STORAGE_KEY_BOOKMARKS = 'os_browser_bookmarks'
const STORAGE_KEY_HISTORY = 'os_browser_history'

let tabCounter = 1

export function useBrowser() {
  const [tabs, setTabs] = useState(() => [
    {
      id: 'tab_1',
      title: 'Payaman Portal',
      url: HOME_PAGE_URL,
      inputUrl: '',
      history: [HOME_PAGE_URL],
      historyIndex: 0,
      isLoading: false,
    },
  ])

  const [activeTabId, setActiveTabId] = useState('tab_1')
  const [bookmarks, setBookmarks] = useState(() => {
    return storageService.getItem(STORAGE_KEY_BOOKMARKS, DEFAULT_BOOKMARKS)
  })
  const [historyList, setHistoryList] = useState(() => {
    return storageService.getItem(STORAGE_KEY_HISTORY, [])
  })
  const [isReaderMode, setIsReaderMode] = useState(false)
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const addressInputRef = useRef(null)

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  const canGoBack = activeTab ? activeTab.historyIndex > 0 : false
  const canGoForward = activeTab
    ? activeTab.historyIndex < activeTab.history.length - 1
    : false

  // Sync bookmarks & history
  useEffect(() => {
    storageService.setItem(STORAGE_KEY_BOOKMARKS, bookmarks)
  }, [bookmarks])

  useEffect(() => {
    storageService.setItem(STORAGE_KEY_HISTORY, historyList)
  }, [historyList])

  const navigateTo = useCallback(
    (rawUrl) => {
      const normalized = normalizeBrowserUrl(rawUrl)
      soundService.playClick()
      setIframeBlocked(false)

      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== activeTabId) return tab

          const newHistory = tab.history.slice(0, tab.historyIndex + 1)
          newHistory.push(normalized)

          const displayTitle =
            normalized === HOME_PAGE_URL
              ? 'Payaman Portal'
              : normalized.replace(/^https?:\/\//i, '').split('/')[0]

          return {
            ...tab,
            url: normalized,
            inputUrl: normalized === HOME_PAGE_URL ? '' : normalized,
            title: displayTitle,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isLoading: normalized !== HOME_PAGE_URL,
          }
        })
      )

      if (normalized !== HOME_PAGE_URL && !normalized.startsWith('about:')) {
        setHistoryList((prev) => {
          const filtered = prev.filter((item) => item.url !== normalized)
          return [
            {
              url: normalized,
              title: normalized.replace(/^https?:\/\//i, '').split('/')[0],
              timestamp: Date.now(),
            },
            ...filtered.slice(0, 49),
          ]
        })
      }
    },
    [activeTabId]
  )

  const goBack = useCallback(() => {
    setIframeBlocked(false)
    soundService.playClick()
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex <= 0) return tab
        const nextIndex = tab.historyIndex - 1
        const targetUrl = tab.history[nextIndex]
        return {
          ...tab,
          url: targetUrl,
          inputUrl: targetUrl === HOME_PAGE_URL ? '' : targetUrl,
          historyIndex: nextIndex,
          isLoading: targetUrl !== HOME_PAGE_URL,
        }
      })
    )
  }, [activeTabId])

  const goForward = useCallback(() => {
    setIframeBlocked(false)
    soundService.playClick()
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex >= tab.history.length - 1)
          return tab
        const nextIndex = tab.historyIndex + 1
        const targetUrl = tab.history[nextIndex]
        return {
          ...tab,
          url: targetUrl,
          inputUrl: targetUrl === HOME_PAGE_URL ? '' : targetUrl,
          historyIndex: nextIndex,
          isLoading: targetUrl !== HOME_PAGE_URL,
        }
      })
    )
  }, [activeTabId])

  const reload = useCallback(() => {
    soundService.playClick()
    setIframeBlocked(false)
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return {
          ...tab,
          isLoading: tab.url !== HOME_PAGE_URL,
        }
      })
    )
  }, [activeTabId])

  const goHome = useCallback(() => {
    navigateTo(HOME_PAGE_URL)
  }, [navigateTo])

  const openNewTab = useCallback((initialUrl = HOME_PAGE_URL) => {
    soundService.playClick()
    tabCounter += 1
    const newId = `tab_${tabCounter}_${Date.now()}`
    const normalized = normalizeBrowserUrl(initialUrl)
    const newTabObj = {
      id: newId,
      title: normalized === HOME_PAGE_URL ? 'New Tab' : normalized.replace(/^https?:\/\//i, '').split('/')[0],
      url: normalized,
      inputUrl: normalized === HOME_PAGE_URL ? '' : normalized,
      history: [normalized],
      historyIndex: 0,
      isLoading: normalized !== HOME_PAGE_URL,
    }

    setTabs((prev) => [...prev, newTabObj])
    setActiveTabId(newId)
    setIframeBlocked(false)
  }, [])

  const closeTab = useCallback((targetTabId) => {
    soundService.playClick()
    setTabs((prevTabs) => {
      if (prevTabs.length <= 1) {
        // Jangan hapus jika hanya ada 1 tab tersisa, reset ke Home
        return [
          {
            id: prevTabs[0].id,
            title: 'Payaman Portal',
            url: HOME_PAGE_URL,
            inputUrl: '',
            history: [HOME_PAGE_URL],
            historyIndex: 0,
            isLoading: false,
          },
        ]
      }

      const nextTabs = prevTabs.filter((t) => t.id !== targetTabId)
      return nextTabs
    })

    setActiveTabId((currentActive) => {
      if (currentActive === targetTabId) {
        return tabs.length > 1 ? tabs.find((t) => t.id !== targetTabId)?.id || tabs[0].id : currentActive
      }
      return currentActive
    })
  }, [tabs])

  const setTabLoaded = useCallback((tabId) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => (t.id === tabId ? { ...t, isLoading: false } : t))
    )
  }, [])

  const isBookmarked = useCallback(
    (url) => {
      if (!url || url === HOME_PAGE_URL) return false
      return bookmarks.some((b) => b.url === url)
    },
    [bookmarks]
  )

  const toggleBookmark = useCallback(() => {
    if (!activeTab || !activeTab.url || activeTab.url === HOME_PAGE_URL) return
    soundService.playClick()

    setBookmarks((prev) => {
      const exists = prev.some((b) => b.url === activeTab.url)
      if (exists) {
        return prev.filter((b) => b.url !== activeTab.url)
      }
      return [
        ...prev,
        {
          id: `bm_${Date.now()}`,
          title: activeTab.title || 'Saved Bookmark',
          url: activeTab.url,
          icon: '🔖',
          category: 'Personal',
        },
      ]
    })
  }, [activeTab])

  const openInExternal = useCallback((url) => {
    const target = url || activeTab?.url
    if (!target || target === HOME_PAGE_URL) return
    window.open(target, '_blank', 'noopener,noreferrer')
  }, [activeTab])

  // Listener menu actions
  useEffect(() => {
    const handleMenuAction = (e) => {
      const action = e.detail?.action
      if (!action || !action.startsWith('browser:')) return

      switch (action) {
        case 'browser:new_tab':
          openNewTab()
          break
        case 'browser:close_tab':
          if (activeTabId) closeTab(activeTabId)
          break
        case 'browser:reload':
          reload()
          break
        case 'browser:home':
          goHome()
          break
        case 'browser:back':
          if (canGoBack) goBack()
          break
        case 'browser:forward':
          if (canGoForward) goForward()
          break
        case 'browser:bookmark':
          toggleBookmark()
          break
        case 'browser:open_external':
          openInExternal()
          break
        case 'browser:focus_address':
          addressInputRef.current?.focus()
          addressInputRef.current?.select()
          break
        default:
          break
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [
    openNewTab,
    closeTab,
    activeTabId,
    reload,
    goHome,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    toggleBookmark,
    openInExternal,
  ])

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    canGoBack,
    canGoForward,
    bookmarks,
    historyList,
    isReaderMode,
    setIsReaderMode,
    iframeBlocked,
    setIframeBlocked,
    addressInputRef,
    navigateTo,
    goBack,
    goForward,
    reload,
    goHome,
    openNewTab,
    closeTab,
    setTabLoaded,
    isBookmarked,
    toggleBookmark,
    openInExternal,
  }
}
