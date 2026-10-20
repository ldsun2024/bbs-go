import {
  Activity,
  BookOpen,
  FlaskConical,
  Hash,
  Languages,
  Megaphone,
  MessageCircleQuestion,
  Sigma,
  type LucideIcon,
} from "lucide-react"

/**
 * B4：分类兜底图标。
 * 运营没上传 logo 时按名称关键词映射到线性图标，避免出现空白方块。
 * 命中顺序即优先级，越具体的在上。
 */
const RULES: Array<[RegExp, LucideIcon]> = [
  [/数学|函数|代数|几何|算术/, Sigma],
  [/语文|阅读|写作|作文|文学/, BookOpen],
  [/英语|语言|外语|日语|韩语/, Languages],
  [/科学|实验|物理|化学|生物|自然/, FlaskConical],
  [/问答|求助|答疑|提问/, MessageCircleQuestion],
  [/公告|通知|新闻/, Megaphone],
  [/活动|运动|健身|体育|打卡/, Activity],
]

export function getCategoryIcon(name?: string): LucideIcon {
  if (!name) return Hash
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon
  }
  return Hash
}

export function CategoryIcon({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const Icon = getCategoryIcon(name)
  return (
    <Icon
      className={className}
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
    />
  )
}
