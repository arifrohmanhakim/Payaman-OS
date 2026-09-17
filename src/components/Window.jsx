import { useRef, useState, useEffect } from "react";
import { useOS } from "../hooks/useOS.js";
import { soundService } from "../services/soundService.js";

export default function Window({
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
  const { displaySettings } = useOS();
  const uiScale = displaySettings?.scale || 1.15;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null); // 'left' | 'right' | 'top' | null
  const [isMinimizingAnim, setIsMinimizingAnim] = useState(false);

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
    const handleMouseMove = (event) => {
      const clientX = event.clientX / uiScale;
      const clientY = event.clientY / uiScale;

      if (isDragging && !isMaximized) {
        const nextX = Math.max(0, clientX - dragOffsetRef.current.x);
        const nextY = Math.max(24, clientY - dragOffsetRef.current.y);
        onPositionChange(id, nextX, nextY);

        // Detect screen edges for snapping
        const screenW = window.innerWidth / uiScale;
        if (clientX <= 24) {
          snapCandidateRef.current = "left";
          setSnapPreview("left");
        } else if (clientX >= screenW - 24) {
          snapCandidateRef.current = "right";
          setSnapPreview("right");
        } else if (clientY <= 30) {
          snapCandidateRef.current = "top";
          setSnapPreview("top");
        } else {
          snapCandidateRef.current = null;
          setSnapPreview(null);
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

        onSizeChange(id, nextWidth, nextHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (snapCandidateRef.current && onSnap) {
          soundService.playClick();
          onSnap(id, snapCandidateRef.current);
        }
        snapCandidateRef.current = null;
        setSnapPreview(null);
      }
      if (isResizing) setIsResizing(false);
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
      x: clientX - x,
      y: clientY - y,
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
      startWidth: width,
      startHeight: height || 300,
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
