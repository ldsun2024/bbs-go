import Link from "@/components/common/link"

import { UserAvatar } from "@/components/common/avatar"
import type { UserSummary } from "@/lib/api/types"
import type { TFunction } from "@/lib/i18n"

type UserInfoSummary = UserSummary & {
  level?: number
  topicCount?: number
  commentCount?: number
}

function displayName(user: UserSummary) {
  return user.nickname || user.username || `#${user.id}`
}

export function UserInfo({ user, t }: { user: UserInfoSummary; t: TFunction }) {
  const stats = [
    { label: t("component.userInfo.level"), value: user.level ?? 0 },
    { label: t("component.userInfo.score"), value: user.score ?? 0 },
    { label: t("component.userInfo.topicCount"), value: user.topicCount ?? 0 },
    {
      label: t("component.userInfo.commentCount"),
      value: user.commentCount ?? 0,
    },
  ]

  return (
    <section>
      <div className="flex items-start gap-3">
        <UserAvatar user={user} size={48} className="shrink-0" />
        <div className="min-w-0">
          <h2 className="truncate text-base leading-snug font-semibold">
            <Link
              href={`/user/${user.id}`}
              className="transition-colors hover:text-primary"
            >
              {displayName(user)}
            </Link>
          </h2>
          {user.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-[1.7] break-all text-muted-foreground">
              {user.description}
            </p>
          ) : null}
        </div>
      </div>
      <ul className="mt-4 flex border-t border-border pt-3 text-center">
        {stats.map((item) => (
          <li key={item.label} className="w-full">
            <b className="block font-mono text-base font-semibold tabular-nums">
              {item.value}
            </b>
            <span className="text-micro text-muted-foreground">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
