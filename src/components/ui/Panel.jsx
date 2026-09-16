export default function Panel({
  title,
  children,
  className = '',
  action,
}) {
  return (
    <div className={`border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] p-3 font-mono ${className}`}>
      {title && (
        <div className="flex justify-between items-center border-b border-[var(--os-border)] pb-1.5 mb-2.5">
          <span className="font-bold text-xs">{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
