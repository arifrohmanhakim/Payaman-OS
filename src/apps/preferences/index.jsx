import { useState } from "react";
import Panel from "../../components/ui/Panel.jsx";
import Button from "../../components/ui/Button.jsx";
import Checkbox from "../../components/ui/Checkbox.jsx";
import { useOS } from "../../hooks/useOS.js";
import { soundService } from "../../services/soundService.js";
import { storageService } from "../../services/storageService.js";
import { THEMES, PATTERNS } from "../../constants/theme.js";
import { DOCK_SIZES, DOCK_POSITIONS } from "../../constants/dock.js";

const PREF_KEY_SOUND = "sound_enabled";

export default function PreferencesApp() {
  const [activeTab, setActiveTab] = useState("appearance");
  const {
    theme,
    pattern,
    customWallpaper,
    dockSettings,
    setTheme,
    setPattern,
    clearCustomWallpaper,
    updateDockSettings,
  } = useOS();

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return storageService.getItem(PREF_KEY_SOUND, true);
  });

  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled);
    soundService.setSoundEnabled(enabled);
    storageService.setItem(PREF_KEY_SOUND, enabled);
    if (enabled) {
      soundService.playClick();
    }
  };

  const handleTestBeep = () => {
    soundService.playBeep(880, 0.1);
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-xs text-[var(--os-fg)]">
      <nav className="flex border-b-2 border-[var(--os-border)] -mx-3 -mt-3 px-3 pt-1 bg-[var(--os-bg)] gap-1">
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            setActiveTab("appearance");
          }}
          className={`px-3 py-1.5 font-bold border-t-2 border-x-2 border-[var(--os-border)] transition-none ${
            activeTab === "appearance"
              ? "bg-[var(--os-bg)] text-[var(--os-fg)] -mb-[2px] border-b-2 border-b-[var(--os-bg)]"
              : "bg-[var(--os-bg)]/40 text-[var(--os-fg)]/70 hover:text-[var(--os-fg)]"
          }`}
        >
          Appearance
        </button>
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            setActiveTab("dock");
          }}
          className={`px-3 py-1.5 font-bold border-t-2 border-x-2 border-[var(--os-border)] transition-none ${
            activeTab === "dock"
              ? "bg-[var(--os-bg)] text-[var(--os-fg)] -mb-[2px] border-b-2 border-b-[var(--os-bg)]"
              : "bg-[var(--os-bg)]/40 text-[var(--os-fg)]/70 hover:text-[var(--os-fg)]"
          }`}
        >
          Dock
        </button>
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            setActiveTab("sound");
          }}
          className={`px-3 py-1.5 font-bold border-t-2 border-x-2 border-[var(--os-border)] transition-none ${
            activeTab === "sound"
              ? "bg-[var(--os-bg)] text-[var(--os-fg)] -mb-[2px] border-b-2 border-b-[var(--os-bg)]"
              : "bg-[var(--os-bg)]/40 text-[var(--os-fg)]/70 hover:text-[var(--os-fg)]"
          }`}
        >
          Sound
        </button>
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            setActiveTab("system");
          }}
          className={`px-3 py-1.5 font-bold border-t-2 border-x-2 border-[var(--os-border)] transition-none ${
            activeTab === "system"
              ? "bg-[var(--os-bg)] text-[var(--os-fg)] -mb-[2px] border-b-2 border-b-[var(--os-bg)]"
              : "bg-[var(--os-bg)]/40 text-[var(--os-fg)]/70 hover:text-[var(--os-fg)]"
          }`}
        >
          System
        </button>
      </nav>

      {activeTab === "appearance" && (
        <div className="flex-1 overflow-auto space-y-4 pr-1">
          <Panel title="Live Preview">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div
                className={`w-48 h-32 border-2 border-[var(--os-border)] ${
                  customWallpaper ? 'bg-cover bg-center' : `pattern-${pattern || 'halftone'}`
                } p-2 flex items-center justify-center relative overflow-hidden`}
                style={customWallpaper ? { backgroundImage: `url(${customWallpaper})` } : {}}
              >
                <div className="w-36 bg-[var(--os-bg)] border border-[var(--os-border)] os-window-shadow relative z-10">
                  <div className="h-4 border-b border-[var(--os-border)] os-titlebar-stripes flex items-center justify-between px-1">
                    <span className="w-2 h-2 border border-[var(--os-border)] bg-[var(--os-bg)]" />
                    <span className="text-[9px] font-bold bg-[var(--os-bg)] px-1">
                      Payaman
                    </span>
                    <span className="w-2" />
                  </div>
                  <div className="p-1.5 text-[9px] text-center space-y-1">
                    <div>Payaman OS</div>
                    <div className="px-1 py-0.5 border border-[var(--os-border)] inline-block text-[8px] font-bold">
                      Button
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-[11px] space-y-1.5 opacity-80">
                <p>
                  <strong>Active Theme:</strong>{' '}
                  {THEMES.find((t) => t.id === (theme || 'classic'))?.name}
                </p>
                <p>
                  <strong>Background Mode:</strong>{' '}
                  {customWallpaper ? 'Custom Wallpaper (Photo)' : (
                    PATTERNS.find((p) => p.id === (pattern || 'halftone'))?.name
                  )}
                </p>
                {customWallpaper && (
                  <div>
                    <Button
                      variant="default"
                      onClick={clearCustomWallpaper}
                      className="text-[10px] py-0.5 px-2"
                    >
                      Restore Default Pattern
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-neutral-500 pt-1">
                  Changes are instantly applied across desktop and saved to local storage.
                </p>
              </div>
            </div>
          </Panel>
          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1">
              <span className="font-bold">Screen Theme (Color Palette)</span>
              <span className="text-[10px] opacity-60">
                Select CRT display palette
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((item) => {
                const isCurrentTheme = (theme || "classic") === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`p-2 border-2 border-[var(--os-border)] text-left flex flex-col justify-between h-20 transition-none ${
                      isCurrentTheme
                        ? "bg-[var(--os-fg)] text-[var(--os-bg)] ring-1 ring-[var(--os-fg)] ring-offset-1"
                        : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-bold leading-tight">
                        {item.name}
                      </span>
                      {isCurrentTheme && (
                        <span className="text-[10px] font-bold">✓</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] line-clamp-2 ${
                        isCurrentTheme ? "opacity-80" : "opacity-60"
                      }`}
                    >
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1">
              <span className="font-bold">
                Desktop Background Pattern
              </span>
              <span className="text-[10px] opacity-60">
                Payaman OS 1-bit monochrome textures
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PATTERNS.map((p) => {
                const isCurrentPattern = (pattern || "halftone") === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      clearCustomWallpaper();
                      setPattern(p.id);
                    }}
                    className={`border-2 border-[var(--os-border)] p-1 flex flex-col items-center gap-1.5 transition-none ${
                      isCurrentPattern
                        ? "ring-2 ring-[var(--os-fg)] ring-offset-1 bg-[var(--os-fg)] text-[var(--os-bg)]"
                        : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                    }`}
                  >
                    <div
                      className={`w-full h-10 border border-[var(--os-border)] pattern-${p.id}`}
                    />
                    <span className="text-[10px] font-bold truncate w-full text-center">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === "dock" && (
        <div className="flex-1 overflow-auto space-y-4 pr-1">
          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1">
              <span className="font-bold">Dock Icon Size</span>
              <span className="text-[10px] opacity-60">
                Select icon scale for dock
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DOCK_SIZES.map((s) => {
                const isCurrent = (dockSettings?.size || "medium") === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateDockSettings({ size: s.id })}
                    className={`p-2 border-2 border-[var(--os-border)] flex flex-col items-center justify-center gap-1 transition-none cursor-default ${
                      isCurrent
                        ? "bg-[var(--os-fg)] text-[var(--os-bg)] ring-1 ring-[var(--os-fg)] ring-offset-1"
                        : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                    }`}
                  >
                    <span className="font-bold">{s.name}</span>
                    <span className="text-[10px] opacity-70">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1">
              <span className="font-bold">Screen Position</span>
              <span className="text-[10px] opacity-60">
                Dock placement on desktop
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DOCK_POSITIONS.map((pos) => {
                const isCurrent =
                  (dockSettings?.position || "bottom") === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => updateDockSettings({ position: pos.id })}
                    className={`p-2 border-2 border-[var(--os-border)] flex flex-col items-center justify-center gap-1 transition-none cursor-default ${
                      isCurrent
                        ? "bg-[var(--os-fg)] text-[var(--os-bg)] ring-1 ring-[var(--os-fg)] ring-offset-1"
                        : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                    }`}
                  >
                    <span className="font-bold">{pos.name}</span>
                    <span className="text-[10px] opacity-70 text-center">
                      {pos.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <Panel title="Dock Behavior & Effects">
            <div className="space-y-3">
              <Checkbox
                checked={Boolean(dockSettings?.autoHide)}
                onChange={(checked) =>
                  updateDockSettings({ autoHide: checked })
                }
                label="Auto-hide Dock"
              />
              <Checkbox
                checked={Boolean(dockSettings?.magnification)}
                onChange={(checked) =>
                  updateDockSettings({ magnification: checked })
                }
                label="Magnification Effect on Hover"
              />
              <Checkbox
                checked={Boolean(dockSettings?.showIndicators ?? true)}
                onChange={(checked) =>
                  updateDockSettings({ showIndicators: checked })
                }
                label="Show Running Application Indicators (Dots)"
              />
            </div>
          </Panel>

          <Panel title="Dock Preview">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-56 h-36 border-2 border-[var(--os-border)] bg-[var(--os-desktop-bg)] relative flex items-center justify-center overflow-hidden">
                <div
                  className={`border border-[var(--os-border)] bg-[var(--os-bg)] flex gap-1 p-1 shadow-[1px_1px_0px_var(--os-shadow)] ${
                    dockSettings?.position === "left"
                      ? "absolute left-1 flex-col"
                      : dockSettings?.position === "right"
                        ? "absolute right-1 flex-col"
                        : "absolute bottom-1 flex-row"
                  }`}
                >
                  <div className="w-3 h-3 border border-current flex items-center justify-center text-[6px]">
                    1
                  </div>
                  <div className="w-3 h-3 border border-current flex items-center justify-center text-[6px]">
                    2
                  </div>
                  <div className="w-3 h-3 border border-current flex items-center justify-center text-[6px]">
                    3
                  </div>
                  <div className="w-px bg-current opacity-30 mx-0.5" />
                  <div className="w-3 h-3 border border-current flex items-center justify-center text-[6px]">
                    🗑
                  </div>
                </div>
              </div>
              <div className="flex-1 text-[11px] space-y-1 opacity-80">
                <p>
                  <strong>Size:</strong>{" "}
                  {
                    DOCK_SIZES.find(
                      (s) => s.id === (dockSettings?.size || "medium"),
                    )?.name
                  }{" "}
                  (
                  {
                    DOCK_SIZES.find(
                      (s) => s.id === (dockSettings?.size || "medium"),
                    )?.label
                  }
                  )
                </p>
                <p>
                  <strong>Position:</strong>{" "}
                  {
                    DOCK_POSITIONS.find(
                      (p) => p.id === (dockSettings?.position || "bottom"),
                    )?.name
                  }
                </p>
                <p>
                  <strong>Auto-hide:</strong>{" "}
                  {dockSettings?.autoHide ? "Active" : "Disabled"}
                </p>
                <p>
                  <strong>Magnification:</strong>{" "}
                  {dockSettings?.magnification ? "Active" : "Disabled"}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "sound" && (
        <div className="flex-1 overflow-auto space-y-4">
          <Panel title="System Sound Settings">
            <div className="space-y-3">
              <Checkbox
                checked={soundEnabled}
                onChange={handleToggleSound}
                label="Enable System Beep Sound (Bell)"
              />
              <div>
                <Button onClick={handleTestBeep} disabled={!soundEnabled}>
                  Test Beep Sound
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "system" && (
        <div className="flex-1 overflow-auto space-y-4">
          <Panel title="Payaman OS Environment Info">
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-[var(--os-border)] pb-1">
                <span>OS Version:</span>
                <span className="font-bold">Payaman OS 1.0 (Web Edition)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--os-border)] pb-1">
                <span>Environment:</span>
                <span className="font-bold">
                  Modern Web Desktop Environment
                </span>
              </div>
              <div className="flex justify-between border-b border-[var(--os-border)] pb-1">
                <span>Local Storage:</span>
                <span className="font-bold">Browser LocalStorage (Active)</span>
              </div>
            </div>
          </Panel>
        </div>
      )}

      <footer className="border-t border-[var(--os-border)] pt-2 flex justify-between items-center text-[10px] opacity-60">
        <span>Preferences saved automatically</span>
        <span>Payaman OS Control Panel</span>
      </footer>
    </div>
  );
}
