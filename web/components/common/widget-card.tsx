import type * as React from "react"

import { cn } from "@/lib/utils"

export function WidgetCard({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("bg-card", className)}>
      {title || actions ? (
        <div className="mb-4 flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-2">
          <h2 className="min-w-0 font-mono text-micro font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {title}
          </h2>
          {actions ? (
            <div className="shrink-0 text-xs">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
