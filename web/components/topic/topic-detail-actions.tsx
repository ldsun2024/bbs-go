"use client"

import { Eye, Heart, MessageCircle, Star } from "lucide-react"

import { useTopicActions } from "@/components/topic/topic-action-context"
import type { Topic } from "@/lib/api/types"
import { cn } from "@/lib/utils"

function countLabel(value?: number) {
  return value && value > 0 ? value : ""
}

export function TopicDetailActions({
  topic,
  labels,
}: {
  topic: Topic
  labels: {
    view: string
    like: string
    comment: string
    favorite: string
  }
}) {
  const {
    liked,
    favorited,
    likeCount,
    commentCount,
    toggleLike,
    toggleFavorite,
    scrollToComment,
  } = useTopicActions()

  return (
    <div className="mx-4 mb-6 flex flex-wrap items-center gap-2 border-t-2 border-foreground pt-3">
      <span className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-xs tabular-nums text-muted-foreground">
        <Eye className="size-4" />
        {labels.view}
        {countLabel(topic.viewCount)}
      </span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground transition-colors hover:border-foreground"
        onClick={() => void toggleLike("detail")}
      >
        <Heart
          className={cn("size-4", liked ? "text-primary" : "text-foreground")}
          fill={liked ? "currentColor" : "none"}
        />
        {labels.like}
        {countLabel(likeCount)}
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground transition-colors hover:border-foreground"
        onClick={scrollToComment}
      >
        <MessageCircle className="size-4" />
        {labels.comment}
        {countLabel(commentCount)}
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-foreground transition-colors hover:border-foreground"
        onClick={() => void toggleFavorite("detail")}
      >
        <Star
          className={cn("size-4", favorited ? "text-primary" : "text-foreground")}
          fill={favorited ? "currentColor" : "none"}
        />
        {labels.favorite}
      </button>
    </div>
  )
}
