import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center px-1 py-10 text-left",
        className,
      )}
    >
      <svg
        viewBox="0 0 120 100"
        aria-hidden="true"
        className="h-24 w-24 text-muted-foreground/45"
      >
        <defs>
          <linearGradient id="emptyFill" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <g fill="none" fillRule="evenodd">
          <rect
            x="18"
            y="28"
            width="84"
            height="56"
            rx="12"
            fill="url(#emptyFill)"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <path d="M18 42h84" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
          <path d="M42 56h36" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.45" strokeWidth="2.5" />
          <path d="M50 66h20" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.3" strokeWidth="2.5" />
          <circle cx="93" cy="18" r="3" fill="currentColor" fillOpacity="0.32" />
          <circle cx="84" cy="10" r="1.8" fill="currentColor" fillOpacity="0.22" />
        </g>
      </svg>
      <p className="mt-4 font-serif text-xl font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-[13px] leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
