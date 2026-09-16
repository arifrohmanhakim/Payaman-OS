import { useRef, useState, useEffect } from "react";

export default function Window({
  windowData,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onPositionChange,
  onSizeChange,
  children,
}) {
  const { id, title, x, y, width, height, zIndex, isMinimized, isMaximized } =
    windowData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging && !isMaximized) {
        const nextX = Math.max(0, event.clientX - dragOffsetRef.current.x);
        const nextY = Math.max(24, event.clientY - dragOffsetRef.current.y);
        onPositionChange(id, nextX, nextY);
      } else if (isResizing && onSizeChange && !isMaximized) {
        const deltaX = event.clientX - resizeStartRef.current.mouseX;
        const deltaY = event.clientY - resizeStartRef.current.mouseY;

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
      if (isDragging) setIsDragging(false);
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
  ]);

  const handleTitleBarMouseDown = (event) => {
    onFocus(id);
    if (isMaximized) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: event.clientX - x,
      y: event.clientY - y,
    };
  };

  const handleResizeMouseDown = (event, direction) => {
    if (isMaximized) return;
    event.stopPropagation();
    event.preventDefault();
    onFocus(id);
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      startWidth: width,
      startHeight: height || 300,
    };
  };

  const handleToggleMaximize = (event) => {
    event.stopPropagation();
    if (onMaximize) {
      onMaximize(id);
    }
  };

  if (isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={() => onFocus(id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: height ? `${height}px` : "auto",
        zIndex,
      }}
      className={`absolute top-0 left-0 bg-[var(--os-bg)] border-2 border-[var(--os-border)] ${
        isMaximized ? "os-window-shadow border-t-0" : "os-window-shadow"
      } flex flex-col select-none text-[var(--os-fg)] font-mono text-xs`}
    >
      <header
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={handleToggleMaximize}
        className={`h-6 border-b-2 border-[var(--os-border)] relative flex items-center justify-between px-2 ${
          isMaximized ? "cursor-default" : "cursor-move"
        } ${isActive ? "os-titlebar-stripes" : "bg-[var(--os-bg)]"}`}
      >
        {/* Tombol Kontrol Jendela (Close, Minimize, Maximize) ala macOS monokrom */}
        <div className="flex items-center gap-1.5 z-10">
          <button
            type="button"
            aria-label="Tutup Jendela"
            title="Tutup"
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

          <button
            type="button"
            aria-label="Minimalkan Jendela"
            title="Minimalkan"
            onClick={(e) => {
              e.stopPropagation();
              if (onMinimize) {
                onMinimize(id);
              }
            }}
            className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] group cursor-default"
          >
            <span className="text-[9px] font-bold leading-none hidden group-hover:block select-none">
              -
            </span>
          </button>

          <button
            type="button"
            aria-label={
              isMaximized ? "Pulihkan Jendela" : "Perbesar 1 Layar Penuh"
            }
            title={isMaximized ? "Pulihkan Ukuran" : "Perbesar 1 Layar Penuh"}
            onClick={handleToggleMaximize}
            className="w-3.5 h-3.5 border border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-center hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] group cursor-default"
          >
            <span className="text-[8px] font-bold leading-none hidden group-hover:block select-none">
              {isMaximized ? "❐" : "+"}
            </span>
          </button>
        </div>

        {/* Judul Jendela: Klik ganda untuk layar penuh seperti macOS */}
        <div
          onDoubleClick={handleToggleMaximize}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <span
            onDoubleClick={handleToggleMaximize}
            title="Klik ganda untuk memperbesar 1 layar penuh"
            className={`px-2 text-xs font-bold pointer-events-auto cursor-pointer ${
              isActive
                ? "bg-[var(--os-bg)] text-[var(--os-fg)] border-x border-[var(--os-border)]"
                : "text-neutral-500 bg-[var(--os-bg)]"
            }`}
          >
            {title}
          </span>
        </div>

        <div className="w-14" />
      </header>

      <section className="flex-1 overflow-auto bg-[var(--os-bg)] p-3 font-mono text-[var(--os-fg)] relative">
        {children}
      </section>

      <footer className="h-4 border-t border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center px-1 shrink-0 relative">
        <span className="text-[10px] opacity-40 select-none">
          {isMaximized ? "Payaman OS (Layar Penuh)" : "Payaman OS"}
        </span>

        {!isMaximized && (
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "corner")}
            title="Tarik untuk mengubah ukuran jendela"
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
  );
}
