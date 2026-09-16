export default function Button({
  children,
  variant = 'default',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyle =
    'font-mono text-xs font-bold border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] cursor-default select-none transition-none focus:outline-none'

  const variantStyles = {
    default:
      'px-3 py-1 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] active:text-[var(--os-bg)]',
    primary:
      'px-4 py-1 hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:bg-[var(--os-fg)] active:text-[var(--os-bg)] ring-2 ring-[var(--os-fg)] ring-offset-2',
    outline:
      'px-2 py-0.5 border hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)]',
  }

  const disabledStyle =
    'opacity-40 cursor-not-allowed hover:bg-[var(--os-bg)] hover:text-[var(--os-fg)] active:bg-[var(--os-bg)] active:text-[var(--os-fg)]'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${variantStyles[variant] || variantStyles.default} ${
        disabled ? disabledStyle : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
