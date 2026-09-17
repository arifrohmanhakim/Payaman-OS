import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOS } from "../hooks/useOS.js";
import { getAppById } from "../apps/appRegistry.js";
import { getMenuBarConfig } from "./menuBarConfig.js";
import { useWeather } from "../apps/weather/useWeather.js";
import { soundService } from "../services/soundService.js";
import AppIconGraphic from "./common/AppIconGraphic.jsx";
import CaveLogo from "./common/CaveLogo.jsx";
import { useDesktopPet } from "../apps/pet/useDesktopPet.js";
import { PET_SPECIES } from "../apps/pet/petData.js";

export default function MenuBar({ onSelectMenuAction }) {
  const { windows, activeWindowId } = useOS();
  const { weatherData, location, formatTemp } = useWeather();
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [activeStatusPopup, setActiveStatusPopup] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState("Payaman_5G");
  
  const [isBluetoothOn, setIsBluetoothOn] = useState(true);
  const [isMuted, setIsMuted] = useState(!soundService.getSoundEnabled());
  const [volume, setVolume] = useState(80);

  const {
    petState,
    currentSpecies,
    setPetId,
    toggleVisibility,
    feedPet,
    playWithPet,
    toggleSleep,
    patPet,
  } = useDesktopPet();

  const menuBarRef = useRef(null);

  const activeWindow = windows.find(
    (w) => w.id === activeWindowId && !w.isMinimized,
  );
  const activeAppId = activeWindow ? activeWindow.appId : null;
  const activeApp = activeAppId ? getAppById(activeAppId) : null;
  const activeAppTitle = activeApp ? activeApp.title : null;

  const menuItems = useMemo(
    () => getMenuBarConfig(activeAppId, activeAppTitle),
    [activeAppId, activeAppTitle],
  );

  const [prevAppId, setPrevAppId] = useState(activeAppId);
  if (prevAppId !== activeAppId) {
    setPrevAppId(activeAppId);
    setActiveMenuIndex(null);
    setActiveStatusPopup(null);
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
        setActiveStatusPopup(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (index) => {
    setActiveStatusPopup(null);
    setActiveMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleStatusPopup = (type) => {
    setActiveMenuIndex(null);
    setActiveStatusPopup((prev) => (prev === type ? null : type));
    soundService.playClick();
  };

  const handleMenuItemClick = (action, disabled) => {
    if (disabled || !action) return;
    setActiveMenuIndex(null);
    setActiveStatusPopup(null);
    if (onSelectMenuAction) {
      onSelectMenuAction(action, activeAppId);
    }
  };

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundService.setSoundEnabled(!next);
      if (!next) {
        soundService.playClick();
      }
      return next;
    });
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      soundService.setSoundEnabled(true);
    } else if (newVol === 0 && !isMuted) {
      setIsMuted(true);
      soundService.setSoundEnabled(false);
    }
    soundService.playBeep(500 + newVol * 8, 0.02);
  }, [isMuted]);

  const currentWeather = weatherData?.current;

  return (
    <nav
      ref={menuBarRef}
      className="fixed top-0 left-0 right-0 h-6 bg-[var(--os-bg)] text-[var(--os-fg)] border-b-2 border-[var(--os-border)] z-50 flex items-center justify-between px-2 text-xs font-mono select-none"
    >
      <div className="flex items-center h-full">
        {menuItems.map((menu, index) => {
          const isOpen = activeMenuIndex === index;
          const isApple = Boolean(menu.isApple);
          const isAppName = Boolean(menu.isAppName);

          return (
            <div key={`${menu.label}-${index}`} className="relative h-full">
              <button
                type="button"
                onClick={() => handleMenuClick(index)}
                onMouseEnter={() => {
                  if (activeMenuIndex !== null) setActiveMenuIndex(index);
                }}
                className={`h-full px-2.5 flex items-center tracking-tight cursor-default transition-none ${
                  isApple
                    ? "font-bold"
                    : isAppName
                      ? "font-black tracking-normal"
                      : "font-semibold"
                } ${
                  isOpen
                    ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                    : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                }`}
              >
                {isApple ? (
                  <CaveLogo className="w-3.5 h-3.5" title="Payaman Menu" />
                ) : (
                  menu.label
                )}
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-52 py-1 z-50">
                  {menu.items.map((item, itemIdx) => {
                    if (item.divider) {
                      return (
                        <div
                          key={`sep-${itemIdx}`}
                          className="my-1 border-t border-[var(--os-border)]/40 mx-1"
                        />
                      );
                    }

                    return (
                      <button
                        key={`${item.label}-${itemIdx}`}
                        type="button"
                        disabled={item.disabled}
                        onClick={() =>
                          handleMenuItemClick(item.action, item.disabled)
                        }
                        className={`w-full flex items-center justify-between px-3 py-1 text-xs font-mono cursor-default text-left ${
                          item.disabled
                            ? "opacity-35 cursor-not-allowed"
                            : "hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] active:text-[var(--os-bg)]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] opacity-60 ml-3 font-normal shrink-0">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onSelectMenuAction?.("weather")}
          title={
            currentWeather
              ? `${location?.name || 'Weather'}: ${currentWeather.condition?.label || ''} ${formatTemp(currentWeather.temp)} (Click to open Weather)`
              : 'Open Weather'
          }
          className="flex items-center gap-1 font-mono font-bold text-[var(--os-fg)] px-1.5 py-0.5 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs"
        >
          <AppIconGraphic
            iconType={currentWeather?.condition?.iconType || 'weather'}
            className="w-3.5 h-3.5"
          />
          <span>{currentWeather ? formatTemp(currentWeather.temp) : 'Weather'}</span>
        </button>

        {/* Wi-Fi Control */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => toggleStatusPopup("wifi")}
            title={`Wi-Fi: ${isWifiOn ? `Connected to ${selectedNetwork}` : 'Off'}`}
            className={`flex items-center justify-center p-1 font-mono text-xs cursor-default ${
              activeStatusPopup === "wifi"
                ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                : `text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] ${
                    !isWifiOn ? "opacity-40" : ""
                  }`
            }`}
          >
            <AppIconGraphic iconType="wifi" className="w-3.5 h-3.5" />
          </button>

          {activeStatusPopup === "wifi" && (
            <div className="absolute top-full right-0 mt-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-56 p-2 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5">
                <span className="font-bold text-xs">Wi-Fi</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsWifiOn((prev) => !prev);
                    soundService.playClick();
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer ${
                    isWifiOn
                      ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                      : "bg-[var(--os-bg)] text-[var(--os-fg)]"
                  }`}
                >
                  {isWifiOn ? "ON" : "OFF"}
                </button>
              </div>

              {isWifiOn ? (
                <div className="space-y-1 text-[11px]">
                  <div className="text-[10px] opacity-60 font-semibold uppercase tracking-wider">
                    Known Networks
                  </div>
                  {["Payaman_5G", "RetroLab_2.4G", "Wired_Gateway"].map((net) => {
                    const isCurrent = selectedNetwork === net;
                    return (
                      <button
                        key={net}
                        type="button"
                        onClick={() => {
                          setSelectedNetwork(net);
                          soundService.playClick();
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 text-left cursor-default ${
                          isCurrent
                            ? "bg-[var(--os-fg)]/15 font-bold"
                            : "hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                        }`}
                      >
                        <span className="truncate">{net}</span>
                        {isCurrent && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                  <div className="pt-1 text-[9px] opacity-60 border-t border-[var(--os-border)]/30">
                    IP: 192.168.1.42 • Signal: 100%
                  </div>
                </div>
              ) : (
                <div className="text-[11px] opacity-60 italic py-1">
                  Wi-Fi is turned off.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bluetooth Control */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => toggleStatusPopup("bluetooth")}
            title={`Bluetooth: ${isBluetoothOn ? 'On (Connected)' : 'Off'}`}
            className={`flex items-center justify-center p-1 font-mono text-xs cursor-default ${
              activeStatusPopup === "bluetooth"
                ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                : `text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] ${
                    !isBluetoothOn ? "opacity-40" : ""
                  }`
            }`}
          >
            <AppIconGraphic iconType="bluetooth" className="w-3.5 h-3.5" />
          </button>

          {activeStatusPopup === "bluetooth" && (
            <div className="absolute top-full right-0 mt-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-56 p-2 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5">
                <span className="font-bold text-xs">Bluetooth</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsBluetoothOn((prev) => !prev);
                    soundService.playClick();
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer ${
                    isBluetoothOn
                      ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                      : "bg-[var(--os-bg)] text-[var(--os-fg)]"
                  }`}
                >
                  {isBluetoothOn ? "ON" : "OFF"}
                </button>
              </div>

              {isBluetoothOn ? (
                <div className="space-y-1 text-[11px]">
                  <div className="text-[10px] opacity-60 font-semibold uppercase tracking-wider">
                    Devices
                  </div>
                  {[
                    { name: "Payaman Mouse", status: "Connected" },
                    { name: "Retro Keyboard", status: "Connected" },
                    { name: "Monochrome Headset", status: "Ready" },
                  ].map((dev) => (
                    <div
                      key={dev.name}
                      className="flex items-center justify-between px-2 py-1 hover:bg-[var(--os-fg)]/10"
                    >
                      <span className="truncate">{dev.name}</span>
                      <span className="text-[9px] opacity-60 shrink-0 ml-2">
                        {dev.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] opacity-60 italic py-1">
                  Bluetooth is turned off.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sound Control */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => toggleStatusPopup("sound")}
            title={`Sound: ${isMuted || volume === 0 ? 'Muted' : `${volume}%`}`}
            className={`flex items-center justify-center p-1 font-mono text-xs cursor-default ${
              activeStatusPopup === "sound"
                ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                : `text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] ${
                    isMuted || volume === 0 ? "opacity-50" : ""
                  }`
            }`}
          >
            <AppIconGraphic
              iconType={isMuted || volume === 0 ? "sound-mute" : "sound"}
              className="w-3.5 h-3.5"
            />
          </button>

          {activeStatusPopup === "sound" && (
            <div className="absolute top-full right-0 mt-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-56 p-2.5 z-50 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5">
                <span className="font-bold text-xs">Sound</span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer ${
                    isMuted
                      ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                      : "bg-[var(--os-bg)] text-[var(--os-fg)]"
                  }`}
                >
                  {isMuted ? "MUTED" : "MUTE"}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="opacity-70">Volume:</span>
                  <span className="font-bold">{isMuted ? "0%" : `${volume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-[var(--os-fg)] cursor-pointer h-1.5 bg-[var(--os-fg)]/20"
                />
              </div>

              <div className="text-[10px] opacity-60 border-t border-[var(--os-border)]/30 pt-1.5 flex justify-between items-center">
                <span>Synthesizer: Web Audio</span>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                  }}
                  className="underline hover:opacity-100"
                >
                  Test Click
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Pet Control */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => toggleStatusPopup("pet")}
            title={`Desktop Pet: ${currentSpecies.name} (${petState.actionState.toUpperCase()})`}
            className={`flex items-center justify-center p-1 font-mono text-xs cursor-default ${
              activeStatusPopup === "pet"
                ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                : `text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] ${
                    !petState.isVisible ? "opacity-50" : ""
                  }`
            }`}
          >
            <AppIconGraphic iconType="pet" className="w-3.5 h-3.5" />
          </button>

          {activeStatusPopup === "pet" && (
            <div className="absolute top-full right-0 mt-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-64 p-2.5 z-50 space-y-2.5">
              {/* Pet Info Header */}
              <div className="flex items-center justify-between border-b border-[var(--os-border)]/40 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{currentSpecies.icon}</span>
                  <div>
                    <div className="font-black text-xs">{currentSpecies.name}</div>
                    <div className="text-[9px] opacity-65">
                      Status: {petState.actionState.toUpperCase()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toggleVisibility();
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] cursor-pointer ${
                    petState.isVisible
                      ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                      : "bg-[var(--os-bg)] text-[var(--os-fg)] opacity-60"
                  }`}
                >
                  {petState.isVisible ? "ON DESKTOP" : "HIDDEN"}
                </button>
              </div>

              {/* Happiness & Hunger Bar */}
              <div className="space-y-1.5 text-[10px]">
                <div className="space-y-0.5">
                  <div className="flex justify-between opacity-80 font-bold">
                    <span>Happiness</span>
                    <span>{petState.happiness}%</span>
                  </div>
                  <div className="h-1.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)]">
                    <div
                      className="h-full bg-[var(--os-fg)]"
                      style={{ width: `${petState.happiness}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between opacity-80 font-bold">
                    <span>Fullness</span>
                    <span>{petState.hunger}%</span>
                  </div>
                  <div className="h-1.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)]">
                    <div
                      className="h-full bg-[var(--os-fg)]"
                      style={{ width: `${petState.hunger}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Switch Pet Selector */}
              <div className="space-y-1">
                <div className="text-[9px] uppercase font-bold tracking-wider opacity-60">
                  Switch Companion
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {PET_SPECIES.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setPetId(spec.id)}
                      title={`${spec.name} - ${spec.subtitle}`}
                      className={`p-1 border text-center font-bold text-xs cursor-pointer transition-colors ${
                        petState.petId === spec.id
                          ? "bg-[var(--os-fg)] text-[var(--os-bg)] border-[var(--os-border)]"
                          : "border-[var(--os-border)]/50 hover:bg-[var(--os-fg)]/10"
                      }`}
                    >
                      <div>{spec.icon}</div>
                      <div className="text-[8px] truncate mt-0.5">
                        {spec.name.split(" ")[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[var(--os-border)]/40">
                <button
                  type="button"
                  onClick={() => feedPet()}
                  className="py-1 px-1 border border-[var(--os-border)] text-center text-[10px] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  🍖 Feed
                </button>
                <button
                  type="button"
                  onClick={() => playWithPet()}
                  className="py-1 px-1 border border-[var(--os-border)] text-center text-[10px] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  🎾 Play
                </button>
                <button
                  type="button"
                  onClick={toggleSleep}
                  className="py-1 px-1 border border-[var(--os-border)] text-center text-[10px] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  💤 {petState.actionState === "sleeping" ? "Wake" : "Sleep"}
                </button>
                <button
                  type="button"
                  onClick={patPet}
                  className="py-1 px-1 border border-[var(--os-border)] text-center text-[10px] font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
                >
                  ❤️ Pet
                </button>
              </div>

              {/* Open Pet App Link */}
              <div className="border-t border-[var(--os-border)]/40 pt-1.5 flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatusPopup(null);
                    onSelectMenuAction?.("pet");
                  }}
                  className="font-bold underline hover:opacity-100 cursor-pointer"
                >
                  Open Pet Companion App ↗
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleVisibility(false);
                    setActiveStatusPopup(null);
                  }}
                  className="text-[9px] opacity-60 hover:opacity-100 cursor-pointer"
                >
                  Dismiss Pet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time Calendar Trigger */}
        <button
          type="button"
          onClick={() => onSelectMenuAction?.("calendar")}
          title="Open Calendar"
          className="flex items-center gap-1.5 font-mono font-bold text-[var(--os-fg)] px-1.5 py-0.5 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs ml-0.5"
        >
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </button>
      </div>
    </nav>
  );
}

