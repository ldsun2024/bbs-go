import { cn } from "@/lib/utils"

/**
 * C5：骨架块。
 * 用透明度呼吸（0.65 → 1，1.4s）代替 Tailwind 默认的 animate-pulse，
 * 后者是 2s 的 50% 透明，暗色下闪得厉害。
 * 系统开启「减少动态效果」时由 common.css 统一降级为静态块。
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-breathe rounded-[var(--radius-sm)] bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
