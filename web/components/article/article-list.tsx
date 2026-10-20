import Link from "@/components/common/link"
import { UserAvatar } from "@/components/common/avatar"

import { EmptyState } from "@/components/common/empty-state"
import type { Article } from "@/lib/api/types"
import { prettyDate } from "@/lib/format"
import type { TFunction } from "@/lib/i18n"

export function ArticleList({
  articles,
  t,
}: {
  articles: Article[]
  t: TFunction
}) {
  if (!articles.length) {
    return <EmptyState title={t("common.noData")} />
  }

  return (
    <div>
      {articles.map((article) => (
        <ArticleListItem key={article.id} article={article} t={t} />
      ))}
    </div>
  )
}

function ArticleListItem({ article, t }: { article: Article; t: TFunction }) {
  const authorName =
    article.user.nickname || article.user.username || `#${article.user.id}`
  const articleUrl = `/article/${article.id}`
  const hasCover = Boolean(article.cover?.url)

  return (
    <article
      className={`group grid grid-cols-[minmax(0,1fr)] items-start gap-6 border-b border-border px-4 py-6 transition-colors last:border-b-0 hover:bg-muted md:px-6 ${
        hasCover ? "md:grid-cols-[160px_minmax(0,1fr)]" : ""
      }`}
    >
      {hasCover ? (
        <Link
          href={articleUrl}
          target="_blank"
          className="hidden aspect-[16/10] overflow-hidden border border-border bg-muted md:block"
          aria-label={article.title}
        >
          <img
            src={article.cover?.preview || article.cover?.url}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </Link>
      ) : null}

      <div className="min-w-0">
        <Link
          href={articleUrl}
          target="_blank"
          className="block text-h4 leading-snug font-semibold text-balance text-foreground transition-colors group-hover:text-primary md:text-h3 md:leading-[1.35]"
        >
          {article.title}
        </Link>

        {article.summary ? (
          <p className="mt-2 line-clamp-2 text-base leading-[1.7] break-words text-muted-foreground">
            {article.summary}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-2">
            <UserAvatar user={article.user} size={20} className="shrink-0" />
            <Link
              href={`/user/${article.user.id}`}
              className="max-w-32 truncate transition-colors hover:text-foreground"
            >
              {authorName}
            </Link>
          </span>
          {article.createTime ? (
            <time
              dateTime={new Date(article.createTime).toISOString()}
              className="font-mono tabular-nums"
            >
              <span className="sr-only">
                {t("component.articleList.publishedAt")}{" "}
              </span>
              {prettyDate(article.createTime, t)}
            </time>
          ) : null}
          <ArticleMetric label="VIEW" value={article.viewCount} />
          <ArticleMetric
            label="REPLY"
            value={article.commentCount ?? 0}
            alwaysShow
          />
          <ArticleMetric label="LIKE" value={article.likeCount} />
          {article.tags?.length ? (
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles/tag/${tag.id}`}
                  className="font-mono text-micro tracking-[0.04em] text-muted-foreground uppercase underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  #{tag.name}
                </Link>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ArticleMetric({
  label,
  value,
  alwaysShow = false,
}: {
  label: string
  value?: number
  alwaysShow?: boolean
}) {
  if (!alwaysShow && !value) {
    return null
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <b className="font-mono text-micro font-normal tracking-[0.06em] text-muted-foreground/70">
        {label}
      </b>
      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
        {formatCount(value ?? 0)}
      </span>
    </span>
  )
}

function formatCount(value: number) {
  if (value >= 10000) {
    return `${Number((value / 10000).toFixed(1))}w`
  }
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`
  }
  return String(value)
}
