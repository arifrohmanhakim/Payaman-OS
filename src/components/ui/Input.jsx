export default function Input({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-2 py-1 font-mono text-xs bg-[var(--os-bg)] text-[var(--os-fg)] border-2 border-[var(--os-border)] outline-none focus:ring-1 focus:ring-[var(--os-fg)] placeholder-neutral-400 ${className}`}
      {...props}
    />
  )
}
