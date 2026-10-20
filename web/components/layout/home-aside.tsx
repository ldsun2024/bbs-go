"use client"

import * as React from "react"
import Link from "@/components/common/link"
import { Trophy } from "lucide-react"

import { UserAvatar } from "@/components/common/avatar"
import { CheckInCard, TasksUserCard } from "@/components/tasks/task-widgets"
import { useAppState } from "@/components/app/app-provider"
import { apiFetch } from "@/lib/api/client"
import type { Badge, CheckInInfo, UserSummary } from "@/lib/api/types"
import type { FriendLink } from "@/lib/api/misc"
import type { TFunction } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n/provider"

function displayName(user: UserSummary) {
  return user.nickname || user.username || "User"
}

function WidgetCard({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      {title || actions ? (
        <div className="mb-4 flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-2">
          <h2 className="font-mono text-micro font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {title}
          </h2>
          {actions ? (
            <div className="shrink-0 text-xs font-normal">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className="break-all">{children}</div>
    </section>
  )
}

function SiteNotice({ title, content }: { title: string; content?: string }) {
  if (!content) {
    return null
  }

  return (
    <WidgetCard title={title}>
      <div
        className="prose prose-sm max-w-none text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </WidgetCard>
  )
}

function ScoreRank({
  title,
  users,
  t,
}: {
  title: string
  users: UserSummary[]
  t: TFunction
}) {
  if (!users.length) {
    return null
  }

  return (
    <WidgetCard title={title}>
      <ul className="score-rank">
        {users.slice(0, 10).map((user) => (
          <li
            key={user.id}
            className="flex list-none items-center gap-2 border-b border-border py-2 last:border-b-0"
          >
            <UserAvatar user={user} size={24} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/user/${user.id}`}
                className="block truncate text-sm text-foreground transition-colors hover:text-primary"
              >
                {displayName(user)}
              </Link>
              <p className="block font-mono text-micro text-muted-foreground">
                {user.topicCount ?? 0} {t("component.scoreRank.topic")}{" "}
                <span>·</span> {user.commentCount ?? 0}{" "}
                {t("component.scoreRank.comment")}
              </p>
            </div>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold tabular-nums text-foreground">
              <Trophy className="size-3 text-muted-foreground" />
              {user.score ?? 0}
            </span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

function FriendLinks({
  title,
  more,
  links,
}: {
  title: string
  more: string
  links: FriendLink[]
}) {
  if (!links.length) {
    return null
  }

  return (
    <WidgetCard
      title={title}
      actions={
        <Link
          href="/links"
          className="text-muted-foreground hover:text-primary"
        >
          {more}
        </Link>
      }
    >
      <ul className="links">
        {links.map((link) => (
          <li key={link.id} className="link">
            <a
              href={link.url || "#"}
              title={link.title}
              className="link-title"
              target="_blank"
              rel="noreferrer"
            >
              {link.title}
            </a>
            {link.summary ? (
              <p className="link-summary">{link.summary}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

export function HomeAside() {
  const { config, currentUser: user } = useAppState()
  const { t } = useI18n()
  const [scoreRank, setScoreRank] = React.useState<UserSummary[]>([])
  const [checkIn, setCheckIn] = React.useState<CheckInInfo | null>(null)
  const [checkInRank, setCheckInRank] = React.useState<CheckInInfo[]>([])
  const [friendLinks, setFriendLinks] = React.useState<FriendLink[]>([])
  const [badges, setBadges] = React.useState<Badge[]>([])

  React.useEffect(() => {
    let mounted = true
    void Promise.all([
      apiFetch<UserSummary[]>("/api/user/score/rank").catch(() => []),
      apiFetch<CheckInInfo | null>("/api/checkin/checkin").catch(() => null),
      apiFetch<CheckInInfo[]>("/api/checkin/rank").catch(() => []),
      apiFetch<FriendLink[]>("/api/link/top_links").catch(() => []),
    ]).then(([nextScoreRank, nextCheckIn, nextCheckInRank, nextLinks]) => {
      if (!mounted) return
      setScoreRank(Array.isArray(nextScoreRank) ? nextScoreRank : [])
      setCheckIn(nextCheckIn)
      setCheckInRank(Array.isArray(nextCheckInRank) ? nextCheckInRank : [])
      setFriendLinks(Array.isArray(nextLinks) ? nextLinks : [])
    })

    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!user) {
      setBadges([])
      return
    }
    let mounted = true
    void apiFetch<Badge[]>("/api/badge/badges", {
      params: { userId: user.id },
    })
      .then((nextBadges) => {
        if (mounted) setBadges(nextBadges || [])
      })
      .catch(() => {
        if (mounted) setBadges([])
      })

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <>
      <SiteNotice
        title={t("component.siteNotice.title")}
        content={config?.siteNotification}
      />
      <TasksUserCard user={user} badges={badges} />
      <CheckInCard initialCheckIn={checkIn} initialRank={checkInRank} />
      <ScoreRank
        title={t("component.scoreRank.title")}
        users={scoreRank}
        t={t}
      />
      <FriendLinks
        title={t("component.friendLinks.title")}
        more={t("component.friendLinks.more")}
        links={friendLinks}
      />
    </>
  )
}
