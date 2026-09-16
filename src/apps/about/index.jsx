import Button from "../../components/ui/Button.jsx";

export default function AboutApp({ onClose }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 font-mono p-2 text-[var(--os-fg)]">
      <div className="w-16 h-16 border-2 border-[var(--os-border)] flex items-center justify-center font-bold text-4xl tracking-tighter bg-[var(--os-bg)]">
        
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-bold tracking-tight">Payaman OS</h2>
        <p className="text-xs opacity-75">Sistem Operasi Desktop Monokrom</p>
        <p className="text-[11px] opacity-60">
          Versi 1.0 (Arsitektur Web Modular)
        </p>
      </div>

      <div className="w-full border-t border-b border-[var(--os-border)] py-2 text-[11px] text-left space-y-1 bg-[var(--os-bg)]">
        <div className="flex justify-between">
          <span className="opacity-70">Platform:</span>
          <span className="font-bold">React 19 + Vite</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Styling Engine:</span>
          <span className="font-bold">Tailwind CSS (Monokrom)</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Penyimpanan:</span>
          <span className="font-bold">LocalStorage (Aktif)</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Arsitektur:</span>
          <span className="font-bold">Modular App Registry</span>
        </div>
      </div>

      {onClose && (
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      )}
    </div>
  );
}
