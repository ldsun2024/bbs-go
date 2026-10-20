"use client"

import * as React from "react"
import { useSearchParams } from "react-router-dom"

import { EmptyState } from "@/components/common/empty-state"
import { LoadMore } from "@/components/common/load-more"
import { HomeAside } from "@/components/layout/home-aside"
import { MainShell } from "@/components/layout/main-shell"
import { PageLoading } from "@/components/common/page-state"
import { TopicFeedTabs } from "@/components/topic/topic-feed-tabs"
import { TopicListItem } from "@/components/topic/topic-list-item"
import { TopicsNavContent } from "@/components/topic/topics-nav-content"
import { TopicSubCategoryNav } from "@/components/topic/topic-sub-category-nav"
import { apiFetch } from "@/lib/api/client"
import type { PageData, Tag, Topic, Category } from "@/lib/api/types"
import { useI18n } from "@/lib/i18n/provider"
import { useRouteData, useRouteSegment } from "@/lib/spa-route"
import { useDocumentTitle } from "@/lib/use-document-title"
import { cn } from "@/lib/utils"

function resolveCategoryId(id: string) {
  if (id === "newest") return 0
  if (id === "recommend") return -1
  if (id === "feed") return -2
  const parsed = Number.parseInt(id, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

const qaStatusOptions = ["", "unsolved", "solved"]
const sortOptions = ["latestPublish", "latestReply"]

type TopicListInitialData = {
  topics?: PageData<Topic>
  categories?: Category[]
}

export function TopicTagClientPage({
  initialData,
}: {
  initialData?: TopicListInitialData
}) {
  const tagId = useRouteSegment(2)
  const { t } = useI18n()
  const load = React.useCallback(
    () => apiFetch<Tag>(`/api/tag/${tagId}`).catch(() => ({ id: 0, name: "" })),
    [tagId]
  )
  const { data: tag, loading } = useRouteData(`topic-tag:${tagId}`, load)
  const currentTag = String(tag?.id) === tagId ? tag : undefined
  useDocumentTitle(currentTag?.name, t("pages.topics.title"))
  const labels = {
    loadMore: t("common.loadMore.loadMore"),
    noMore: t("common.loadMore.noMore"),
  }

  return (
    <MainShell aside={<HomeAside />}>
      <div className="topics-wrapper">
        <TopicsNavContent initialCategories={initialData?.categories || []} />
        <div className="topics-main">
          {currentTag?.name ? (
            <div className="mb-6 border-b-2 border-foreground px-4 pb-4 md:px-6">
              <div className="font-mono text-micro tracking-[0.12em] text-muted-foreground uppercase">
                TAG / {t("pages.topics.title")}
              </div>
              <h1 className="mt-2 text-h2 font-semibold text-foreground md:text-h1">
                #{currentTag.name}
              </h1>
            </div>
          ) : null}
          <div>
            {loading ? <PageLoading /> : null}
            <LoadMore<Topic>
              initialItems={initialData?.topics?.results || []}
              initialCursor={initialData?.topics?.cursor || "0"}
              initialHasMore={initialData?.topics?.hasMore || false}
              initialLoad={!initialData?.topics}
              autoLoadOnScroll
              resetKey={`topic-tag:${tagId}`}
              labels={labels}
              loadPage={({ cursor }) =>
                apiFetch<PageData<Topic>>("/api/topic/tag/topics", {
                  params: { tagId, cursor },
                })
              }
              renderItems={(items) => (
                <ul className="[counter-reset:topic]">
                  {items.map((topic) => (
                    <TopicListItem key={topic.id} topic={topic} t={t} />
                  ))}
                </ul>
              )}
              renderEmpty={() => <EmptyState title={t("common.noData")} />}
            />
          </div>
        </div>
      </div>
    </MainShell>
  )
}

export function NodeTopicClientPage({
  initialData,
}: {
  initialData?: TopicListInitialData
}) {
  const id = useRouteSegment(2)
  const categoryId = resolveCategoryId(id)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useI18n()
  const load = React.useCallback(
    () =>
      apiFetch<Category>("/api/topic/category", { params: { categoryId } }).catch(
        (): Category => ({ id: categoryId, name: "", children: [] })
      ),
    [categoryId]
  )
  const { data: node } = useRouteData(`category:${id}`, load)
  const currentNode =
    categoryId > 0 && String(node?.id) === String(categoryId) ? node : undefined
  const rootCategoryId = currentNode?.parentId || currentNode?.id || categoryId
  const loadRootNode = React.useCallback(() => {
    if (categoryId <= 0) return Promise.resolve<Category | null>(null)
    if (!currentNode?.parentId) return Promise.resolve(currentNode || null)
    return apiFetch<Category>("/api/topic/category", {
      params: { categoryId: currentNode.parentId },
    }).catch(() => null)
  }, [currentNode, categoryId])
  const { data: rootNode } = useRouteData<Category | null>(
    categoryId > 0 ? `topic-root-node:${rootCategoryId}` : "",
    loadRootNode,
    null
  )
  const currentRootNode =
    categoryId > 0 && String(rootNode?.id) === String(rootCategoryId)
      ? rootNode
      : currentNode?.id === rootCategoryId
        ? currentNode
        : undefined
  const subNodes =
    categoryId > 0 && currentRootNode?.children?.length
      ? currentRootNode.children
      : []
  const isQaNode = categoryId > 0 && currentNode?.type === "qa"
  const isNormalNode = categoryId > 0 && currentNode && currentNode.type !== "qa"
  const qaStatusValue = searchParams.get("qaStatus") || ""
  const qaStatus = qaStatusOptions.includes(qaStatusValue) ? qaStatusValue : ""
  const sortValue = searchParams.get("sort") || ""
  const normalSort = sortOptions.includes(sortValue) ? sortValue : "latestPublish"
  const currentFilters = isQaNode
    ? [
        { value: "", label: t("pages.qa.filterAll") },
        { value: "unsolved", label: t("pages.qa.filterUnsolved") },
        { value: "solved", label: t("pages.qa.filterSolved") },
      ]
    : isNormalNode
      ? [
          {
            value: "latestPublish",
            label: t("pages.topics.filterLatestPublish"),
          },
          {
            value: "latestReply",
            label: t("pages.topics.filterLatestReply"),
          },
        ]
      : []
  const currentFilterValue = isQaNode ? qaStatus : isNormalNode ? normalSort : ""
  const currentFilterLabel =
    currentFilters.find((item) => item.value === currentFilterValue)?.label || ""
  useDocumentTitle(currentNode?.name, t("pages.topics.title"))
  const labels = {
    loadMore: t("common.loadMore.loadMore"),
    noMore: t("common.loadMore.noMore"),
  }

  function switchFilter(value: string) {
    const next = new URLSearchParams(searchParams)
    if (isQaNode) {
      next.delete("sort")
      if (value) {
        next.set("qaStatus", value)
      } else {
        next.delete("qaStatus")
      }
    } else if (isNormalNode) {
      next.delete("qaStatus")
      next.set("sort", value)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <MainShell aside={<HomeAside />}>
      <div className="topics-wrapper">
        <TopicsNavContent
          initialCategories={initialData?.categories || []}
          currentCategoryId={categoryId}
          currentRootCategoryId={rootCategoryId}
        />
        <div className="topics-main">
          {currentNode?.name ? (
            <div className="mb-6 border-b border-border px-4 pb-5 md:px-6">
              <div className="flex items-start gap-3">
                {currentNode.logo ? (
                  <img
                    src={currentNode.logo}
                    alt={currentNode.name || ""}
                    className="h-10 w-10 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h1 className="text-h2 font-semibold text-foreground">
                    {currentNode.name}
                  </h1>
                  {currentNode.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-[1.7] text-muted-foreground">
                      {currentNode.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          <div>
            {categoryId <= 0 ? (
              <TopicFeedTabs currentCategoryId={categoryId} />
            ) : null}
            <TopicSubCategoryNav
              rootCategoryId={rootCategoryId}
              categories={subNodes}
              currentCategoryId={categoryId}
            />
            {currentFilters.length > 0 ? (
              <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 pb-3 md:px-6">
                <h2 className="font-mono text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
                  {currentFilterLabel}
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {currentFilters.map((item) => {
                    const selected = item.value === currentFilterValue
                    return (
                      <button
                        key={item.value || "all"}
                        type="button"
                        className={cn(
                          "transition-colors",
                          selected
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground/60 hover:text-muted-foreground"
                        )}
                        aria-pressed={selected}
                        onClick={() => switchFilter(item.value)}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
            <LoadMore<Topic>
              initialItems={initialData?.topics?.results || []}
              initialCursor={initialData?.topics?.cursor || "0"}
              initialHasMore={initialData?.topics?.hasMore || false}
              initialLoad={!initialData?.topics}
              autoLoadOnScroll
              resetKey={`category:${categoryId}:${currentNode?.type || ""}:${currentFilterValue}`}
              labels={labels}
              loadPage={({ cursor }) =>
                apiFetch<PageData<Topic>>("/api/topic/topics", {
                  params: {
                    categoryId,
                    cursor,
                    ...(isQaNode && qaStatus ? { qaStatus } : {}),
                    ...(isNormalNode ? { sort: normalSort } : {}),
                  },
                })
              }
              renderItems={(items) => (
                <ul className="[counter-reset:topic]">
                  {items.map((topic) => (
                    <TopicListItem
                      key={topic.id}
                      topic={topic}
                      showSticky
                      t={t}
                    />
                  ))}
                </ul>
              )}
              renderEmpty={() => <EmptyState title={t("common.noData")} />}
            />
          </div>
        </div>
      </div>
    </MainShell>
  )
}
