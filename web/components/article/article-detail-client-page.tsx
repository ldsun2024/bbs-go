"use client"

import * as React from "react"
import Link from "@/components/common/link"

import { ArticleComments } from "@/components/article/article-comments"
import { ArticleManageMenu } from "@/components/article/article-manage-menu"
import { HtmlImagePreview } from "@/components/common/image-preview"
import { MainShell } from "@/components/layout/main-shell"
import { PageError, PageLoading } from "@/components/common/page-state"
import { TopicToc } from "@/components/topic/topic-toc"
import { UserInfo } from "@/components/user/user-info"
import { useAppConfig, useCurrentUser } from "@/components/app/app-provider"
import { apiFetch } from "@/lib/api/client"
import type { Article, Comment, PageData } from "@/lib/api/types"
import { prettyDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { useRouteData, useRouteSegment } from "@/lib/spa-route"
import { useDocumentTitle } from "@/lib/use-document-title"

const emptyComments: PageData<Comment> = {
  results: [],
  cursor: "0",
  hasMore: false,
}

type ArticleDetailData = {
  article: Article
  comments: PageData<Comment>
}

export function ArticleDetailClientPage({
  initialArticle,
}: {
  initialArticle?: Article
}) {
  const id = useRouteSegment(1)
  const { t } = useI18n()
  const config = useAppConfig()
  const currentUser = useCurrentUser()
  const initialData = React.useMemo<ArticleDetailData | null>(
    () =>
      initialArticle
        ? {
            article: initialArticle,
            comments: emptyComments,
          }
        : null,
    [initialArticle]
  )
  const load = React.useCallback(async (): Promise<ArticleDetailData> => {
    const comments = apiFetch<PageData<Comment>>("/api/comment/comments", {
      params: { entityType: "article", entityId: id },
    }).catch(() => emptyComments)

    if (initialArticle) {
      return { article: initialArticle, comments: await comments }
    }

    const [article, nextComments] = await Promise.all([
      apiFetch<Article>(`/api/article/${id}`),
      comments,
    ])

    return { article, comments: nextComments }
  }, [id, initialArticle])
  const { data, loading, error } = useRouteData(
    `article:${id}`,
    load,
    initialData
  )
  useDocumentTitle(data?.article.title)

  if (loading && !data)
    return (
      <MainShell>
        <PageLoading />
      </MainShell>
    )
  if (error || !data)
    return (
      <MainShell>
        <PageError message={error} />
      </MainShell>
    )

  const { article, comments } = data

  return (
    <MainShell
      sideSize="360"
      aside={
        <>
          {article.user ? <UserInfo user={article.user} t={t} /> : null}
          <TopicToc items={article.toc} />
        </>
      }
      containerClassName="side-size-360"
      asideClassName="!h-auto self-stretch"
    >
      <div className="space-y-6">
        {article.status === 2 ? (
          <div className="border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {t("pages.article.detail.pending")}
          </div>
        ) : null}
        <article>
          <header className="border-b border-border pb-4">
            <div className="flex items-start gap-3">
              <h1 className="w-full text-h2 leading-tight font-semibold break-all text-foreground md:text-h1 md:leading-[1.15]">
                {article.title}
              </h1>
              <div className="min-w-max">
                <ArticleManageMenu
                  article={article}
                  currentUser={currentUser}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {article.user ? (
                <Link
                  href={`/user/${article.user.id}`}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {article.user.nickname}
                </Link>
              ) : null}
              {article.createTime ? (
                <time
                  dateTime={new Date(article.createTime).toISOString()}
                  className="font-mono tabular-nums"
                >
                  {prettyDate(article.createTime, t)}
                </time>
              ) : null}
              {article.tags?.length ? (
                <span className="flex flex-wrap items-center gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/articles/tag/${tag.id}`}
                      className="font-mono text-micro tracking-[0.04em] uppercase underline-offset-4 hover:text-foreground hover:underline"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </span>
              ) : null}
            </div>
          </header>

          {article.cover?.url ? (
            <img
              src={article.cover.url}
              alt={article.title}
              className="mt-6 w-full border border-border object-cover"
            />
          ) : null}

          <HtmlImagePreview
            html={article.content || ""}
            className="bbs-content max-w-none py-6 break-words [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_h4]:scroll-mt-20 [&_img]:cursor-zoom-in"
          />
        </article>
        <ArticleComments
          entityId={article.id}
          commentCount={article.commentCount}
          initialComments={comments}
          currentUser={currentUser}
          config={config}
        />
      </div>
    </MainShell>
  )
}
