"use client"

import Link from "@/components/common/link"
import { UserAvatar } from "@/components/common/avatar"
import { EmptyState } from "@/components/common/empty-state"
import type { SearchUser } from "@/lib/api/types"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"

export function SearchUserList({ results }: { results: SearchUser[] }) {
  const { t } = useI18n()

  if (!results.length) {
    return <EmptyState title={t("common.noData")} />
  }

  return (
    <div>
      {results.map((item) => {
        const user = item.user
        if (!user) return null
        const name = item.nickname || user.nickname || user.username || user.id
        const description = item.description || user.description
        return (
          <article
            key={user.id}
            className="group border-b border-border py-5 transition-colors last:border-b-0 hover:bg-muted"
          >
            <div className="flex gap-4">
              <UserAvatar user={user} size={48} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/user/${user.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-h4 leading-snug font-semibold text-foreground transition-colors group-hover:text-primary"
                >
                  <span
                    className="[&_em]:bg-muted-foreground/20 [&_em]:px-0.5 [&_em]:not-italic [&_em]:underline [&_em]:decoration-primary [&_em]:decoration-2 [&_em]:underline-offset-4"
                    dangerouslySetInnerHTML={{ __html: name }}
                  />
                </Link>
                {description ? (
                  <p
                    className="mt-1.5 line-clamp-2 text-sm leading-[1.7] text-muted-foreground [&_em]:bg-muted-foreground/15 [&_em]:px-0.5 [&_em]:not-italic"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                  {user.levelTitle ? <span>{user.levelTitle}</span> : null}
                  {typeof user.topicCount === "number" ? (
                    <span>
                      {t("pages.search.userTopics", {
                        count: user.topicCount,
                      })}
                    </span>
                  ) : null}
                  {typeof user.fansCount === "number" ? (
                    <span>
                      {t("pages.search.userFans", { count: user.fansCount })}
                    </span>
                  ) : null}
                  {item.createTime ? <span>{formatDate(item.createTime)}</span> : null}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
