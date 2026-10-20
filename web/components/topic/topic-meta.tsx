import Link from "@/components/common/link"

import { UserAvatar } from "@/components/common/avatar"
import { TopicManageMenu } from "@/components/topic/topic-manage-menu"
import type { Topic } from "@/lib/api/types"
import type { UserSummary } from "@/lib/api/types"
import { prettyDate } from "@/lib/format"
import type { TFunction } from "@/lib/i18n"

export function TopicMeta({
  topic,
  currentUser,
  t,
}: {
  topic: Topic
  currentUser?: UserSummary | null
  t: TFunction
}) {
  const displayName =
    topic.user.nickname || topic.user.username || topic.user.id

  return (
    <div className="mt-4 flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <UserAvatar user={topic.user} size={28} />
        <Link
          href={`/user/${topic.user.id}`}
          className="max-w-40 truncate font-medium text-foreground transition-colors hover:text-primary"
        >
          {displayName}
        </Link>
        {topic.createTime ? (
          <time
            dateTime={new Date(topic.createTime).toISOString()}
            className="font-mono tabular-nums"
          >
            <span className="sr-only">
              {t("pages.topic.detail.publishedAt")}{" "}
            </span>
            {prettyDate(topic.createTime, t)}
          </time>
        ) : null}
        {topic.type === 2 ? (
          <span className="font-mono text-micro tracking-[0.08em] uppercase">
            {topic.qaStatus === "solved" ? (
              <span className="border-b border-foreground pb-0.5 text-foreground">
                {t("pages.topic.detail.qaSolved")}
              </span>
            ) : (
              <span className="border-b border-border pb-0.5">
                {t("pages.topic.detail.qaUnsolved")}
              </span>
            )}
          </span>
        ) : null}
        {topic.type === 2 && topic.bountyScore ? (
          <span className="font-mono text-micro tracking-[0.08em] text-foreground uppercase">
            {t("pages.topic.detail.bountyLabel", {
              score: topic.bountyScore,
            })}
          </span>
        ) : null}
        {topic.ipLocation ? (
          <span className="text-micro">
            {t("pages.topic.detail.ipLocation")}
            {topic.ipLocation}
          </span>
        ) : null}
      </div>
      <div className="shrink-0">
        <TopicManageMenu topic={topic} currentUser={currentUser} />
      </div>
    </div>
  )
}
