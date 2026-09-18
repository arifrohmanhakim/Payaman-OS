import { useRef, useState, useEffect, memo } from "react";
import { useTheme } from "../hooks/useOS.js";
import { soundService } from "../services/soundService.js";

function Window({
  windowData,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onPositionChange,
  onSizeChange,
  onContextMenu,
  children,
}) {
  const { id, title, x, y, width, height, zIndex, isMinimized, isMaximized } =
    windowData;
  const { displaySettings } = useTheme();
  const uiScale = displaySettings?.scale || 1.15;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null); // 'left' | 'right' | 'top' | null
  const [isMinimizingAnim, setIsMinimizingAnim] = useState(false);

  const currentPosRef = useRef({ x, y });
  const currentSizeRef = useRef({ width, height: height || 300 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const snapCandidateRef = useRef(null);
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const windowRef = useRef(null);

  useEffect(() => {
    currentPosRef.current = { x, y };
  }, [x, y]);

  useEffect(() => {
    currentSizeRef.current = { width, height: height || 300 };
  }, [width, height]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const clientX = event.clientX / uiScale;
      const clientY = event.clientY / uiScale;

      if (isDragging && !isMaximized) {
        const screenW = window.innerWidth / uiScale;
        const screenH = window.innerHeight / uiScale;
        const rawNextX = clientX - dragOffsetRef.current.x;
        const rawNextY = clientY - dragOffsetRef.current.y;

        const nextX = Math.max(-width + 80, Math.min(screenW - 80, rawNextX));
        const nextY = Math.max(24, Math.min(screenH - 32, rawNextY));
        
        currentPosRef.current = { x: nextX, y: nextY };
        if (windowRef.current) {
          windowRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) scale(1)`;
        }

        // Detect screen edges for snapping only when state changes
        let nextSnap = null;
        if (clientX <= 20) {
          nextSnap = "left";
        } else if (clientX >= screenW - 20) {
          nextSnap = "right";
        } else if (clientY <= 28) {
          nextSnap = "top";
        }

        if (snapCandidateRef.current !== nextSnap) {
          snapCandidateRef.current = nextSnap;
          setSnapPreview(nextSnap);
        }
      } else if (isResizing && onSizeChange && !isMaximized) {
        const deltaX = clientX - resizeStartRef.current.mouseX;
        const deltaY = clientY - resizeStartRef.current.mouseY;

        let nextWidth = resizeStartRef.current.startWidth;
        let nextHeight = resizeStartRef.current.startHeight;

        if (resizeDirection === "corner" || resizeDirection === "right") {
          nextWidth = Math.max(260, resizeStartRef.current.startWidth + deltaX);
        }
        if (resizeDirection === "corner" || resizeDirection === "bottom") {
          nextHeight = Math.max(
            180,
            resizeStartRef.current.startHeight + deltaY,
          );
        }

        currentSizeRef.current = { width: nextWidth, height: nextHeight };
        if (windowRef.current) {
          windowRef.current.style.width = `${nextWidth}px`;
          windowRef.current.style.height = `${nextHeight}px`;
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (snapCandidateRef.current && onSnap) {
          soundService.playClick();
          onSnap(id, snapCandidateRef.current);
        } else if (onPositionChange) {
          onPositionChange(id, currentPosRef.current.x, currentPosRef.current.y);
        }
        snapCandidateRef.current = null;
        setSnapPreview(null);
      }
      if (isResizing) {
        setIsResizing(false);
        if (onSizeChange) {
          onSizeChange(id, currentSizeRef.current.width, currentSizeRef.current.height);
        }
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    isMaximized,
    resizeDirection,
    id,
    width,
    onPositionChange,
    onSizeChange,
    onSnap,
    uiScale,
  ]);

  const handleTitleBarMouseDown = (event) => {
    onFocus(id);
    if (isMaximized) return;
    setIsDragging(true);
    const clientX = event.clientX / uiScale;
    const clientY = event.clientY / uiScale;
    dragOffsetRef.current = {
      x: clientX - currentPosRef.current.x,
      y: clientY - currentPosRef.current.y,
    };
  };

  const handleResizeMouseDown = (event, direction) => {
    if (isMaximized) return;
    event.stopPropagation();
    event.preventDefault();
    onFocus(id);
    setIsResizing(true);
    setResizeDirection(direction);
    const clientX = event.clientX / uiScale;
    const clientY = event.clientY / uiScale;
    resizeStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startWidth: currentSizeRef.current.width,
      startHeight: currentSizeRef.current.height,
    };
  };

  const handleToggleMaximize = (event) => {
    event.stopPropagation();
    soundService.playClick();
    if (onMaximize) {
      onMaximize(id);
    }
  };

  const handleMinimizeWithAnim = (event) => {
    event.stopPropagation();
    soundService.playClick();
    setIsMinimizingAnim(true);
    setTimeout(() => {
      setIsMinimizingAnim(false);
      onMinimize(id);
    }, 150);
  };

  const handleTileLeft = (e) => {
    e.stopPropagation();
    soundService.playClick();
    onSnap?.(id, "left");
  };

  const handleTileRight = (e) => {
    e.stopPropagation();
    soundService.playClick();
    onSnap?.(id, "right");
  };

  if (isMinimized && !isMinimizingAnim) return null;

  return (
    <>
      {/* Snap Outline Indicator Overlay */}
      {isDragging && snapPreview && (
        <div
          className={`fixed pointer-events-none z-40 border-2 border-dashed border-[var(--os-border)] bg-[var(--os-fg)]/10 backdrop-blur-xs transition-none ${
            snapPreview === "left"
              ? "top-6 left-0 w-1/2 bottom-0"
              : snapPreview === "right"
                ? "top-6 right-0 w-1/2 bottom-0"
                : "top-6 left-0 right-0 bottom-0"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] px-3 py-1 font-mono text-xs font-bold shadow-[2px_2px_0px_var(--os-shadow)]">
              {snapPreview === "left"
                ? "Snap: Left Half (Tile)"
                : snapPreview === "right"
                  ? "Snap: Right Half (Tile)"
                  : "Snap: Fullscreen (Maximize)"}
            </span>
          </div>
        </div>
      )}

      <div
        ref={windowRef}
        onMouseDown={() => onFocus(id)}
        style={{
          transform: isMinimizingAnim
            ? `translate3d(${x}px, calc(100vh - 60px), 0) scale(0.15)`
            : `translate3d(${x}px, ${y}px, 0) scale(1)`,
          width: `${width}px`,
          height: height ? `${height}px` : "auto",
          zIndex,
          opacity: isMinimizingAnim ? 0 : 1,
        }}
        onContextMenu={(e) => {
          // Jangan biarkan klik kanan di dalam window memicu desktop context menu
          e.stopPropagation();
        }}
        className={`absolute top-0 left-0 bg-[var(--os-bg)] border-2 border-[var(--os-border)] ${
          isMaximized ? "os-window-shadow border-t-0" : "os-window-shadow"
        } flex flex-col select-none text-[var(--os-fg)] font-mono text-xs origin-bottom ${
          isDragging
            ? "opacity-95 transition-none"
            : "transition-all duration-150 ease-out"
        }`}
      >
        <header
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={handleToggleMaximize}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu?.(e, windowData);
          }}
          className={`h-6 border-b-2 border-[var(--os-border)] relative flex items-center justify-between px-2 ${
            isMaximized ? "cursor-default" : "cursor-move"
          } ${isActive ? "os-titlebar-stripes" : "bg-[var(--os-bg)]"}`}
        >
          {/* Window Control Buttons */}
          <div className="flex items-center gap-1 z-10">
            {/* Close */}
            <button
              type="button"
              aria-label="Close Window"
              title="Close (⌘W)"
              onClick={(e) => {
                e.stopPropagation();
                onClose(id);
              }}
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] group cursor-default"
            >
              <span className="text-[9px] font-bold leading-none hidden group-hover:block select-none">
                ×
              </span>
            </button>

            {/* Minimize */}
            <button
              type="button"
              aria-label="Minimize Window"
              title="Minimize (⌘M)"
              onClick={handleMinimizeWithAnim}
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] group cursor-default"
            >
              <span className="text-[9px] font-bold leading-none hidden group-hover:block select-none">
                -
              </span>
            </button>

            {/* Maximize / Restore */}
            <button
              type="button"
              aria-label={
                isMaximized ? "Restore Window" : "Maximize Window"
              }
              title={isMaximized ? "Restore" : "Maximize"}
              onClick={handleToggleMaximize}
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] group cursor-default"
            >
              <span className="text-[8px] font-bold leading-none hidden group-hover:block select-none">
                {isMaximized ? "❐" : "+"}
              </span>
            </button>
          </div>

          {/* Window Title */}
          <div
            onDoubleClick={handleToggleMaximize}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              onDoubleClick={handleToggleMaximize}
              title="Double-click to toggle fullscreen"
              className={`px-2 text-xs font-bold pointer-events-auto cursor-pointer ${
                isActive
                  ? "bg-[var(--os-bg)] text-[var(--os-fg)] border-x border-[var(--os-border)]"
                  : "text-neutral-500 bg-[var(--os-bg)]"
              }`}
            >
              {title}
            </span>
          </div>

          {/* Tile / Snap Quick Buttons (Right side of Titlebar) */}
          <div className="flex items-center gap-1 z-10">
            <button
              type="button"
              aria-label="Tile Window Left"
              title="Tile / Snap Left (⌥←)"
              onClick={handleTileLeft}
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] cursor-pointer text-[8px] leading-none"
            >
              ◧
            </button>
            <button
              type="button"
              aria-label="Tile Window Right"
              title="Tile / Snap Right (⌥→)"
              onClick={handleTileRight}
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] cursor-pointer text-[8px] leading-none"
            >
              ◨
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-auto bg-[var(--os-bg)] p-3 font-mono text-[var(--os-fg)] relative">
          {children}
        </section>

        <footer className="h-4 border-t border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center px-1 shrink-0 relative">
          <span className="text-[10px] opacity-40 select-none">
            {isMaximized ? "Payaman OS (Fullscreen)" : "Payaman OS"}
          </span>

          {!isMaximized && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "corner")}
              title="Drag to resize window"
              className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center cursor-nwse-resize hover:bg-[var(--os-fg)] active:bg-[var(--os-fg)] group"
            >
              <div className="w-1.5 h-1.5 border-r border-b border-[var(--os-border)] group-hover:border-[var(--os-bg)]" />
            </div>
          )}
        </footer>

        {!isMaximized && (
          <>
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "right")}
              className="absolute top-6 bottom-4 right-0 w-1.5 cursor-ew-resize hover:bg-[var(--os-fg)]/20"
            />
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
              className="absolute bottom-0 left-0 right-4 h-1.5 cursor-ns-resize hover:bg-[var(--os-fg)]/20"
            />
          </>
        )}
      </div>
    </>
  );
}

function areWindowPropsEqual(prevProps, nextProps) {
  if (prevProps.isActive !== nextProps.isActive) return false;
  
  const p = prevProps.windowData;
  const n = nextProps.windowData;
  if (
    p.id !== n.id ||
    p.title !== n.title ||
    p.x !== n.x ||
    p.y !== n.y ||
    p.width !== n.width ||
    p.height !== n.height ||
    p.zIndex !== n.zIndex ||
    p.isMinimized !== n.isMinimized ||
    p.isMaximized !== n.isMaximized ||
    p.space !== n.space
  ) {
    return false;
  }

  if (prevProps.onFocus !== nextProps.onFocus) return false;
  if (prevProps.onClose !== nextProps.onClose) return false;
  if (prevProps.onMinimize !== nextProps.onMinimize) return false;
  if (prevProps.onMaximize !== nextProps.onMaximize) return false;
  if (prevProps.onSnap !== nextProps.onSnap) return false;
  if (prevProps.onPositionChange !== nextProps.onPositionChange) return false;
  if (prevProps.onSizeChange !== nextProps.onSizeChange) return false;
  if (prevProps.onContextMenu !== nextProps.onContextMenu) return false;

  return true;
}

export default memo(Window, areWindowPropsEqual);
