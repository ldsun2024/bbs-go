import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * C5：三类骨架。
 * 形状与真实内容对齐 —— 列表沿用条目内边距，表格沿用行高 44，正文沿用 1.9 行距，
 * 数据到达时不产生 CLS。
 */

/** 列表页：左侧 40×40 日期/头像块 + 右三行文字 */
export function ListSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn("divide-y divide-border", className)}
      aria-hidden="true"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3 px-5 py-4">
          <Skeleton className="size-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-3 w-[78%]" />
            <Skeleton className="h-2.5 w-[40%]" />
          </div>
        </div>
      ))}
    </div>
  )
}

const DETAIL_WIDTHS = ["100%", "95%", "88%", "100%", "72%", "45%"]

/** 详情页：标题 92% + 元信息 40% + 正文 6 行递减 */
export function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("px-5 py-6", className)} aria-hidden="true" aria-busy="true">
      <Skeleton className="h-7 w-[92%]" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-2.5 w-[40%]" />
      </div>
      <div className="mt-8 space-y-3">
        {DETAIL_WIDTHS.map((width, index) => (
          <Skeleton key={index} className="h-3" style={{ width }} />
        ))}
      </div>
    </div>
  )
}

/**
 * 后台表格：返回 `<tr>` 片段，放在 `<tbody>` 内使用。
 * 行高 44 与真实数据行一致，列数与表格相同。
 */
export function TableRowsSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-t" aria-hidden="true">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="h-11 px-3">
              <Skeleton
                className={cn("h-3", colIndex === 0 ? "w-10" : "w-full")}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
