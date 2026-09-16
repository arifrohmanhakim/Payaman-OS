import { useState } from "react";
import { getAppById } from "../../apps/appRegistry.js";
import { useOS } from "../../hooks/useOS.js";
import AppIconGraphic from "../common/AppIconGraphic.jsx";

export default function Dock() {
  const {
    windows,
    activeWindowId,
    dockSettings,
    openApp,
    minimizeWindow,
    isLaunchpadOpen,
    toggleLaunchpad,
  } = useOS();
  const [hoveredAppId, setHoveredAppId] = useState(null);
  const [isHoveringDock, setIsHoveringDock] = useState(false);

  const settings = dockSettings || {
    size: "medium",
    position: "bottom",
    autoHide: false,
    magnification: true,
    showIndicators: true,
    pinnedApps: ["files", "terminal", "browser"],
  };

  const {
    size = "medium",
    position = "bottom",
    autoHide = false,
    magnification = true,
    showIndicators = true,
    pinnedApps: customPinnedApps,
  } = settings;

  const basePinnedAppIds = customPinnedApps || ["files", "browser", "terminal"];
  const pinnedAppIds = basePinnedAppIds.includes("browser")
    ? basePinnedAppIds
    : ["files", "browser", ...basePinnedAppIds.filter((id) => id !== "files")];

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
  const trashApp = getAppById("wastebasket");

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
          button: "w-8 h-8 p-1",
          icon: "w-5 h-5",
          dot: "w-1 h-1",
          activeDot: "w-1.5 h-0.5",
          containerPadding:
            position === "bottom" ? "px-1.5 py-1" : "px-1 py-1.5",
        };
      case "large":
        return {
          button: "w-14 h-14 p-2",
          icon: "w-9 h-9",
          dot: "w-2 h-2",
          activeDot: "w-2.5 h-1",
          containerPadding: position === "bottom" ? "px-3 py-2" : "px-2 py-3",
        };
      case "medium":
      default:
        return {
          button: "w-11 h-11 p-1.5",
          icon: "w-7 h-7",
          dot: "w-1.5 h-1.5",
          activeDot: "w-2 h-1",
          containerPadding:
            position === "bottom" ? "px-2.5 py-1.5" : "px-1.5 py-2.5",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return {
          container: `fixed left-2.5 top-1/2 -translate-y-1/2 flex-col items-center ${
            autoHide && !isHoveringDock ? "-translate-x-[calc(100%-8px)]" : ""
          }`,
          content: "flex-col items-center",
          divider: "h-[1.5px] w-6 bg-[var(--os-border)]/40 my-1 mx-auto",
          tooltip: "left-full ml-2 top-1/2 -translate-y-1/2",
          hoverMove: magnification
            ? "hover:translate-x-1.5 hover:scale-110"
            : "",
          indicatorContainer: "w-1.5 flex items-center justify-center ml-0.5",
        };
      case "right":
        return {
          container: `fixed right-2.5 top-1/2 -translate-y-1/2 flex-col items-center ${
            autoHide && !isHoveringDock ? "translate-x-[calc(100%-8px)]" : ""
          }`,
          content: "flex-col items-center",
          divider: "h-[1.5px] w-6 bg-[var(--os-border)]/40 my-1 mx-auto",
          tooltip: "right-full mr-2 top-1/2 -translate-y-1/2",
          hoverMove: magnification
            ? "hover:-translate-x-1.5 hover:scale-110"
            : "",
          indicatorContainer: "w-1.5 flex items-center justify-center mr-0.5",
        };
      case "bottom":
      default:
        return {
          container: `fixed bottom-2.5 left-1/2 -translate-x-1/2 flex-row items-end ${
            autoHide && !isHoveringDock ? "translate-y-[calc(100%-8px)]" : ""
          }`,
          content: "flex-row items-end",
          divider:
            "w-[1.5px] h-6 bg-[var(--os-border)]/40 self-center mx-1 my-auto",
          tooltip: "bottom-full mb-2 left-1/2 -translate-x-1/2",
          hoverMove: magnification
            ? "hover:-translate-y-1.5 hover:scale-110"
            : "",
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
            className={`absolute ${posClasses.tooltip} bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] px-2 py-0.5 text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_var(--os-shadow)] pointer-events-none z-50`}
          >
            {app.title}
          </div>
        )}

        <button
          type="button"
          aria-label={app.title}
          onClick={() => handleItemClick(app.id)}
          className={`${sizeClasses.button} flex items-center justify-center border border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 active:scale-95 transition-all duration-150 ease-out transform ${posClasses.hoverMove} rounded-lg cursor-default focus:outline-none ${
            isFront ? "bg-[var(--os-fg)]/5 border-[var(--os-border)]/40" : ""
          }`}
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
                    ? `${sizeClasses.activeDot} bg-[var(--os-fg)]`
                    : `${sizeClasses.dot} bg-[var(--os-fg)]/70`
                } rounded-full transition-all`}
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
            className={`absolute ${posClasses.tooltip} bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] px-2 py-0.5 text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_var(--os-shadow)] pointer-events-none z-50`}
          >
            Launchpad
          </div>
        )}

        <button
          type="button"
          aria-label="Open Launchpad"
          onClick={toggleLaunchpad}
          className={`${sizeClasses.button} flex items-center justify-center border border-transparent hover:border-[var(--os-border)] hover:bg-[var(--os-fg)]/10 active:scale-95 transition-all duration-150 ease-out transform ${posClasses.hoverMove} rounded-lg cursor-default focus:outline-none ${
            isLaunchpadOpen
              ? "bg-[var(--os-fg)]/15 border-[var(--os-border)]"
              : ""
          }`}
        >
          <AppIconGraphic iconType="launchpad" className={sizeClasses.icon} />
        </button>

        {showIndicators && (
          <div className={posClasses.indicatorContainer}>
            {isLaunchpadOpen ? (
              <span
                className={`${sizeClasses.activeDot} bg-[var(--os-fg)] rounded-full transition-all`}
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
      className={`${posClasses.container} z-40 bg-[var(--os-bg)] border-2 border-[var(--os-border)] os-window-shadow rounded-xl ${sizeClasses.containerPadding} flex gap-1 select-none backdrop-blur-xs transition-transform duration-200 ease-in-out`}
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
