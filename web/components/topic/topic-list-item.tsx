"use client"

import {
  CheckCircle2,
  CircleHelp,
  ImageIcon,
  ListChecks,
  MessageCircle,
} from "lucide-react"
import Link from "@/components/common/link"

import { useAppConfig } from "@/components/app/app-provider"
import { UserAvatar } from "@/components/common/avatar"
import { TopicLikeButton } from "@/components/topic/topic-like-button"
import { TopicVoteCard } from "@/components/topic/topic-vote-card"
import type { Topic } from "@/lib/api/types"
import { prettyDate } from "@/lib/format"
import type { TFunction } from "@/lib/i18n"

type TopicListVariant = "default" | "compact"

function getTopicImageSizeClass(count: number) {
  if (count <= 1) {
    return "h-[160px] w-[160px] sm:h-[210px] sm:w-[210px]"
  }
  if (count === 2) {
    return "h-[128px] w-[128px] sm:h-[180px] sm:w-[180px]"
  }
  return "h-[94px] w-[94px] sm:h-[120px] sm:w-[120px]"
}

function formatCompactTopicViewCount(viewCount?: number) {
  if (!viewCount || viewCount <= 0) {
    return "0"
  }
  return viewCount > 9999 ? "9999+" : String(viewCount)
}

function TopicContentMarks({ topic, t }: { topic: Topic; t: TFunction }) {
  const imageCount = topic.type === 1 ? topic.imageList?.length || 0 : 0
  const hasVote = Boolean(topic.vote)

  if (!imageCount && !hasVote) {
    return null
  }

  return (
    <>
      {imageCount ? (
        <span
          className="inline-flex h-[18px] shrink-0 items-center gap-1 rounded-sm bg-muted px-1.5 text-[11px] leading-none text-muted-foreground"
          title={t("component.topicList.hasImages")}
        >
          <ImageIcon className="h-3 w-3" />
          <span>
            {imageCount > 1
              ? t("component.topicList.imageMarkWithCount", {
                  count: imageCount,
                })
              : t("component.topicList.imageMark")}
          </span>
        </span>
      ) : null}
      {hasVote ? (
        <span
          className="inline-flex h-[18px] shrink-0 items-center gap-1 rounded-sm bg-muted px-1.5 text-[11px] leading-none text-muted-foreground"
          title={t("component.topicList.hasVote")}
        >
          <ListChecks className="h-3 w-3" />
          <span>{t("component.topicList.voteMark")}</span>
        </span>
      ) : null}
    </>
  )
}

export function TopicListItem({
  topic,
  showSticky,
  t,
  variant,
}: {
  topic: Topic
  showSticky?: boolean
  t: TFunction
  variant?: TopicListVariant
}) {
  const config = useAppConfig()
  const resolvedVariant: TopicListVariant =
    variant || (config?.topicListStyle === "compact" ? "compact" : "default")
  const displayName =
    topic.user.nickname || topic.user.username || topic.user.id
  const topicHref = `/topic/${topic.id}`
  const imageSizeClass = getTopicImageSizeClass(topic.imageList?.length || 0)

  if (resolvedVariant === "compact") {
    const compactTitle =
      topic.type === 1
        ? topic.content || topic.summary || topic.title || "-"
        : topic.title || topic.summary || "-"
    const replyTime =
      topic.updateTime && topic.updateTime !== topic.createTime
        ? prettyDate(topic.updateTime, t)
        : ""

    return (
      <li
        className="topic-type-mark px-3 py-3 pl-4 sm:px-4 sm:pl-5"
        data-topic-type={topic.type}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={topic.user}
              size={32}
              className="shrink-0 bg-muted text-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5 leading-5">
                {showSticky && topic.sticky ? (
                  <span className="ui-type shrink-0">
                    {t("component.topicList.sticky")}
                  </span>
                ) : null}
                {topic.type === 2 ? (
                  <span className="ui-type ui-type--muted shrink-0">
                    {topic.qaStatus === "solved" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <CircleHelp className="mr-1 h-3 w-3" />
                    )}
                    {topic.qaStatus === "solved"
                      ? t("component.topicList.qaSolved")
                      : t("component.topicList.qaUnsolved")}
                  </span>
                ) : null}
                <TopicContentMarks topic={topic} t={t} />
                <Link
                  href={topicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-1 min-w-0 text-sm font-medium break-all text-foreground hover:text-primary"
                >
                  {compactTitle}
                </Link>
              </div>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-4 text-muted-foreground">
                {topic.category ? (
                  <>
                    <Link
                      href={`/topics/category/${topic.category.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ui-tag-mono max-w-32 shrink-0 truncate hover:text-foreground"
                    >
                      <span className="truncate">{topic.category.name}</span>
                    </Link>
                    <span className="text-border">•</span>
                  </>
                ) : null}
                <Link
                  href={`/user/${topic.user.id}`}
                  target="_blank"
                  className="max-w-28 truncate hover:text-foreground"
                >
                  {displayName}
                </Link>
                <span className="text-border">•</span>
                <span>{prettyDate(topic.createTime, t)}</span>
                {replyTime ? (
                  <>
                    <span className="text-border">•</span>
                    <span>
                      {t("component.topicList.lastReply", { time: replyTime })}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <span
            className="ui-mono inline-flex h-7 min-w-9 items-center justify-center border border-border px-2 text-sm leading-none font-semibold text-muted-foreground"
            aria-label="views"
          >
            {formatCompactTopicViewCount(topic.viewCount)}
          </span>
        </div>
      </li>
    )
  }

  return (
    <li
      className="topic-type-mark group relative grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-3 border-b border-border px-4 py-5 transition-colors last:border-b-0 hover:bg-muted md:grid-cols-[40px_minmax(0,1fr)_176px] md:gap-x-4 md:px-6 md:py-6"
      data-topic-type={topic.type}
    >
      <span className="topic-index" aria-hidden="true" />

      <div className="min-w-0">
        {showSticky || topic.type === 2 ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {showSticky && topic.sticky ? (
              <span className="font-mono text-micro tracking-[0.08em] text-primary uppercase">
                {t("component.topicList.sticky")}
              </span>
            ) : null}
            {topic.type === 2 ? (
              <span className="inline-flex items-center gap-1 border-b border-foreground pb-0.5 font-mono text-micro tracking-[0.08em] text-foreground uppercase">
                {topic.qaStatus === "solved" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <CircleHelp className="h-3 w-3" />
                )}
                {topic.qaStatus === "solved"
                  ? t("component.topicList.qaSolved")
                  : t("component.topicList.qaUnsolved")}
              </span>
            ) : null}
            {topic.type === 2 && topic.bountyScore ? (
              <span className="font-mono text-micro tracking-[0.08em] text-muted-foreground uppercase">
                {t("pages.topic.detail.bountyLabel", {
                  score: topic.bountyScore,
                })}
              </span>
            ) : null}
          </div>
        ) : null}

        {topic.type !== 1 ? (
          <>
            <Link
              href={topicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-h4 leading-snug font-semibold break-all text-foreground transition-colors group-hover:text-primary"
            >
              {topic.title}
            </Link>
            {topic.summary ? (
              <Link
                href={topicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 line-clamp-2 block text-base leading-[1.7] break-all text-muted-foreground hover:text-foreground"
              >
                {topic.summary}
              </Link>
            ) : null}
          </>
        ) : (
          <>
            {topic.content ? (
              <Link
                href={topicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 block text-base leading-[1.7] break-all whitespace-pre-line text-foreground"
              >
                {topic.content}
              </Link>
            ) : null}
            {topic.imageList?.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {topic.imageList.slice(0, 9).map((image, index) => (
                  <li
                    key={`${image.preview || image.url || "image"}-${index}`}
                    className={imageSizeClass}
                  >
                    <Link
                      href={topicHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full w-full overflow-hidden bg-muted"
                    >
                      <img
                        src={image.preview || image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}

        {topic.vote ? (
          <TopicVoteCard className="mt-3 mb-2" vote={topic.vote} />
        ) : null}
      </div>

      <div className="col-start-2 row-start-2 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground md:col-start-3 md:row-start-1 md:mt-0 md:flex-col md:items-start md:justify-between md:border-l md:border-border md:pl-4">
        <div className="flex min-w-0 items-center gap-2">
          <UserAvatar user={topic.user} size={24} className="shrink-0" />
          <Link
            href={`/user/${topic.user.id}`}
            target="_blank"
            className="max-w-32 truncate hover:text-foreground"
          >
            {displayName}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono tabular-nums">
          {topic.viewCount ? (
            <span>
              <b className="font-semibold text-foreground">{topic.viewCount}</b>{" "}
              VIEW
            </span>
          ) : null}
          <Link
            href={topicHref}
            className="transition-colors hover:text-primary"
          >
            <b className="font-semibold text-foreground">
              {topic.commentCount || 0}
            </b>{" "}
            REPLY
          </Link>
          <span>{prettyDate(topic.createTime, t)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TopicLikeButton
            topicId={topic.id}
            initialLiked={topic.liked}
            initialLikeCount={topic.likeCount}
          />
          {topic.category ? (
            <Link
              href={`/topics/category/${topic.category.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-full truncate font-mono text-micro tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {topic.category.name}
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-1 md:hidden">
            <MessageCircle className="h-3.5 w-3.5" />
            {topic.commentCount || 0}
          </span>
        </div>
      </div>
    </li>
  )
}
