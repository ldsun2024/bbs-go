"use client"

import * as React from "react"
import Link from "@/components/common/link"
import { usePathname, useSearchParams } from "@/lib/router/navigation"
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  CircleCheck,
  Medal,
} from "lucide-react"

import { UserAvatar } from "@/components/common/avatar"
import { apiFetch } from "@/lib/api/client"
import { useCurrentUser } from "@/components/app/app-provider"
import type { Badge, CheckInInfo, UserSummary } from "@/lib/api/types"
import { prettyDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n/provider"
import { buildSigninHref, toast, useToastActions } from "@/lib/toast"

function displayName(user: UserSummary) {
  return user.nickname || user.username || String(user.id)
}

export function TasksUserCard({
  user,
  badges,
}: {
  user?: UserSummary | null
  badges?: Badge[]
}) {
  return (
    <React.Suspense fallback={<div className="min-h-24" />}>
      <TasksUserCardContent user={user} badges={badges} />
    </React.Suspense>
  )
}

function TasksUserCardContent({
  user,
  badges,
}: {
  user?: UserSummary | null
  badges?: Badge[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const currentUser = useCurrentUser()
  const effectiveUser = currentUser || user || null
  const [currentBadges, setCurrentBadges] = React.useState<Badge[]>(
    badges || []
  )
  const ownedBadges = currentBadges.filter((badge) => badge.owned === true)
  const displayBadges = ownedBadges.slice(0, 6)
  const queryString = searchParams.toString()
  const fullPath = `${pathname || "/"}${queryString ? `?${queryString}` : ""}`

  React.useEffect(() => {
    if (!effectiveUser) {
      return
    }

    let mounted = true
    void apiFetch<Badge[]>("/api/badge/badges", {
      params: { userId: effectiveUser.id },
    })
      .then((data) => {
        if (mounted) {
          setCurrentBadges(data || [])
        }
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [effectiveUser])

  if (!effectiveUser) {
    return (
      <Link
        href={buildSigninHref(
          pathname?.startsWith("/user/signin") ? "/" : fullPath
        )}
        className="flex w-full flex-col gap-3 border border-border bg-muted p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-background text-base font-semibold text-muted-foreground">
            ?
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              {t("user.tasks.userCard.guestTitle")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("user.tasks.userCard.guestHint")}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center gap-2 bg-foreground px-3 py-2 text-micro font-semibold text-background transition-opacity hover:opacity-90">
          {t("user.tasks.userCard.signInAction")}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <UserAvatar user={effectiveUser} size={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/user/${effectiveUser.id}`}
            className="block truncate text-base font-semibold text-foreground hover:text-primary"
          >
            {displayName(effectiveUser)}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {effectiveUser.description ||
              t("user.tasks.userCard.noDescription")}
          </p>
        </div>
      </div>
      {effectiveUser.levelTitle || ownedBadges.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {effectiveUser.levelTitle ? (
            <span className="inline-flex items-center border-b border-border pb-0.5 font-mono text-micro tracking-[0.08em] text-muted-foreground uppercase">
              {effectiveUser.levelTitle}
            </span>
          ) : null}
          {ownedBadges.length > 0 ? (
            <Link
              href={`/user/${effectiveUser.id}/badges`}
              className="flex flex-wrap items-center transition hover:opacity-90"
            >
              {displayBadges.map((badge) => (
                <span key={badge.id} title={badge.title}>
                  {badge.icon ? (
                    <img
                      src={badge.icon}
                      alt={badge.title || ""}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <Medal className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>
              ))}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {effectiveUser.expProgress ? (
        <div className="mt-4">
          <div className="flex items-center justify-between font-mono text-micro tabular-nums text-muted-foreground">
            <span>{t("user.tasks.userCard.expProgress")}</span>
            <span className="text-foreground">
              {effectiveUser.expProgress.isMaxLevel
                ? t("user.tasks.userCard.expProgressMaxLevel")
                : `${effectiveUser.expProgress.expInCurrentLevel || 0} / ${effectiveUser.expProgress.expNeedForNextLevel || 0}`}
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-foreground"
              style={{
                width: `${effectiveUser.expProgress.expProgressPercent || 0}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
        <TaskUserStat
          label={t("component.userInfo.score")}
          value={effectiveUser.score || 0}
        />
        <TaskUserStat
          label={t("user.tasks.userCard.exp")}
          value={effectiveUser.exp || 0}
        />
        <TaskUserStat
          label={t("component.userInfo.topicCount")}
          value={effectiveUser.topicCount || 0}
        />
        <TaskUserStat
          label={t("component.userInfo.commentCount")}
          value={effectiveUser.commentCount || 0}
        />
      </div>
    </div>
  )
}

function TaskUserStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-micro text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  )
}

export function CheckInCard({
  initialCheckIn,
  initialRank,
}: {
  initialCheckIn?: CheckInInfo | null
  initialRank?: CheckInInfo[]
}) {
  const { t } = useI18n()
  const { catchError } = useToastActions()
  const [checkIn, setCheckIn] = React.useState<CheckInInfo | null>(
    initialCheckIn || null
  )
  const [rank, setRank] = React.useState<CheckInInfo[]>(initialRank || [])
  const [pending, setPending] = React.useState(false)
  const isCheckedIn = Boolean(checkIn?.checkIn)

  async function refresh() {
    const [nextCheckIn, nextRank] = await Promise.all([
      apiFetch<CheckInInfo | null>("/api/checkin/checkin"),
      apiFetch<CheckInInfo[]>("/api/checkin/rank"),
    ])
    setCheckIn(nextCheckIn)
    setRank(nextRank || [])
  }

  async function doCheckIn() {
    if (pending) {
      return
    }
    setPending(true)
    try {
      await apiFetch<null>("/api/checkin/checkin", { method: "POST" })
      toast.success(t("component.checkIn.checkInSuccess"))
      await refresh()
    } catch (error) {
      catchError(error)
    } finally {
      setPending(false)
    }
  }

  React.useEffect(() => {
    let mounted = true
    void Promise.all([
      apiFetch<CheckInInfo | null>("/api/checkin/checkin").catch(() => null),
      apiFetch<CheckInInfo[]>("/api/checkin/rank").catch(() => []),
    ]).then(([nextCheckIn, nextRank]) => {
      if (mounted) {
        setCheckIn(nextCheckIn)
        setRank(nextRank || [])
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-sm font-semibold text-foreground">
                {t("component.checkIn.headline")}
              </span>
              <span className="w-fit font-mono text-micro tracking-[0.08em] text-muted-foreground uppercase">
                {isCheckedIn
                  ? t("component.checkIn.statusCheckedIn")
                  : t("component.checkIn.statusNotCheckedIn")}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isCheckedIn
                ? t("component.checkIn.checkedInTip")
                : t("component.checkIn.checkInTip")}
            </p>
          </div>
        </div>
        <div>
          <div className="min-h-9">
            {!isCheckedIn ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-4 py-2 text-micro font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:outline-none disabled:opacity-60"
                type="button"
                disabled={pending}
                onClick={() => void doCheckIn()}
              >
                <Calendar className="size-4" />
                {t("component.checkIn.checkInNow")}
              </button>
            ) : (
              <div className="flex w-full items-center gap-3 border border-border bg-muted px-4 py-2.5 text-sm">
                <CircleCheck className="h-4 w-4 shrink-0 text-foreground" />
                <p className="min-w-0 text-foreground">
                  {t("component.checkIn.consecutiveDays", {
                    days: checkIn?.consecutiveDays || 0,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {rank.length ? (
        <div className="mt-4">
          <div className="font-mono text-micro tracking-[0.12em] text-muted-foreground uppercase">
            {t("component.checkIn.todayRanking")}
          </div>
          <ul className="mt-2">
            {rank.map((item) =>
              item.user ? (
                <li
                  key={item.id || `${item.user.id}-${item.updateTime || ""}`}
                  className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-b-0"
                >
                  <UserAvatar user={item.user} size={24} />
                  <div className="min-w-0 flex-1">
                    <Link
                      className="truncate font-medium text-foreground hover:text-primary"
                      href={`/user/${item.user.id}`}
                    >
                      {displayName(item.user)}
                    </Link>
                    {item.updateTime ? (
                      <p className="font-mono text-micro text-muted-foreground">
                        @{prettyDate(item.updateTime, t)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ) : null
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
