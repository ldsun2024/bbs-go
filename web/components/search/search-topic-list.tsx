"use client"

import Link from "@/components/common/link"

import { UserAvatar } from "@/components/common/avatar"
import { EmptyState } from "@/components/common/empty-state"
import type { Topic } from "@/lib/api/types"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"

export function SearchTopicList({ results }: { results: Topic[] }) {
  const { t } = useI18n()

  if (!results.length) {
    return <EmptyState title={t("common.noData")} />
  }

  return (
    <div>
      {results.map((item) => (
        <article
          key={item.id}
          className="group border-b border-border py-5 transition-colors last:border-b-0 hover:bg-muted"
        >
          <div className="min-w-0">
            <h3 className="text-h4 leading-snug font-semibold text-foreground md:text-h3 md:leading-[1.35]">
              <Link
                href={`/topic/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors group-hover:text-primary"
              >
                <span
                  className="[&_em]:bg-muted-foreground/20 [&_em]:px-0.5 [&_em]:not-italic [&_em]:underline [&_em]:decoration-primary [&_em]:decoration-2 [&_em]:underline-offset-4"
                  dangerouslySetInnerHTML={{ __html: item.title || "" }}
                />
              </Link>
            </h3>
            <Link
              href={`/topic/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm leading-[1.7] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                className="[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [&_em]:bg-muted-foreground/15 [&_em]:px-0.5 [&_em]:not-italic"
                dangerouslySetInnerHTML={{ __html: item.summary || "" }}
              />
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              {item.user ? (
                <span className="inline-flex items-center gap-2">
                  <UserAvatar user={item.user} size={20} className="shrink-0" />
                  <Link
                    href={`/user/${item.user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {item.user.nickname || item.user.username || item.user.id}
                  </Link>
                </span>
              ) : null}
              <span className="font-mono tabular-nums">
                {formatDate(item.createTime)}
              </span>
              {item.category ? (
                <Link
                  href={`/topics/category/${item.category.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-micro tracking-[0.04em] uppercase transition-colors hover:text-foreground"
                >
                  {item.category.name}
                </Link>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
