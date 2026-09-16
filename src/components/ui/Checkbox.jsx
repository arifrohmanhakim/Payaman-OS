export default function Checkbox({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 font-mono text-xs cursor-default select-none text-[var(--os-fg)] ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className="w-4 h-4 accent-[var(--os-fg)] border-2 border-[var(--os-border)] rounded-none cursor-pointer"
      />
      {label && <span>{label}</span>}
    </label>
  )
}
