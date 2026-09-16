import { useState, useMemo } from 'react'
import Button from '../../components/ui/Button.jsx'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'
import { getAboutInfo, SYSTEM_INFO } from './appInfoData.js'

export default function AboutApp({ onClose, windowData }) {
  const [selectedAppId, setSelectedAppId] = useState(
    windowData?.targetAppId || 'system'
  )
  const [systemTab, setSystemTab] = useState(
    windowData?.initialTab === 'help' ? 'specs' : 'overview'
  )

  const currentInfo = useMemo(() => {
    return getAboutInfo(selectedAppId)
  }, [selectedAppId])

  const isSystem = currentInfo.isSystem

  return (
    <div className="flex flex-col h-full font-mono text-[var(--os-fg)] text-xs select-none">
      {/* Header Info */}
      <div className="flex items-center gap-3 p-3 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)]">
        <div className="w-14 h-14 border-2 border-[var(--os-border)] flex items-center justify-center shrink-0 bg-[var(--os-bg)]">
          {isSystem ? (
            <span className="text-3xl font-bold tracking-tighter"></span>
          ) : (
            <AppIconGraphic iconType={currentInfo.iconType} className="w-9 h-9" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold truncate">
              {isSystem ? SYSTEM_INFO.name : currentInfo.title}
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 border border-[var(--os-border)] opacity-80 shrink-0">
              v{currentInfo.version}
            </span>
          </div>
          <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">
            {currentInfo.tagline}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
            <span>{isSystem ? SYSTEM_INFO.architecture : currentInfo.category}</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs for System */}
      {isSystem && (
        <div className="flex border-b border-[var(--os-border)] bg-[var(--os-bg)]">
          {['overview', 'specs', 'credits'].map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setSystemTab(tabKey)}
              className={`flex-1 py-1 text-[11px] font-bold text-center capitalize border-r last:border-r-0 border-[var(--os-border)] ${
                systemTab === tabKey
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                  : 'hover:bg-[var(--os-fg)]/10'
              }`}
            >
              {tabKey}
            </button>
          ))}
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--os-bg)]">
        {isSystem ? (
          <>
            {systemTab === 'overview' && (
              <div className="space-y-3">
                <p className="text-[11px] leading-relaxed opacity-85">
                  Payaman OS is a retro-modern monochrome desktop operating system built
                  with clean modular components, a virtual file system, and native cloud
                  storage integration.
                </p>

                <div className="border border-[var(--os-border)] divide-y divide-[var(--os-border)] text-[11px]">
                  <div className="flex justify-between px-2.5 py-1">
                    <span className="opacity-70">Architecture:</span>
                    <span className="font-bold">{SYSTEM_INFO.architecture}</span>
                  </div>
                  <div className="flex justify-between px-2.5 py-1">
                    <span className="opacity-70">Build Identifier:</span>
                    <span className="font-bold">{SYSTEM_INFO.build}</span>
                  </div>
                  <div className="flex justify-between px-2.5 py-1">
                    <span className="opacity-70">UI Runtime:</span>
                    <span className="font-bold">React 19 + Tailwind v4</span>
                  </div>
                  <div className="flex justify-between px-2.5 py-1">
                    <span className="opacity-70">Window Session:</span>
                    <span className="font-bold">Persistent LocalStorage</span>
                  </div>
                </div>
              </div>
            )}

            {systemTab === 'specs' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Virtual Hardware & Subsystems
                </div>
                <div className="border border-[var(--os-border)] divide-y divide-[var(--os-border)] text-[11px]">
                  {SYSTEM_INFO.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex justify-between items-center px-2.5 py-1"
                    >
                      <span className="opacity-70">{spec.label}:</span>
                      <span className="font-bold text-right truncate ml-2">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {systemTab === 'credits' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Engineering & Open Source
                </div>
                <div className="border border-[var(--os-border)] divide-y divide-[var(--os-border)] text-[11px]">
                  {SYSTEM_INFO.credits.map((item) => (
                    <div
                      key={item.role}
                      className="flex justify-between items-center px-2.5 py-1"
                    >
                      <span className="opacity-70">{item.role}:</span>
                      <span className="font-bold text-right">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] leading-relaxed opacity-85">
              {currentInfo.description}
            </p>

            {currentInfo.specs && currentInfo.specs.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Application Specs
                </div>
                <div className="border border-[var(--os-border)] divide-y divide-[var(--os-border)] text-[11px]">
                  {currentInfo.specs.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center px-2.5 py-1"
                    >
                      <span className="opacity-70">{item.label}:</span>
                      <span className="font-bold text-right truncate ml-2">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentInfo.shortcuts && currentInfo.shortcuts.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Primary Shortcuts
                </div>
                <div className="border border-[var(--os-border)] divide-y divide-[var(--os-border)] text-[11px]">
                  {currentInfo.shortcuts.map((sc) => (
                    <div
                      key={sc.key}
                      className="flex justify-between items-center px-2.5 py-1"
                    >
                      <span className="font-bold border border-[var(--os-border)] px-1 py-0.2 bg-[var(--os-bg)] text-[10px]">
                        {sc.key}
                      </span>
                      <span className="opacity-80 text-right">{sc.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between p-2.5 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] gap-2">
        {!isSystem ? (
          <Button
            variant="secondary"
            className="text-xs py-1 px-2.5"
            onClick={() => setSelectedAppId('system')}
          >
             Payaman OS Info
          </Button>
        ) : (
          <div className="text-[10px] opacity-60">
            Payaman OS © 2026
          </div>
        )}

        {onClose && (
          <Button
            variant="primary"
            className="text-xs py-1 px-4 min-w-16"
            onClick={onClose}
          >
            OK
          </Button>
        )}
      </div>
    </div>
  )
}
