import { useState, useEffect, useRef } from "react";

export default function MenuBar({ onSelectMenuAction }) {
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const menuBarRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setCurrentTime(formatted);
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
        { label: "Launchpad (Aplikasi)", action: "launchpad" },
        { label: "Tentang Payaman OS", action: "about" },
        { label: "Preferensi Sistem", action: "preferences" },
      ],
    },
    {
      label: "File",
      items: [
        { label: "Buka Launchpad", action: "launchpad" },
        { label: "Buka Manajer Berkas", action: "files" },
        { label: "Buka Galeri Foto", action: "gallery" },
        { label: "Buka Photobot", action: "photobot" },
        { label: "Buka MacPaint", action: "paint" },
        { label: "Buka Dokumen Baru", action: "new_note" },
        { label: "Buka Kalkulator", action: "calculator" },
        { label: "Buka Terminal", action: "terminal" },
        { label: "Tutup Jendela", action: "close_active" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Potong (Cut)", action: "cut", disabled: true },
        { label: "Salin (Copy)", action: "copy", disabled: true },
        { label: "Tempel (Paste)", action: "paste", disabled: true },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Tampilan Ikon", action: "view_icon" },
        { label: "Tampilan Daftar", action: "view_list" },
      ],
    },
    {
      label: "Special",
      items: [
        { label: "Bersihkan Desktop", action: "clean_desktop" },
        { label: "Kosongkan Tong Sampah", action: "empty_trash" },
        { label: "Mulai Ulang (Restart)", action: "restart" },
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

      <div className="flex items-center gap-2 font-mono font-bold text-[var(--os-fg)]">
        <span>{currentTime}</span>
      </div>
    </nav>
  );
}
