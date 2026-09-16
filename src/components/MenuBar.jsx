import { useState, useEffect, useRef } from "react";

export default function MenuBar({ onSelectMenuAction }) {
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const menuBarRef = useRef(null);

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

  const menuItems = [
    {
      label: "Payaman",
      items: [
        { label: "Launchpad (Apps)", action: "launchpad" },
        { label: "About Payaman OS", action: "about" },
        { label: "System Preferences", action: "preferences" },
      ],
    },
    {
      label: "File",
      items: [
        { label: "Open Launchpad", action: "launchpad" },
        { label: "Open File Manager", action: "files" },
        { label: "Open Photo Gallery", action: "gallery" },
        { label: "Open Photobot", action: "photobot" },
        { label: "Open MacPaint", action: "paint" },
        { label: "New Document", action: "new_note" },
        { label: "Open Calendar", action: "calendar" },
        { label: "Open Calculator", action: "calculator" },
        { label: "Open Terminal", action: "terminal" },
        { label: "Close Window", action: "close_active" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Cut", action: "cut", disabled: true },
        { label: "Copy", action: "copy", disabled: true },
        { label: "Paste", action: "paste", disabled: true },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Icon View", action: "view_icon" },
        { label: "List View", action: "view_list" },
      ],
    },
    {
      label: "Special",
      items: [
        { label: "Clean Desktop", action: "clean_desktop" },
        { label: "Reset Window Session", action: "reset_session" },
        { label: "Empty Trash", action: "empty_trash" },
        { label: "Restart", action: "restart" },
      ],
    },
  ];

  const handleMenuClick = (index) => {
    setActiveMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleMenuItemClick = (action, disabled) => {
    if (disabled) return;
    setActiveMenuIndex(null);
    if (onSelectMenuAction) {
      onSelectMenuAction(action);
    }
  };

  return (
    <nav
      ref={menuBarRef}
      className="fixed top-0 left-0 right-0 h-6 bg-[var(--os-bg)] text-[var(--os-fg)] border-b-2 border-[var(--os-border)] z-50 flex items-center justify-between px-3 text-xs font-mono select-none"
    >
      <div className="flex items-center h-full">
        {menuItems.map((menu, index) => {
          const isOpen = activeMenuIndex === index;
          return (
            <div key={menu.label} className="relative h-full">
              <button
                type="button"
                onClick={() => handleMenuClick(index)}
                onMouseEnter={() => {
                  if (activeMenuIndex !== null) setActiveMenuIndex(index);
                }}
                className={`h-full px-3 flex items-center font-bold ${index === 0 ? "text-lg" : ""} tracking-tight cursor-default transition-none ${
                  isOpen
                    ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                    : "bg-[var(--os-bg)] text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]"
                }`}
              >
                {menu.label}
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] os-window-shadow min-w-48 py-1 z-50">
                  {menu.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      disabled={item.disabled}
                      onClick={() =>
                        handleMenuItemClick(item.action, item.disabled)
                      }
                      className={`w-full text-left px-4 py-1 text-xs font-mono block cursor-default ${
                        item.disabled
                          ? "opacity-40"
                          : "text-[var(--os-fg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] active:text-[var(--os-bg)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelectMenuAction?.('calendar')}
        title="Open Calendar"
        className="flex items-center gap-1.5 font-mono font-bold text-[var(--os-fg)] px-1.5 py-0.5 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs"
      >
        <span>📅</span>
        <span>{currentDate}</span>
        <span>{currentTime}</span>
      </button>
    </nav>
  );
}
