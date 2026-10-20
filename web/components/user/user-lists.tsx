import * as React from "react"

import Link from "@/components/common/link"
import { ChevronRight, MessageSquareQuote, Trophy } from "lucide-react"

import { UserAvatar } from "@/components/common/avatar"
import { EmptyState } from "@/components/common/empty-state"
import type { Favorite, ScoreLog, UserMessage } from "@/lib/api/types"
import { formatDateTime, prettyDate } from "@/lib/format"
import type { TFunction } from "@/lib/i18n"

export function FavoriteList({
  favorites,
  t,
}: {
  favorites: Favorite[]
  t: TFunction
}) {
  if (!favorites.length) {
    return <EmptyState title={t("common.noData")} />
  }

  return (
    <ul className="favorite-list">
      {favorites.map((item) => (
        <li key={item.id} className="favorite-item">
          {item.deleted ? (
            <div className="favorite-summary">
              {t("user.favorites.contentExpired")}
            </div>
          ) : (
            <div>
              <div className="favorite-title">
                <a href={item.url || "#"} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              </div>
              {item.content ? (
                <div className="favorite-summary">{item.content}</div>
              ) : null}
              <div className="favorite-meta">
                {item.user ? (
                  <span className="favorite-meta-item">
                    <Link href={`/user/${item.user.id}`}>
                      {item.user.nickname || item.user.username}
                    </Link>
                  </span>
                ) : null}
                {item.createTime ? (
                  <span className="favorite-meta-item">
                    <time>{prettyDate(item.createTime, t)}</time>
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/* B5：时间分组，把上百条消息拆成「今天 / 昨天 / 更早」三段 */
const MESSAGE_DAY_KEYS = ["today", "yesterday", "earlier"] as const
type MessageDayKey = (typeof MESSAGE_DAY_KEYS)[number]

function messageDayKey(createTime?: number): MessageDayKey {
  if (!createTime) return "earlier"
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  // createTime 为秒级时间戳，兼容毫秒
  const timestamp = createTime < 1e12 ? createTime * 1000 : createTime
  if (timestamp >= startOfToday) return "today"
  if (timestamp >= startOfToday - 86_400_000) return "yesterday"
  return "earlier"
}

export function MessageList({
  messages,
  t,
}: {
  messages: UserMessage[]
  t: TFunction
}) {
  if (!messages.length) {
    return <EmptyState title={t("common.noData")} />
  }

  const dayLabels: Record<MessageDayKey, string> = {
    today: t("user.messages.today"),
    yesterday: t("user.messages.yesterday"),
    earlier: t("user.messages.earlier"),
  }
  let lastDayKey: MessageDayKey | null = null

  return (
    <ul className="flex w-full list-none flex-col">
      {messages.map((message) => {
        const dayKey = messageDayKey(message.createTime)
        const showDayHeader = dayKey !== lastDayKey
        lastDayKey = dayKey

        return (
          <React.Fragment key={message.id}>
            {showDayHeader ? (
              <li className="list-none border-b border-border px-0 pt-4 pb-2 font-mono text-micro tracking-[0.12em] text-muted-foreground uppercase select-none">
                {dayLabels[dayKey]}
              </li>
            ) : null}
            <li className="box-border w-full border-b border-border py-4 last:border-b-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <UserAvatar user={message.from} size={28} />
            {message.from?.id ? (
              <Link
                href={`/user/${message.from.id}`}
                target="_blank"
                className="text-sm font-semibold text-foreground underline-offset-2 hover:underline"
              >
                {message.from.nickname}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {message.from?.nickname}
              </span>
            )}
            {message.createTime ? (
              <span className="ui-mono text-xs whitespace-nowrap text-muted-foreground">
                {prettyDate(message.createTime, t)}
              </span>
            ) : null}
            {message.title ? (
              <span className="ui-type ui-type--muted max-w-full break-all">
                {message.title}
              </span>
            ) : null}
          </div>
          <div className="mt-2 space-y-2">
            {message.content ? (
              <div className="text-sm leading-[1.7] break-words whitespace-pre-line text-foreground">
                {message.content}
              </div>
            ) : null}
            {message.quoteContent ? (
              <div className="relative border-l-2 border-border bg-muted px-3 py-2 pr-8">
                <MessageSquareQuote
                  size={12}
                  className="absolute top-2 right-2 text-muted-foreground/70"
                />
                <div className="text-xs leading-[1.7] break-words text-muted-foreground">
                  {message.quoteContent}
                </div>
              </div>
            ) : null}
            {message.detailUrl && !isSelfMessagesUrl(message.detailUrl) ? (
              <a
                href={message.detailUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t("user.messages.viewDetails")}
                <ChevronRight size={12} />
              </a>
            ) : null}
          </div>
            </li>
          </React.Fragment>
        )
      })}
    </ul>
  )
}

export function ScoreLogList({
  scoreLogs,
  t,
}: {
  scoreLogs: ScoreLog[]
  t: TFunction
}) {
  if (!scoreLogs.length) {
    return (
      <div className="border-t-2 border-foreground px-4 py-14 text-center">
        <Trophy
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40"
          strokeWidth="1.5"
        />
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      </div>
    )
  }

  return (
    <ul className="flex w-full list-none flex-col">
      {scoreLogs.map((scoreLog) => {
        const gain = scoreLog.type === 0
        return (
          <li
            key={scoreLog.id}
            className="flex min-w-0 flex-col gap-1.5 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
              <span className="ui-type ui-type--muted">
                {gain
                  ? t("user.scores.gainPoints")
                  : t("user.scores.losePoints")}
              </span>
              <span
                className={
                  gain
                    ? "inline-flex items-center gap-1 font-mono font-semibold text-foreground tabular-nums"
                    : "ui-strike inline-flex items-center gap-1 font-mono font-semibold tabular-nums"
                }
              >
                <Trophy className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {gain ? "+" : "−"}
                {scoreLog.score}
              </span>
            </div>
            {scoreLog.description ? (
              <p
                className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
                title={scoreLog.description}
              >
                {scoreLog.description}
              </p>
            ) : null}
            {scoreLog.createTime ? (
              <time className="ui-mono shrink-0 text-xs text-muted-foreground">
                {formatDateTime(scoreLog.createTime)}
              </time>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function isSelfMessagesUrl(url?: string) {
  return url?.endsWith("/user/messages") || url?.endsWith("/user/messages/")
}
