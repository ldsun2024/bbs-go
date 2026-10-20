# A1 · 正文排版

> 所属：内容呈现 ｜ 工作量 M（约半天）｜ 依赖：无
> 原型：`prototype.html`

## 1. 问题

`web/styles/content.css` 是正文渲染的唯一入口，当前规格：

| 项 | 现状值 | 问题 |
|---|---|---|
| 正文字号 | `16px` | 中文 16px 偏大，与 14px 的元信息形成断层 |
| 行高 | `1.6`，段落 `1.7` | 中文长文需要 1.85~1.95，1.7 读三行就挤 |
| 标题 | `h1/h2` 带 `border-bottom: 1px` | 老式技术文档风，一篇文章出现两条横线很割裂 |
| 标题间距 | `1.5rem 0 0.75rem` | 上下不对称，标题像"贴在上一段" |
| 图片 | `max-width: 100%`，无圆角无图注 | 图片直接顶到文字边缘，和卡片风格不搭 |
| 代码块 | 无独立样式 | 长代码横向溢出，挤破版心 |
| 引用 | 无定义 | 落到浏览器默认斜体，中文斜体是伪斜体，很难看 |
| 表格 | 无定义 | 无边框无线条，密集内容糊成一片 |

## 2. 目标

- 连续阅读 2000 字不疲劳
- 标题层级靠字号 / 字重 / 间距区分，**不靠横线**
- 图片、代码、表格、引用四个"破版元素"有明确容器，不破坏版心
- 暗色模式下不需要额外覆盖规则

## 3. 方案

### 3.1 版心

```
最大宽度 720px（约 38 个汉字/行）
字号 15px
行高 1.9
段间距 1.15em
```

720px 是中文阅读的舒适上限。超过 760 时，眼睛从行尾回到行首会串行。

### 3.2 字号阶

| 元素 | 字号 | 行高 | 字重 | 上下间距 |
|---|---|---|---|---|
| h1 | 25 | 1.45 | 600 | 1.9em / 0.75em |
| h2 | 20 | 1.45 | 600 | 1.9em / 0.75em |
| h3 | 16 | 1.45 | 600 | 1.9em / 0.75em |
| 正文 | 15 | 1.9 | 400 | 0 / 1.15em |
| 列表项 | 15 | 1.8 | 400 | 0 / 0.45em |
| 引用 | 14.5 | 1.85 | 400 | 1.5em / 1.5em |
| 图注 | 12 | 1.6 | 400 | 8px / 0 |
| 代码 | 12.5 | 1.7 | 400 | 0 |
| 表格 | 13 | 1.7 | 400 | 1.5em / 1.5em |

标题与正文统一用衬线（`--font-serif`），与站点标题形成同一条视觉线索。

### 3.3 四个破版元素

**图片**：`width: 100%` + `radius: 6px`，下方 8px 图注（12px、`--muted`、居中）。用 `<figure>/<figcaption>`。

**代码块**：`--bg-subtle` 底 + 1px 边框 + `radius 6` + 横向滚动。行内 `code` 用 3px 圆角 + 同底色。

**引用**：左 3px 墨绿竖条 + `--brand-soft` 底 + 右侧 4px 圆角。**不用斜体**。

**表格**：表头 `--bg-subtle` 底 + 12px 字，行间 1px `--line`，无外边框。

### 3.4 与现有规则的关系

- 现有 `.bbs-content` 保留类名，只改内部规格，不改 DOM 结构
- `article` 详情页容器宽度由 `--reading-width: 720px` 控制
- 不引入新的 CSS 文件，改动落在 `content.css`

## 4. 实现要点

```css
.bbs-content {
  max-width: 720px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--text);
}

.bbs-content h1,
.bbs-content h2,
.bbs-content h3 {
  font-family: var(--font-serif);
  font-weight: 600;
  line-height: 1.45;
  margin: 1.9em 0 0.75em;
  border-bottom: 0;      /* 关键：移除下划线 */
  padding-bottom: 0;
}

.bbs-content p { margin: 0 0 1.15em; }
.bbs-content img { width: 100%; border-radius: 6px; }
.bbs-content blockquote {
  margin: 1.5em 0;
  padding: 13px 18px;
  border-left: 3px solid var(--brand);
  background: var(--brand-soft);
  border-radius: 0 4px 4px 0;
  font-style: normal;    /* 关键：不要伪斜体 */
}
```

## 5. 验收

- [ ] 连续 1500 字阅读无压迫感，行距明显比现状松
- [ ] 标题区没有横线
- [ ] 长代码块可横向滚动，不撑破版心
- [ ] 图片有圆角与图注
- [ ] 暗色模式无需额外覆盖
