import { useState, useEffect } from "react";
import { getAppById } from "../../apps/appRegistry.js";
import { useOSWindowManager, useDockSettings, useSystemUI } from "../../hooks/useOS.js";
import { fileSystemService } from "../../services/fileSystemService.js";
import AppIconGraphic from "../common/AppIconGraphic.jsx";

export default function Dock({ onItemContextMenu, onCanvasContextMenu }) {
  const {
    windows,
    activeWindowId,
    openApp,
    minimizeWindow,
  } = useOSWindowManager();
  const { dockSettings } = useDockSettings();
  const { isLaunchpadOpen, toggleLaunchpad } = useSystemUI();
  const [hoveredAppId, setHoveredAppId] = useState(null);
  const [isHoveringDock, setIsHoveringDock] = useState(false);
  const [isTrashFull, setIsTrashFull] = useState(() => !fileSystemService.isTrashEmpty());

  useEffect(() => {
    const unsubscribe = fileSystemService.subscribe(() => {
      setIsTrashFull(!fileSystemService.isTrashEmpty());
    });
    return unsubscribe;
  }, []);

  const settings = dockSettings || {
    size: "medium",
    position: "bottom",
    autoHide: false,
    magnification: false,
    showIndicators: true,
    pinnedApps: ["files", "terminal", "browser", "map"],
  };

  const {
    size = "medium",
    position = "bottom",
    autoHide = false,
    magnification = true,
    showIndicators = true,
    pinnedApps: customPinnedApps,
  } = settings;

  const DEFAULT_PINNED = ["files", "browser", "chat", "maps", "terminal"];
  const basePinnedAppIds = customPinnedApps || DEFAULT_PINNED;

  const pinnedAppIds = Array.from(
    new Set([...basePinnedAppIds, "browser", "chat", "maps"]),
  );

  const pinnedApps = pinnedAppIds.map((id) => getAppById(id)).filter(Boolean);

  const openAppIds = windows.map((w) => w.appId);
  const runningOnlyApps = openAppIds
    .filter(
      (id, idx) =>
        !pinnedAppIds.includes(id) &&
        id !== "wastebasket" &&
        openAppIds.indexOf(id) === idx,
    )
    .map((id) => getAppById(id))
    .filter(Boolean);

  const dockApps = [...pinnedApps, ...runningOnlyApps];
  const rawTrashApp = getAppById("wastebasket");
  const trashApp = rawTrashApp
    ? {
        ...rawTrashApp,
        iconType: isTrashFull ? 'trash-full' : 'trash',
      }
    : null;

  const allItemIds = [
    "launchpad",
    ...dockApps.map((a) => a.id),
    ...(trashApp ? [trashApp.id] : []),
  ];

  const getItemScale = (itemId) => {
    if (!magnification || !hoveredAppId) return 1;
    const hoveredIndex = allItemIds.indexOf(hoveredAppId);
    const currentIndex = allItemIds.indexOf(itemId);
    if (hoveredIndex === -1 || currentIndex === -1) return 1;

    const distance = Math.abs(hoveredIndex - currentIndex);
    if (distance === 0) return 1.45;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.08;
    return 1;
  };

  const transformOrigin =
    position === "bottom"
      ? "bottom center"
      : position === "left"
        ? "center left"
        : "center right";

  const handleItemClick = (appId) => {
    const existingWindow = windows.find((w) => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        openApp(appId);
      } else if (activeWindowId === appId) {
        minimizeWindow(appId);
      } else {
        openApp(appId);
      }
    } else {
      openApp(appId);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          button: "w-8 h-8 p-0.5",
          icon: "w-5 h-5",
          dot: "w-1 h-1",
          activeDot: "w-2 h-1",
          containerPadding:
            position === "bottom" ? "px-1.5 py-1" : "px-1 py-1.5",
        };
      case "large":
        return {
          button: "w-13 h-13 p-1.5",
          icon: "w-9 h-9",
          dot: "w-2 h-2",
          activeDot: "w-3 h-1.5",
          containerPadding: position === "bottom" ? "px-2 py-1.5" : "px-1.5 py-2",
        };
      case "medium":
      default:
        return {
          button: "w-10 h-10 p-1",
          icon: "w-7 h-7",
          dot: "w-1.5 h-1.5",
          activeDot: "w-2.5 h-1",
          containerPadding:
            position === "bottom" ? "px-2 py-1" : "px-1 py-2",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return {
          container: `fixed left-2 top-1/2 -translate-y-1/2 flex-col items-center ${
            autoHide && !isHoveringDock ? "-translate-x-[calc(100%-6px)]" : ""
          }`,
          content: "flex-col items-center",
          divider: "h-[2px] w-6 bg-[var(--os-border)] my-1 mx-auto",
          tooltip: "left-full ml-3 top-1/2 -translate-y-1/2",
          indicatorContainer: "w-1.5 flex items-center justify-center ml-0.5",
        };
      case "right":
        return {
          container: `fixed right-2 top-1/2 -translate-y-1/2 flex-col items-center ${
            autoHide && !isHoveringDock ? "translate-x-[calc(100%-6px)]" : ""
          }`,
          content: "flex-col items-center",
          divider: "h-[2px] w-6 bg-[var(--os-border)] my-1 mx-auto",
          tooltip: "right-full mr-3 top-1/2 -translate-y-1/2",
          indicatorContainer: "w-1.5 flex items-center justify-center mr-0.5",
        };
      case "bottom":
      default:
        return {
          container: `fixed bottom-2 left-1/2 -translate-x-1/2 flex-row items-end ${
            autoHide && !isHoveringDock ? "translate-y-[calc(100%-6px)]" : ""
          }`,
          content: "flex-row items-end",
          divider: "w-[2px] h-6 bg-[var(--os-border)] self-center mx-1 my-auto",
          tooltip: "bottom-full mb-3 left-1/2 -translate-x-1/2",
          indicatorContainer: "h-1.5 flex items-center justify-center mt-0.5",
        };
    }
  };

  const posClasses = getPositionClasses();

  const renderDockItem = (app) => {
    const existingWindow = windows.find((w) => w.appId === app.id);
    const isOpen = Boolean(existingWindow);
    const isFront = activeWindowId === app.id && !existingWindow?.isMinimized;
    const isHovered = hoveredAppId === app.id;
    const scale = getItemScale(app.id);

    return (
      <div
        key={app.id}
        className={`relative flex items-center group ${
          position === "bottom" ? "flex-col" : "flex-row"
        }`}
        onMouseEnter={() => setHoveredAppId(app.id)}
        onMouseLeave={() => setHoveredAppId(null)}
      >
        {isHovered && (
          <div
            className={`absolute ${posClasses.tooltip} bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] px-2 py-0.5 text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_var(--os-shadow)] pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-75`}
          >
            {app.title}
          </div>
        )}

        <button
          type="button"
          aria-label={app.title}
          onClick={() => handleItemClick(app.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onItemContextMenu?.(e, app.id);
          }}
          style={{
            transform: `scale(${scale})`,
            transformOrigin,
          }}
          className={`${sizeClasses.button} flex items-center justify-center border-2 border-transparent bg-transparent transition-transform duration-100 ease-out cursor-pointer focus:outline-none active:scale-90`}
        >
          <AppIconGraphic
            iconType={app.iconType}
            className={sizeClasses.icon}
          />
        </button>

        {showIndicators && (
          <div className={posClasses.indicatorContainer}>
            {isOpen ? (
              <span
                className={`${
                  isFront
                    ? `${sizeClasses.activeDot} bg-[var(--os-fg)] border border-[var(--os-border)]`
                    : `${sizeClasses.dot} bg-[var(--os-fg)]`
                } transition-none`}
              />
            ) : (
              <span className={`${sizeClasses.dot} invisible`} />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLaunchpadItem = () => {
    const isHovered = hoveredAppId === "launchpad";
    const scale = getItemScale("launchpad");

    return (
      <div
        key="launchpad"
        className={`relative flex items-center group ${
          position === "bottom" ? "flex-col" : "flex-row"
        }`}
        onMouseEnter={() => setHoveredAppId("launchpad")}
        onMouseLeave={() => setHoveredAppId(null)}
      >
        {isHovered && (
          <div
            className={`absolute ${posClasses.tooltip} bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] px-2 py-0.5 text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_var(--os-shadow)] pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-75`}
          >
            Launchpad
          </div>
        )}

        <button
          type="button"
          aria-label="Open Launchpad"
          onClick={toggleLaunchpad}
          style={{
            transform: `scale(${scale})`,
            transformOrigin,
          }}
          className={`${sizeClasses.button} flex items-center justify-center border-2 border-transparent bg-transparent transition-transform duration-100 ease-out cursor-pointer focus:outline-none active:scale-90`}
        >
          <AppIconGraphic iconType="launchpad" className={sizeClasses.icon} />
        </button>

        {showIndicators && (
          <div className={posClasses.indicatorContainer}>
            {isLaunchpadOpen ? (
              <span
                className={`${sizeClasses.activeDot} bg-[var(--os-fg)] border border-[var(--os-border)] transition-none`}
              />
            ) : (
              <span className={`${sizeClasses.dot} invisible`} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      aria-label="Application Dock"
      onMouseEnter={() => setIsHoveringDock(true)}
      onMouseLeave={() => setIsHoveringDock(false)}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget || e.target.closest('nav') === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onCanvasContextMenu?.(e);
        }
      }}
      className={`${posClasses.container} z-40 bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow rounded-none ${sizeClasses.containerPadding} flex gap-1 select-none`}
    >
      <div className={`flex gap-1 ${posClasses.content}`}>
        {renderLaunchpadItem()}
        <div className={posClasses.divider} />
        {dockApps.map(renderDockItem)}
      </div>

      {trashApp && (
        <>
          <div className={posClasses.divider} />
          <div className={`flex ${posClasses.content}`}>
            {renderDockItem(trashApp)}
          </div>
        </>
      )}
    </nav>
  );
}
