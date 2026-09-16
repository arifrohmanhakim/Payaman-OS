import { useState, useEffect, useRef, useMemo } from "react";
import { useOS } from "../hooks/useOS.js";
import { getAppById } from "../apps/appRegistry.js";
import { getMenuBarConfig } from "./menuBarConfig.js";
import { useWeather } from "../apps/weather/useWeather.js";
import AppIconGraphic from "./common/AppIconGraphic.jsx";

export default function MenuBar({ onSelectMenuAction }) {
  const { windows, activeWindowId } = useOS();
  const { weatherData, location, formatTemp } = useWeather();
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (index) => {
    setActiveMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleMenuItemClick = (action, disabled) => {
    if (disabled || !action) return;
    setActiveMenuIndex(null);
    if (onSelectMenuAction) {
      onSelectMenuAction(action, activeAppId);
    }
  };

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
                    ? "text-base font-bold"
                    : isAppName
                      ? "font-black tracking-normal"
                      : "font-semibold"
                } ${
                  isOpen
                    ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                    : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                }`}
              >
                {menu.label}
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

      <div className="flex items-center gap-1 shrink-0">
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

        <button
          type="button"
          onClick={() => onSelectMenuAction?.("calendar")}
          title="Open Calendar"
          className="flex items-center gap-1.5 font-mono font-bold text-[var(--os-fg)] px-1.5 py-0.5 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs"
        >
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </button>
      </div>
    </nav>
  );
}
