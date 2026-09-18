export default function AppLoadingFallback({ title = 'Application' }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--os-bg)] text-[var(--os-fg)] font-mono select-none p-4 space-y-3">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 bg-[var(--os-fg)] animate-pulse" />
        <span className="inline-block w-2.5 h-2.5 bg-[var(--os-fg)] animate-pulse [animation-delay:150ms]" />
        <span className="inline-block w-2.5 h-2.5 bg-[var(--os-fg)] animate-pulse [animation-delay:300ms]" />
      </div>
      <div className="text-xs uppercase tracking-wider opacity-80">
        Loading {title}...
      </div>
      <div className="w-32 h-2 border border-[var(--os-border)] p-0.5 overflow-hidden">
        <div className="h-full bg-[var(--os-fg)] animate-[indeterminate_1.2s_infinite_linear]" />
      </div>
    </div>
  )
}
