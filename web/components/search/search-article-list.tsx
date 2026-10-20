"use client"

import Link from "@/components/common/link"
import { UserAvatar } from "@/components/common/avatar"
import { EmptyState } from "@/components/common/empty-state"
import type { SearchArticle } from "@/lib/api/types"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"

export function SearchArticleList({ results }: { results: SearchArticle[] }) {
  const { t } = useI18n()

  if (!results.length) {
    return <EmptyState title={t("common.noData")} />
  }

  return (
    <div>
      {results.map((item) => {
        const user = item.user
        const authorName = user
          ? user.nickname || user.username || user.id
          : undefined
        return (
          <article
            key={item.id}
            className="group border-b border-border py-5 transition-colors last:border-b-0 hover:bg-muted"
          >
            <h3 className="text-h4 leading-snug font-semibold text-foreground md:text-h3 md:leading-[1.35]">
              <Link
                href={`/article/${item.id}`}
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
            {item.summary ? (
              <Link
                href={`/article/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm leading-[1.7] text-muted-foreground transition-colors hover:text-foreground"
              >
                <span
                  className="[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [&_em]:bg-muted-foreground/15 [&_em]:px-0.5 [&_em]:not-italic"
                  dangerouslySetInnerHTML={{ __html: item.summary || "" }}
                />
              </Link>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              {user ? (
                <span className="inline-flex items-center gap-2">
                  <UserAvatar user={user} size={20} className="shrink-0" />
                  <Link
                    href={`/user/${user.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {authorName}
                  </Link>
                </span>
              ) : null}
              {item.createTime ? (
                <span className="font-mono tabular-nums">
                  {formatDate(item.createTime)}
                </span>
              ) : null}
              {item.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles/tag/${tag.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-micro tracking-[0.04em] uppercase transition-colors hover:text-foreground"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
