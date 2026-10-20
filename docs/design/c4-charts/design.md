# C4 · 图表配色

> 所属：锦上添花 ｜ 工作量 S（约 1.5 小时）｜ 依赖：无
> 原型：`prototype.html`

## 1. 问题

后台统计图用 `recharts`，全部走默认配置：

| 项 | 现状 | 问题 |
|---|---|---|
| 系列色 | recharts 默认蓝紫系（`#8884d8` 等） | 与站点墨绿主色冲突，像第三方组件直接嵌进来 |
| 网格线 | 默认 `#ccc` 实线 | 比数据线还抢眼 |
| 图例 | 带边框方块 | 视觉噪音 |
| 坐标轴 | 默认字号 12px | 与后台 11.5px 体系不一致 |
| Tooltip | 默认白底黑边 | 和浮层规范不统一 |
| 数字 | 未开 `tabular-nums` | Y 轴刻度不等宽，数字跳 |

## 2. 目标

- 图表与站点同一套颜色语言
- 数据是主角，网格与坐标轴退到背景
- 与后台的 11.5px 字号体系一致

## 3. 方案

### 3.1 系列色板（按顺序取用）

| 序 | 名称 | 值 | 用途 |
|---|---|---|---|
| 1 | 墨绿 | `#14665A` | 主指标（浏览量、活跃用户） |
| 2 | 赤陶 | `#C4552B` | 对比指标（评论、互动） |
| 3 | 深靛 | `#3B4A6B` | 第三序列 |
| 4 | 橄榄 | `#6B7A47` | 第四序列 |
| 5 | 灰蓝 | `#4A6274` | 第五序列 / 辅助 |

超过 5 个系列时不再加色，改为「主序列实线 + 其余统一灰色虚线」，避免调色板膨胀。

### 3.2 非数据元素

| 元素 | 规格 |
|---|---|
| 网格线 | 仅横向，`1px` `--line`，虚线 2 2 |
| 坐标轴 | 无轴线，刻度文字 11.5px `--muted` |
| 图例 | 无边框，10px 圆点 + 11.5px 文字，间距 16 |
| Tooltip | `--surface` 底 + 1px `--line` + `radius 6` + `shadow-pop`，12px 字 |
| 数据点 | 半径 3，hover 放大到 5 |
| 面积渐变 | 同色 18% → 0%，仅用于折线图 |
| 柱状 | `radius 3` 顶部圆角，宽度 ≤ 24 |

### 3.3 数字与单位

- 所有轴刻度与数值开 `font-variant-numeric: tabular-nums`
- 超过 10000 显示 `1.2万`，不显示 `12,345`
- 百分比保留一位小数

### 3.4 recharts 配置示例

```tsx
const COLORS = ["#14665A", "#C4552B", "#3B4A6B", "#6B7A47", "#4A6274"]

<CartesianGrid stroke="var(--line)" strokeDasharray="2 2" vertical={false} />
<XAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "var(--muted)" }} />
<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "var(--muted)" }} />
<Tooltip contentStyle={{
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontSize: 12,
  boxShadow: "0 8px 24px -8px rgba(28,26,23,.16)",
}} />
```

## 4. 验收

- [ ] 图表里不再出现 `#8884d8` 这类默认紫蓝
- [ ] 网格线比数据线明显更淡
- [ ] Y 轴刻度数字等宽对齐
- [ ] Tooltip 与站点浮层同款
- [ ] 暗色模式下网格与文字自动适配（用 CSS 变量而非写死色）
