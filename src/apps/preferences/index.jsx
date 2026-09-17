import { useState, useRef, useEffect, useCallback } from "react";
import Panel from "../../components/ui/Panel.jsx";
import Button from "../../components/ui/Button.jsx";
import Checkbox from "../../components/ui/Checkbox.jsx";
import { useOS } from "../../hooks/useOS.js";
import { soundService } from "../../services/soundService.js";
import { storageService } from "../../services/storageService.js";
import { THEMES, PATTERNS, THEME_PRESETS } from "../../constants/theme.js";
import { DOCK_SIZES, DOCK_POSITIONS } from "../../constants/dock.js";
import { DISPLAY_SCALES } from "../../constants/display.js";

function TabIcon({ type, className = "w-3.5 h-3.5" }) {
  switch (type) {
    case "appearance":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <rect x="2" y="2" width="12" height="12" />
          <line x1="2" y1="6" x2="14" y2="6" strokeDasharray="1 1" />
          <rect x="4" y="8" width="3" height="4" fill="currentColor" />
          <rect x="9" y="8" width="3" height="4" />
        </svg>
      );
    case "dock":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <rect x="2" y="10" width="12" height="4" />
          <circle cx="5" cy="12" r="0.75" fill="currentColor" />
          <circle cx="8" cy="12" r="0.75" fill="currentColor" />
          <circle cx="11" cy="12" r="0.75" fill="currentColor" />
        </svg>
      );
    case "display":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <rect x="2" y="2" width="12" height="9" />
          <line x1="8" y1="11" x2="8" y2="14" />
          <line x1="5" y1="14" x2="11" y2="14" />
        </svg>
      );
    case "screensaver":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6" />
        </svg>
      );
    case "sound":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <polygon
            points="6 4 3 6 1 6 1 10 3 10 6 12 6 4"
            fill="currentColor"
            stroke="none"
          />
          <path d="M9 5.5 a 3 3 0 0 1 0 5" strokeLinecap="round" />
          <path d="M12 3.5 a 6 6 0 0 1 0 9" strokeLinecap="round" />
        </svg>
      );
    case "system":
      return (
        <svg
          className={`${className} stroke-current fill-none stroke-[1.5]`}
          viewBox="0 0 16 16"
        >
          <rect x="4" y="4" width="8" height="8" />
          <line x1="2" y1="6" x2="4" y2="6" />
          <line x1="2" y1="10" x2="4" y2="10" />
          <line x1="12" y1="6" x2="14" y2="6" />
          <line x1="12" y1="10" x2="14" y2="10" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="6" y1="12" x2="6" y2="14" />
          <line x1="10" y1="12" x2="10" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

const PREF_KEY_SOUND = "sound_enabled";

const PREFERENCE_TABS = [
  { id: "appearance", label: "Appearance" },
  { id: "dock", label: "Dock" },
  { id: "display", label: "Display" },
  { id: "screensaver", label: "Screen Saver" },
  { id: "sound", label: "Sound" },
  { id: "system", label: "System" },
];

export default function PreferencesApp({ windowData }) {
  const [activeTab, setActiveTab] = useState(
    windowData?.initialTab || "appearance",
  );
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const handleScroll = (direction) => {
    soundService.playClick();
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 120;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const {
    theme,
    customThemeColors,
    pattern,
    customWallpaper,
    dockSettings,
    displaySettings,
    setTheme,
    setCustomThemeColors,
    setPattern,
    clearCustomWallpaper,
    updateDockSettings,
    updateDisplaySettings,
    screenSaverMode,
    screenSaverTimeoutMinutes,
    setScreenSaverMode,
    setScreenSaverTimeoutMinutes,
    startScreenSaver,
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
      <nav className="flex items-end border-b-2 border-[var(--os-border)] -mx-3 -mt-3 px-3 bg-[var(--os-bg)] relative z-10">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-1 overflow-x-hidden select-none flex-1 items-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PREFERENCE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-none cursor-pointer whitespace-nowrap relative shrink-0 ${
                  isActive
                    ? "bg-[var(--os-bg)] text-[var(--os-fg)] border-t-2 border-x-2 border-[var(--os-border)] font-bold -mb-[2px] z-20"
                    : "bg-transparent text-[var(--os-fg)]/60 hover:text-[var(--os-fg)] border-t-2 border-x-2 border-transparent z-0"
                }`}
              >
                <TabIcon type={tab.id} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 ml-2 pb-1 shrink-0">
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => handleScroll("left")}
            className="w-5 h-5 flex items-center justify-center border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] text-[10px] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:enabled:bg-[var(--os-fg)]/10 active:enabled:bg-[var(--os-fg)]/20 cursor-pointer"
          >
            ◀
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => handleScroll("right")}
            className="w-5 h-5 flex items-center justify-center border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] text-[10px] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:enabled:bg-[var(--os-fg)]/10 active:enabled:bg-[var(--os-fg)]/20 cursor-pointer"
          >
            ▶
          </button>
        </div>
      </nav>

      {activeTab === "appearance" && (
        <div className="flex-1 overflow-auto space-y-4 pr-1">
          <Panel title="Live Preview & Theme Palette">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Left Column: Mini Monitor Live Preview */}
              <div className="w-full sm:w-48 shrink-0 flex flex-col items-center">
                <div
                  className={`w-full h-32 border-2 border-[var(--os-border)] ${
                    customWallpaper
                      ? "bg-cover bg-center"
                      : `pattern-${pattern || "halftone"}`
                  } p-2 flex items-center justify-center relative overflow-hidden`}
                  style={{
                    ...(customWallpaper ? { backgroundImage: `url(${customWallpaper})` } : {}),
                    ...(theme === "custom" && customThemeColors
                      ? {
                          "--os-fg": customThemeColors.fg,
                          "--os-bg": customThemeColors.bg,
                          "--os-desktop-bg": customThemeColors.desktopBg,
                          "--os-border": customThemeColors.fg,
                          "--os-shadow": customThemeColors.fg,
                        }
                      : {}),
                  }}
                >
                  <div className="w-36 bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] os-window-shadow relative z-10">
                    <div className="h-4 border-b border-[var(--os-border)] os-titlebar-stripes flex items-center justify-between px-1">
                      <span className="w-2 h-2 border border-[var(--os-border)] bg-[var(--os-bg)]" />
                      <span className="text-[9px] font-bold bg-[var(--os-bg)] px-1 truncate">
                        Payaman OS
                      </span>
                      <span className="w-2" />
                    </div>
                    <div className="p-1.5 text-[9px] text-center space-y-1">
                      <div>CRT Display</div>
                      <div className="px-1.5 py-0.5 border border-[var(--os-border)] inline-block text-[8px] font-bold">
                        Button
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] opacity-60 mt-1.5 text-center">
                  Preview: {THEMES.find((t) => t.id === (theme || "classic"))?.name}
                </span>
              </div>

              {/* Right Column: Theme Dropdown & Custom Color Creator */}
              <div className="flex-1 w-full space-y-3">
                {/* Theme Selector Dropdown */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="theme-select" className="font-bold text-xs">
                      Screen Theme (Color Palette)
                    </label>
                    <span className="text-[10px] opacity-60">Pilih tema CRT</span>
                  </div>

                  <select
                    id="theme-select"
                    value={theme || "classic"}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] font-bold text-xs focus:outline-none cursor-pointer shadow-[2px_2px_0px_var(--os-shadow)]"
                  >
                    {THEMES.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="bg-[var(--os-bg)] text-[var(--os-fg)] font-bold"
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Color Creator (Shown when theme === 'custom') */}
                {theme === "custom" && (
                  <div className="p-2.5 border-2 border-[var(--os-border)] bg-[var(--os-fg)]/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">🎨 DIY Custom Palette Creator</span>
                      <span className="text-[9px] opacity-70">Atur warna sesukamu</span>
                    </div>

                    {/* Color Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Foreground / Text */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block opacity-80">
                          Text &amp; Line (FG)
                        </label>
                        <div className="flex items-center gap-1.5 border border-[var(--os-border)] p-1 bg-[var(--os-bg)]">
                          <input
                            type="color"
                            value={customThemeColors?.fg || "#00ffcc"}
                            onChange={(e) => setCustomThemeColors({ fg: e.target.value })}
                            className="w-5 h-5 border border-[var(--os-border)] cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={customThemeColors?.fg || "#00ffcc"}
                            onChange={(e) => setCustomThemeColors({ fg: e.target.value })}
                            className="w-full text-[10px] bg-transparent font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Window Background */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block opacity-80">
                          Window Surface (BG)
                        </label>
                        <div className="flex items-center gap-1.5 border border-[var(--os-border)] p-1 bg-[var(--os-bg)]">
                          <input
                            type="color"
                            value={customThemeColors?.bg || "#0a1917"}
                            onChange={(e) => setCustomThemeColors({ bg: e.target.value })}
                            className="w-5 h-5 border border-[var(--os-border)] cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={customThemeColors?.bg || "#0a1917"}
                            onChange={(e) => setCustomThemeColors({ bg: e.target.value })}
                            className="w-full text-[10px] bg-transparent font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Desktop Background */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold block opacity-80">
                          Desktop Canvas
                        </label>
                        <div className="flex items-center gap-1.5 border border-[var(--os-border)] p-1 bg-[var(--os-bg)]">
                          <input
                            type="color"
                            value={customThemeColors?.desktopBg || "#050d0c"}
                            onChange={(e) => setCustomThemeColors({ desktopBg: e.target.value })}
                            className="w-5 h-5 border border-[var(--os-border)] cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={customThemeColors?.desktopBg || "#050d0c"}
                            onChange={(e) => setCustomThemeColors({ desktopBg: e.target.value })}
                            className="w-full text-[10px] bg-transparent font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Vintage Presets */}
                    <div className="space-y-1 pt-1 border-t border-[var(--os-border)]/30">
                      <span className="text-[9px] opacity-70 font-bold block">Quick Retro Color Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {THEME_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              soundService.playClick();
                              setCustomThemeColors({
                                fg: preset.fg,
                                bg: preset.bg,
                                desktopBg: preset.desktopBg,
                              });
                            }}
                            className="px-1.5 py-0.5 border border-[var(--os-border)] text-[9px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer flex items-center gap-1 bg-[var(--os-bg)]"
                          >
                            <span
                              className="w-2 h-2 rounded-full border border-current shrink-0"
                              style={{ backgroundColor: preset.fg }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Background Mode & Wallpaper status */}
                <div className="space-y-1 text-[11px] opacity-80 pt-1">
                  <p>
                    <strong>Background Texture:</strong>{" "}
                    {customWallpaper
                      ? "Custom Photo Wallpaper"
                      : PATTERNS.find((p) => p.id === (pattern || "halftone"))?.name}
                  </p>
                  {customWallpaper && (
                    <div className="pt-1">
                      <Button
                        variant="default"
                        onClick={clearCustomWallpaper}
                        className="text-[10px] py-0.5 px-2"
                      >
                        Restore Default Pattern
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1">
              <span className="font-bold">Desktop Background Pattern</span>
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
                    className={`border-2 border-[var(--os-border)] p-1 flex flex-col items-center gap-1.5 transition-none cursor-pointer ${
                      isCurrentPattern
                        ? "ring-2 ring-[var(--os-fg)] ring-offset-1 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold"
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
                  <div className="w-3 h-3 border border-current flex items-center justify-center text-[6px] font-bold">
                    T
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

      {activeTab === "display" && (
        <div className="flex-1 overflow-auto space-y-4">
          <Panel title="Ukuran Resolusi Tampilan (UI Scale)">
            <div className="space-y-3">
              <div className="text-[11px] opacity-75">
                Pilih ukuran skala resolusi antarmuka untuk mengatur besar/kecil
                seluruh tampilan sistem:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DISPLAY_SCALES.map((item) => {
                  const isCurrent =
                    (displaySettings?.scale ?? 1.15) === item.scale;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        updateDisplaySettings({ scale: item.scale });
                        soundService.playClick();
                      }}
                      className={`p-2.5 text-left border-2 cursor-pointer transition-all ${
                        isCurrent
                          ? "border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] font-bold"
                          : "border-[var(--os-border)]/50 bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.name}</span>
                        {isCurrent && <span className="text-xs">✓</span>}
                      </div>
                      <div className="text-[9px] opacity-75 mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel title="Informasi Resolusi Monitor">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="opacity-60">Resolusi Layar Fisik:</span>{" "}
                <strong>
                  {typeof window !== "undefined"
                    ? `${window.screen?.width || 0} × ${window.screen?.height || 0} px`
                    : "Unknown"}
                </strong>
              </div>
              <div>
                <span className="opacity-60">Resolusi Viewport:</span>{" "}
                <strong>
                  {typeof window !== "undefined"
                    ? `${window.innerWidth} × ${window.innerHeight} px`
                    : "Unknown"}
                </strong>
              </div>
              <div>
                <span className="opacity-60">Device Pixel Ratio:</span>{" "}
                <strong>
                  {typeof window !== "undefined"
                    ? `${window.devicePixelRatio || 1}x`
                    : "1x"}
                </strong>
              </div>
              <div>
                <span className="opacity-60">Skala Aktif:</span>{" "}
                <strong>
                  {Math.round((displaySettings?.scale || 1.0) * 100)}%
                </strong>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "screensaver" && (
        <div className="flex-1 overflow-auto space-y-4">
          <Panel title="Screen Saver Style">
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "matrix",
                  name: "Matrix Rain",
                  desc: "Monochrome digital code rain",
                },
                {
                  id: "starfield",
                  name: "Starfield",
                  desc: "3D retro warp drive flight",
                },
                {
                  id: "bounce",
                  name: "Payaman Bounce",
                  desc: "Bouncing retro logo animation",
                },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setScreenSaverMode(style.id);
                    soundService.playClick();
                  }}
                  className={`p-2.5 text-left border-2 cursor-pointer transition-all ${
                    screenSaverMode === style.id
                      ? "border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] font-bold"
                      : "border-[var(--os-border)]/50 bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)]/10"
                  }`}
                >
                  <div className="text-xs">{style.name}</div>
                  <div className="text-[9px] opacity-75 mt-0.5">
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Idle Activation & Test">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Start Screen Saver after inactivity:</span>
                <div className="flex items-center gap-1">
                  {[
                    { mins: 1, label: "1 min" },
                    { mins: 3, label: "3 min" },
                    { mins: 5, label: "5 min" },
                    { mins: 0, label: "Never" },
                  ].map((t) => (
                    <button
                      key={t.mins}
                      type="button"
                      onClick={() => {
                        setScreenSaverTimeoutMinutes(t.mins);
                        soundService.playClick();
                      }}
                      className={`px-2 py-1 text-[11px] border cursor-pointer font-bold ${
                        screenSaverTimeoutMinutes === t.mins
                          ? "bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]"
                          : "border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--os-border)]/30 flex justify-between items-center">
                <span className="text-[11px] opacity-70">
                  Preview current screen saver now:
                </span>
                <Button onClick={startScreenSaver}>
                  Start Screen Saver Now
                </Button>
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
