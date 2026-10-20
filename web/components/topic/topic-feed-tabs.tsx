"use client"

import Link from "@/components/common/link"

import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

const feedTabs = [
  {
    id: 0,
    labelKey: "pages.topics.feedLatest",
    href: "/topics/category/newest",
  },
  {
    id: -1,
    labelKey: "pages.topics.feedRecommend",
    href: "/topics/category/recommend",
  },
  {
    id: -2,
    labelKey: "pages.topics.feedFollowing",
    href: "/topics/category/feed",
  },
]

export function TopicFeedTabs({
  currentCategoryId,
}: {
  currentCategoryId: number
}) {
  const { t } = useI18n()
  const currentTab =
    feedTabs.find((item) => item.id === currentCategoryId) || feedTabs[0]

  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 pb-3 md:px-6">
      <h2 className="font-mono text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
        {t(currentTab.labelKey)}
      </h2>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {feedTabs.map((item) => {
          const selected = currentCategoryId === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "transition-colors",
                selected
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
              aria-current={selected ? "page" : undefined}
            >
              {t(item.labelKey)}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
