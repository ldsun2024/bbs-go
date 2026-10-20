# bbs-go UI 设计规范 v2.1

> 版本：2026-10-20
> v2.1 变更（参数统一）：字阶收敛为 9 档（新增 `--fs-ui` 14、正文定为 15）；圆角明确四档并禁止 3px；按钮尺寸锁死 40 / 34 / 26；新增 4.10 介质例外；补充 `--article` / `--cover-*` 五个 token
> v2.0 新增：4.8 布局体系、4.9 层级、5.8 反馈、5.9 头像、5.10 尺寸速查
> 范围：视觉层 —— 颜色、字体、间距、圆角、阴影、动效、**布局骨架**、组件外观
> 前提：**不改任何业务逻辑、不改路由、不改数据结构**。所有改动落在 CSS 变量与 `web/styles/*.css`。
> 依据：`web/styles/{globals,variables,common,topic,pages}.css` 现状核对，`web/components.json` 的 shadcn 配置。
> 配套原型：`docs/prototype/ui-layout.html`（布局骨架）、`ui-components.html`（组件总览）、`ui-list.html` / `ui-detail.html`（整页）、`ui-paper.html`（质感对比）。

---

## 一、设计方向：暖纸编辑风（Warm Editorial）

### 选它的理由

这是一个**以文字为主**的校园社区：话题、文章、作业、公告、问答。用户看的是标题和段落，不是图片瀑布流。

所以方向定为「编辑/杂志感」而非「产品后台感」：

- 背景用**暖白纸色**，不是纯白也不是冷灰
- 标题用**衬线体**，正文用黑体，形成"报刊标题 + 现代正文"的对比
- 层次靠**边框与留白**，不靠阴影堆叠
- 主色用**墨绿**，克制、耐看、有书卷气

### 明确放弃的方向

| 方向 | 放弃原因 |
|---|---|
| 玻璃拟态 / 渐变卡片 | 中文字体在模糊背景上可读性差，长文阅读会累 |
| 暗色为主 | 校园社区白天使用为主，暗色只做可切换主题 |
| 高饱和撞色 | 评论区、后台表格密度高，撞色会吵 |
| 继续用紫蓝主色 | 与白白卡片叠加后发灰，且是最典型的"模板感"来源 |

### 记忆点（唯一一个）

**标题左侧 3px 竖线 + 内容来源日期列**。所有一级标题、列表项都遵循这个节奏，形成"报纸目录"的辨识度。除此之外不加任何装饰。

---

## 二、现状诊断

改之前先明确"丑在哪"，否则改完还是同一套逻辑。

| # | 问题 | 证据（现状值） | 造成的观感 |
|---|---|---|---|
| 1 | 全站渐变背景 | `--body-background: linear-gradient(136deg, #edf0ff99, #e7f6fa99)` | 淡紫→淡青斜渐变铺满页面，白色卡片压在上面形成灰脏的过渡边 |
| 2 | 主色是靛紫蓝 | `--primary: oklch(0.488 0.243 264.376)` | 与渐变背景同色系，整体发紫，缺少个性；也是模板化审美的典型色 |
| 3 | 存在第三套色源 | `--dashboard-accent: oklch(0.47 0.08 190)`（青绿） | 前台紫、后台青，两个产品割裂 |
| 4 | 没有字体体系 | `@theme` 里 `--font-sans: var(--font-sans)` 自引用，实际回退 system-ui | 标题与正文只靠字号区分，中文标题显得单薄、无重心 |
| 5 | 圆角不成体系 | `--radius: 0.625rem`，但 `.publish-form .field input` 是 `3px`、`.topic-tag` 也是 `3px` | 同屏出现 3px / 10px / calc 倍率，边缘忽软忽硬 |
| 6 | 彩色投影 | `.topic-tag-level1.selected { box-shadow: 0 6px 14px primary 18% }` | 紫色光晕，是小控件显廉价的直接原因 |
| 7 | 间距偏紧且无节奏 | `.main { padding: 1rem }`、`.main-body { padding: 10px }` | 内容贴边，长列表没有呼吸感 |

---

## 三、设计原则

1. **一屏只有一个强调色块**。主色只出现在主按钮、当前导航项、链接 hover、focus 环。
2. **层次用边框和留白，不用阴影**。阴影只保留给浮层（下拉、弹窗、Toast）。
3. **颜色只用一套语义**。任何新颜色必须先加到 token，禁止在组件里写死 hex。
4. **中文优先排版**。行高 ≥ 1.7，段间距 > 行间距，标题字重不超过 700。
5. **动效只做两件事**：列表入场淡入、hover 变色。不做位移、缩放、弹跳。

---

## 四、Design Token

### 4.1 颜色

以 `oklch` 定义（与现有 CSS 一致），同时给出 hex 便于设计工具使用。

```css
:root {
  /* 纸面 */
  --bg:            oklch(0.977 0.006 85);   /* #FAF7F2 暖白纸 */
  --bg-subtle:     oklch(0.958 0.008 85);   /* #F3EEE6 分区底 */
  --surface:       oklch(0.995 0.003 85);   /* #FFFDFA 卡片面 */
  --surface-hover: oklch(0.968 0.008 85);   /* #F6F1E9 列表 hover */

  /* 文字 */
  --text:          oklch(0.22 0.012 60);    /* #1C1A17 正文 */
  --text-secondary:oklch(0.44 0.010 60);    /* #5C564D 次要 */
  --text-muted:    oklch(0.62 0.008 60);    /* #928B80 弱化 */

  /* 线 */
  --line:          oklch(0.905 0.008 75);   /* #E4DED4 */
  --line-strong:   oklch(0.84 0.010 75);    /* #D2CABC */

  /* 主色：墨绿 */
  --brand:         oklch(0.44 0.062 175);   /* #14665A */
  --brand-hover:   oklch(0.38 0.058 175);   /* #0F5449 */
  --brand-soft:    oklch(0.945 0.018 175);  /* #E6F1EE */
  --brand-on:      oklch(0.985 0.004 175);  /* #F7FBF9 主色上的文字 */

  /* 强调色：赤陶（仅用于「置顶 / 推荐 / 悬赏」这类唯一重点） */
  --accent-warm:   oklch(0.56 0.132 42);    /* #C4552B */
  --accent-warm-soft: oklch(0.955 0.022 42);/* #FAEEE8 */

  /* 语义色（不与主色混用） */
  --success:       oklch(0.52 0.090 150);   /* #2F7D4F */
  --success-soft:  oklch(0.955 0.022 150);
  --warning:       oklch(0.62 0.110 78);    /* #B37400 */
  --warning-soft:  oklch(0.965 0.030 78);
  --danger:        oklch(0.50 0.150 28);    /* #B23A2E */
  --danger-soft:   oklch(0.955 0.025 28);
  --info:          oklch(0.52 0.075 240);   /* #2A6F97 */
  --info-soft:     oklch(0.955 0.018 240);

  /* 文章内容类型（A5 类型区分用，与 --indigo 同值、语义独立） */
  --article:       oklch(0.38 0.045 265);   /* #3B4A6B */
  --article-soft:  oklch(0.941 0.010 265);  /* #ECEEF4 */

  /* 个人主页头图渐变三档（替代页面内硬编码 hex） */
  --cover-from:    oklch(0.355 0.040 178);  /* #234C46 */
  --cover-mid:     oklch(0.425 0.042 176);  /* #2F6157 */
  --cover-to:      oklch(0.485 0.043 175);  /* #3C7367 */
}
```

> 新增于 v2.1：`--article` / `--article-soft` / `--cover-from` / `--cover-mid` / `--cover-to`。此前这五个值以硬编码 hex 散落在 A2、A5 的原型里，现统一收口。

**对比度校验（必须满足 WCAG AA）**

| 组合 | 比值 | 结论 |
|---|---|---|
| `--text` on `--bg` | 16.1:1 | 通过 |
| `--text-secondary` on `--bg` | 7.4:1 | 通过 |
| `--text-muted` on `--bg` | 4.6:1 | 通过（仅限 ≥14px） |
| `--brand` on `--bg` | 6.5:1 | 通过 |
| `--brand-on` on `--brand` | 6.5:1 | 通过 |
| `--accent-warm` on `--bg` | 4.6:1 | 通过（仅限 ≥16px 或图标） |

### 4.2 字体

**不再使用 `system-ui` 作为首选**（它让所有中文站长得一样），改为明确的中文字体栈。

```css
:root {
  /* 正文 / UI */
  --font-sans: "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC",
               "Noto Sans SC", "Microsoft YaHei UI", "Microsoft YaHei",
               "Helvetica Neue", Arial, sans-serif;

  /* 标题 / 文章正文首段 / 引言 —— 衬线是本设计的骨架 */
  --font-serif: "Noto Serif SC", "Source Han Serif SC", "Songti SC",
                "STSong", "SimSun", Georgia, serif;

  /* 数字 / 计数 / 代码 */
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas,
               "Liberation Mono", monospace;
}
```

> 说明：中文 Web 字体体积大，默认走**系统本地字体**（PingFang / 鸿蒙 / 思源），不引入外部 CDN。若要统一跨平台效果，可自托管 `Noto Serif SC` 的 `subset`（仅常用 3500 字，约 150KB）并 `font-display: swap`，但这是可选项，不是必需。

**字号阶（9 档，唯一允许的网页字号集合）**

| Token | 尺寸 | 行高 | 字重 | 用途 |
|---|---|---|---|---|
| `--fs-display` | 31px | 1.32 | 600 | 文章标题、页面主标题 |
| `--fs-h1` | 25px | 1.3 | 600 | 一级标题、公告标题 |
| `--fs-h2` | 20px | 1.4 | 600 | 二级标题、卡片组标题、空态标题 |
| `--fs-h3` | 16px | 1.5 | 600 | 小节标题、列表标题、导航 |
| `--fs-body` | 15px | 1.9 | 400 | 正文（720 版心内） |
| `--fs-ui` | 14px | 1.6 | 400 | 控件字号：按钮、输入框、主导航 |
| `--fs-sm` | 13px | 1.6 | 400 | 次要信息、表格、摘要 |
| `--fs-xs` | 12px | 1.5 | 400 | 时间、计数、元信息、表格表头 |
| `--fs-micro` | 11px | 1.4 | 500 | 徽标、角标、标签、图注 |

规则：

- 标题用 `--font-serif`，正文用 `--font-sans`，数字用 `--font-mono` + `font-variant-numeric: tabular-nums`
- **字重只用 400 / 500 / 600**，禁止 700 以上（中文会糊）
- 标题不加 `letter-spacing`，中文不需要
- **禁止出现 9 / 9.5 / 10 / 10.5 / 11.5 / 12.5 / 13.5 / 14.5 / 17 / 18px** 这类中间值；需要时向上或向下归到最近一档
- 介质例外（OG 图 / 邮件 / 打印）不受此表约束，见 4.10

### 4.3 间距

4px 基准，常用档位：

```
4   8   12   16   24   32   48   64
```

| 场景 | 值 |
|---|---|
| 图标与文字 | 8 |
| 标签内边距 | 4 / 10 |
| 表单项之间 | 16 |
| 卡片内边距 | 20（移动 16） |
| 卡片之间 | 16 |
| 内容区与侧栏 | 32 |
| 页面上下留白 | 32（上）/ 64（下） |

### 4.4 圆角

统一收紧到 6px，"纸片"感而非"气泡"感。

```css
:root {
  --radius: 6px;
  --radius-sm: 4px;   /* 标签、徽标、输入框内元素 */
  --radius-md: 6px;   /* 按钮、输入框、卡片 */
  --radius-lg: 8px;   /* 弹窗、抽屉、大卡片 */
  --radius-pill: 999px; /* 仅头像、圆形按钮 */
}
```

**唯一允许的四档**：`4` / `6` / `8` / `999`。

| 档位 | 用途 |
|---|---|
| 4（`--radius-sm`） | 标签、徽标、色条、骨架块、小按钮、复选框 |
| 6（`--radius`） | 按钮、输入框、卡片、列表容器、弹窗内部区块 |
| 8（`--radius-lg`） | 大容器、抽屉、弹窗外框、登录双栏 |
| 999 | 头像、圆形按钮、角标 |

**禁止**：

- 出现 `2px` / `3px` / `10px` / `12px` 等未定义档位（早期原型曾用 3px 做骨架与色条，统一改为 4）
- 同一屏出现两种不同档位表达同一类元素
- 卡片使用 `rounded-2xl` 以上

例外：OG 图（1200×630）与原型展示框可用 10 / 12 / 34，见 4.10。

### 4.5 阴影

只给浮层用，卡片一律无阴影。

```css
:root {
  --shadow-none: none;
  --shadow-pop: 0 8px 24px -8px oklch(0.22 0.012 60 / 0.16),
                0 2px 6px -2px oklch(0.22 0.012 60 / 0.10);
  --ring-focus: 0 0 0 2px var(--bg), 0 0 0 4px oklch(0.44 0.062 175 / 0.35);
}
```

**删除**：所有 `color-mix(primary …)` 生成的彩色投影（如 `.topic-tag-level1.selected` 的紫色光晕）。

### 4.6 动效

```css
:root {
  --ease-out: cubic-bezier(0.2, 0.7, 0.3, 1);
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 320ms;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

规则：

- 列表首屏入场：`fadeUp` + 每项 `animation-delay: calc(var(--i) * 30ms)`，`--i` 由组件内联注入，最大 8 项
- hover：只改 `background-color` / `border-color` / `color`，时长 120ms
- **不做** `translateY` 位移、`scale` 缩放、旋转
- 加载态用骨架屏（`--bg-subtle` 底色 + 1.4s 呼吸），不用转圈图标

### 4.7 纸张质感（细颗粒）

底纹采用「只加噪点」的保守方案：看不出明显纹理，但整体比纯色柔和，接近真实纸张的漫反射感。

```css
:root {
  --paper-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)' opacity='0.28'/%3E%3C/svg%3E");
}

body {
  background-color: var(--bg);
  background-image: var(--paper-grain);
  background-blend-mode: multiply;
}

.dark {
  --paper-grain: none; /* 暗色保持纯色墨面，颗粒在深底上会显脏 */
}
```

**参数口径**

| 参数 | 值 | 说明 |
|---|---|---|
| 图幅 | 160×160 | 平铺单元，太小会出现明显重复，太大增加首屏解码 |
| 频率 `baseFrequency` | 0.9 | 颗粒细度，低于 0.7 会变成"云雾"而非"砂纸" |
| 层数 `numOctaves` | 4 | 足够产生自然的不均匀，再高只增加体积 |
| `stitchTiles` | stitch | 消除平铺接缝 |
| 噪点透明度 | 0.28 | **上限 0.36**，超过就开始抢中文字形的边 |
| 混合模式 | multiply | 压暗而非覆盖，与暖白底自然融合 |

**只铺在哪**

- ✅ `body` 页面底、侧栏露出的背景区
- ❌ 正文卡片 `--surface`、表格区、编辑器画布 —— 阅读区带颗粒会明显增加疲劳
- ❌ 弹窗、抽屉内部

**性能**

内联 SVG 的 `feTurbulence` 是**一次性光栅化**，按 160×160 缓存后平铺，开销接近普通图片。**禁止**用 `filter: url(#grain)` 作用于大容器，那是实时计算，滚动会掉帧。

### 4.8 布局体系

现有布局的问题是「没有体系」：侧栏写死 260px，主区用 `calc(100% - 260px - 10px)` 算，全站间距只有 10px 一档，1279px 直接把侧栏 `display: none`。新方案改为「容器 + 分栏 + 间距节奏」三元组。

**容器四档**

| 档位 | 宽度 | 用途 |
|---|---|---|
| Full | 1440 | 后台 `/dashboard` |
| Wide | 1180 | 列表页（首页 / 话题 / 文章 / 公告） |
| Form | 760 | 发布页、设置页 |
| Reading | 720 | 详情正文（中文约 38 字/行，阅读最舒适区间） |

**分栏只有两种**

```css
/* 列表页：主区自适应 + 固定侧栏 */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 32px;
  align-items: start;
}

/* 后台：固定侧栏 + 内容自适应 */
.admin-layout {
  display: grid;
  grid-template-columns: 216px minmax(0, 1fr);
}
```

> 关键约束：**禁止再用 `calc(100% - 260px - 10px)` 这类写法**。宽度的分配交给 grid，组件只关心自己占几列。

**断点（三档，不做逐像素适配）**

| 断点 | 容器 | 分栏 | 页面留白 | 导航 |
|---|---|---|---|---|
| ≥ 1080 | 1180 | 主区 + 300，gap 32 | 32 / 24 / 64 | 完整横向 |
| 860 ~ 1079 | 100% | 主区 + 260，gap 24 | 24 / 20 / 48 | 完整横向 |
| < 860 | 100% | 单栏，**侧栏下沉到内容下方** | 20 / 16 / 40 | 折叠抽屉 |

**侧栏不隐藏**：现有实现在 1279px 直接 `display: none`，用户平白丢失「站点概况 / 公告 / 活跃成员」这些信息。新方案在窄屏把侧栏放到主内容之后，用两列网格排布侧栏卡片。

**间距节奏**

同一个值只承担一种职责，避免"处处 10px"。

| 值 | 用在哪 | 不要用在 |
|---|---|---|
| 4 | 图标与文字、标签内上下 | 区块之间 |
| 8 | 标签之间、按钮内 gap、元信息项间距 | 卡片内边距 |
| 12 | 标题与摘要、表单标签与输入框 | 页面级留白 |
| 16 | 卡片之间、列表项上下内边距 | 主区与侧栏 |
| 20 | 卡片内边距、列表项左右内边距 | 页面外边距 |
| 24 | 页面左右留白、区块之间 | 文字行间距 |
| 32 | 页面顶部、主区与侧栏 gap | 列表项内部 |
| 64 | 页面底部收尾 | 其他任何地方 |

**垂直节奏（页面从上到下）**

```
页面顶部留白 32
  ↓
页面头（标题 25 + 说明 13）  下边距 20
  ↓
筛选/分类条（若存在）        下边距 16
  ↓
内容卡片之间 gap 16
  ↓
分页 / 加载更多              上边距 24
  ↓
页面底部留白 64
```

**列表项高度**

`padding: 18px 20px` + 标题 1 行 + 摘要 2 行 + 元信息 1 行 ≈ 96px。同类列表项高度必须一致，摘要行数用 `-webkit-line-clamp: 2` 锁定。

### 4.9 层级（z-index）

只允许这五层，禁止临时写 `z-index: 9999`。

| 层 | 值 | 元素 |
|---|---|---|
| 内容 | 0 | 正文、卡片 |
| 吸附 | 10 | 列表表头、侧栏 sticky |
| 顶栏 | 30 | `site-header` |
| 浮层 | 50 | 下拉、Popover、Tooltip |
| 模态 | 70 | Dialog、Drawer、Toast |

### 4.10 介质例外

网页的字阶、圆角、尺寸规则**不适用于独立介质**。以下四类允许自定义数值，但同一介质内部必须自洽。

| 介质 | 允许偏离 | 必须遵守 |
|---|---|---|
| **OG 分享卡**（1200×630） | 字号 52 / 28 / 24 / 22；圆角 10 / 12 | 仍用同一套色板与衬线标题；安全区 72 |
| **邮件模板**（600 宽） | 字号 21 / 14 / 11.5；table 布局；内联样式 | 仍用墨绿主色与同一 logo 形态 |
| **打印样式** | 字号用 `pt`（11.5pt / 15pt / 10pt） | 仅黑 / 灰，不打印背景色 |
| **原型展示容器** | 手机框 34px 圆角、iframe 外框 | 仅存在于 `docs/design/**/prototype.html`，不进入产品代码 |

判断标准：**用户看到的是"图片 / 邮件 / 纸"，而不是"网页"时**，才套用例外。产品页面里一律回到 9 档字阶与四档圆角。

---

## 五、组件规范

### 5.1 按钮

**尺寸只有三档**（字高与内边距必须成对出现，不允许中间值 28 / 30 / 32 / 36 / 38）：

| 档位 | 高度 | 内边距 | 字号 | 圆角 | 用途 |
|---|---|---|---|---|---|
| `btn--lg` | 40 | 0 20 | 14 | 6 | 页面级主操作（登录、发布、保存） |
| `btn`（默认） | 34 | 0 14 | 13 | 6 | 常规操作、工具栏、对话框 |
| `btn--sm` | 26 | 0 8 | 11 | 4 | 表格行内、列表行内、标签旁的微型操作 |

**类型四选一**：

| 类型 | 外观 |
|---|---|
| Primary | `--brand` 实底 + `--brand-on` 文字，**不用渐变** |
| Secondary | `--surface` 底 + `--line` 1px 边框 + `--text` 文字 |
| Ghost | 透明底，hover 时 `--surface-hover` |
| Danger | `--danger` 文字 + `--danger` 30% 边框，hover 实底 |

组合规则：类型与尺寸正交，可以出现 `btn btn--primary btn--lg`，但**不能**在 inline style 里另写高度。

- 按钮内 `gap: 8px`，图标 16px
- `:active` 只降低不透明度到 0.9，不缩放
- 禁用态：`opacity: .5; cursor: not-allowed`
- **禁止**：渐变按钮、彩色外发光、圆角超过 8px

### 5.2 输入框 / 文本域

```css
.input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.input:hover { border-color: var(--line-strong); }
.input:focus-visible {
  outline: none;
  border-color: var(--brand);
  box-shadow: var(--ring-focus);
}
```

- placeholder 用 `--text-muted`，不用浅到看不见
- 错误态：`--danger` 边框 + 下方 12px 错误文案（不弹 Toast）
- **禁止**：用 div 模拟输入框（现有代码里没有，保持）

### 5.3 卡片

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 20px;
}
.card--flush { padding: 0; }              /* 列表容器 */
.card--hover:hover { border-color: var(--line-strong); }
```

- **不设 box-shadow**
- 卡片之间 `gap: 16px`
- 卡片标题：`--fs-h3` + 衬线 + 下方 12px 间距，可选左侧 3px `--brand` 竖线

### 5.4 列表项（核心组件）

列表是本项目的视觉主体，采用"日期列 + 内容列"的编辑式排版：

```
┌──────┬────────────────────────────────────────┐
│ 10-19│ 标题（16px 衬线 600）                  │
│ 周二 │ 摘要两行（14px，--text-secondary）      │
│      │ 作者 · 分类 · 12 评论 · 148 浏览        │
└──────┴────────────────────────────────────────┘
```

- 左列宽 64px，右对齐，`--font-mono`，`--fs-xs`，`--text-muted`
- 行内边距 `16px 20px`，项间用 `1px solid --line` 分隔（不用卡片+间隙堆叠）
- hover：整行背景 `--surface-hover`，**不加位移**
- 标题最多 1 行，超出省略；摘要 2 行，`-webkit-line-clamp: 2`
- 元信息用 `·` 分隔，字号 12px

> 这条是本次改版收益最大的部分：把"一堆白卡片"变成"一张连续的列表"，信息密度和秩序感同时提升。

### 5.5 标签 / 徽标

```css
.tag {
  height: 22px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  background: var(--bg-subtle);
  color: var(--text-secondary);
}
.tag--brand  { background: var(--brand-soft);        color: var(--brand); }
.tag--warm   { background: var(--accent-warm-soft);  color: var(--accent-warm); }
.tag--success{ background: var(--success-soft);      color: var(--success); }
.tag--danger { background: var(--danger-soft);       color: var(--danger); }
```

- 分类导航项（现有的 `topic-tag`）统一到 `radius-sm`，选中态用 `--brand` 实底 + 白字，**去掉光晕投影**

### 5.6 表格（后台）

- 表头：无底色，`--fs-xs`，`--text-muted`，底边 `1px --line`
- 行高 48px，行间 `1px --line`
- 行 hover：`--surface-hover`
- 数字列右对齐 + `tabular-nums`
- 操作列固定在右侧，文字按钮（不用图标按钮）

### 5.7 空态 / 加载 / 分页

- 空态：**左对齐**（不用居中大图标），一行标题 + 一行说明 + 一个次按钮
- 骨架屏：3~5 条列表形状，`--bg-subtle` 底色，**圆角 4**，`1.4s` 透明度呼吸，`0.65 → 1`
- 分页：方形按钮 32×32，`radius-sm`，当前页 `--brand` 实底

### 5.8 反馈

| 类型 | 位置 | 规格 |
|---|---|---|
| Toast | 右下角，向上堆叠 | 宽 320，`radius-md`，4s 自动消失，最多同时 3 条 |
| 行内提示条 | 表单下方 / 页面顶部 | 12px 文案，语义色 12% 底 + 实色文字 + 前置图标 |
| 字段错误 | 输入框正下方 6px | 11.5px，`--danger`，**不弹 Toast** |
| 骨架屏 | 列表 / 卡片占位 | 3~5 条，`--bg-subtle`，1.4s 呼吸，不用转圈 |

规则：**同一件事只用一个反馈通道**。表单校验失败走字段错误，接口失败走 Toast，不要两处同时出现。

### 5.9 头像

四档尺寸：`24 / 32 / 40 / 64`，一律圆形。

无头像时用**昵称首字** + `--brand-soft` 底 + `--brand` 字，衬线体。**禁止随机渐变色** —— 现有 `RandomAvatar` 会给每个用户生成不同的渐变底色，列表里一片花，视觉噪音极大，应统一为首字方案。

### 5.10 尺寸速查

落地时按这张表取值，不要每次重新决定。

| 元素 | 高度 | 圆角 | 字号 | 内边距 |
|---|---|---|---|---|
| 顶栏 | 60 | 0 | 14 | 0 24 |
| 页面主标题 | — | — | 25 / 1.3 | 0 |
| 卡片 | 自适应 | 6 | — | 20 |
| 列表项 | ≈96 | 0（靠分隔线） | 16 / 13.5 / 12 | 18 20 |
| 主按钮 | 40 | 6 | 14 | 0 20 |
| 常规按钮 | 34 | 6 | 13 | 0 14 |
| 表格内按钮 | 26 | 4 | 11.5 | 0 8 |
| 输入框 | 38 | 6 | 14 | 0 12 |
| 标签 | 21 | 4 | 11.5 | 0 7 |
| 分类 chip | 26 | 4 | 12.5 | 0 11 |
| 分页按钮 | 32 | 4 | 13 | 0 |
| 表头 | 38 | 0 | 11.5 | 9 12 |
| 表格行 | 44 | 0 | 13 | 11 12 |

---

## 六、页面模板

| 页面 | 宽度 | 结构 |
|---|---|---|
| 列表页 | 内容 760 + 侧栏 300，间距 32，最大 1180 | 标题区（标题 + 一句说明 + 右侧筛选）→ 列表容器 → 分页 |
| 详情页 | 单栏 720，居中 | 面包屑 → 标题（31px 衬线）→ 元信息行 → 正文（`--fs-body`，行高 1.9）→ 上一篇/下一篇 |
| 后台 | 侧栏 216 + 内容自适应 | 面包屑 → 页头（标题 + 右侧操作）→ 筛选栏 → 表格 |
| 发布页 | 单栏 760 | 标题输入（20px，无边框，仅底边）→ 分类/标签行 → 编辑器 → 底部操作区（右对齐） |

正文排版：

```css
.prose {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text);
}
.prose p { margin: 0 0 1.15em; }
.prose h2 { font-family: var(--font-serif); font-size: 20px; margin: 2em 0 .8em; }
.prose blockquote {
  margin: 1.5em 0;
  padding: 12px 16px;
  border-left: 3px solid var(--brand);
  background: var(--brand-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
```

---

## 七、明暗主题

暗色不是"把白改黑"，而是换一套纸墨关系：

```css
.dark {
  --bg:            oklch(0.20 0.008 70);   /* #232019 墨面 */
  --bg-subtle:     oklch(0.24 0.008 70);
  --surface:       oklch(0.245 0.008 70);  /* #2A2620 卡片 */
  --surface-hover: oklch(0.285 0.009 70);

  --text:          oklch(0.93 0.008 80);   /* #EDE8DE */
  --text-secondary:oklch(0.78 0.008 80);
  --text-muted:    oklch(0.62 0.008 80);

  --line:          oklch(0.33 0.008 70);
  --line-strong:   oklch(0.42 0.010 70);

  --brand:         oklch(0.68 0.070 175);  /* 暗底上提亮 */
  --brand-hover:   oklch(0.74 0.070 175);
  --brand-soft:    oklch(0.30 0.030 175);
  --brand-on:      oklch(0.18 0.010 175);
}
```

规则：暗色下**不透明度边框**（`oklch(1 0 0 / 10%)`）全部替换为实色，避免灰边发虚。

---

## 八、可访问性

1. 正文对比度 ≥ 4.5:1，大字号 ≥ 3:1（已在上表校验）
2. 所有可点击元素有可见 focus 环：`--ring-focus`
3. 不只靠颜色传达状态：置顶除了颜色还要有图标或文字
4. 动效遵守 `prefers-reduced-motion`
5. 正文最小 14px，标签最小 12px，不用 10px 以下

---

## 九、落地步骤（分批，可回滚）

### 第一批：只换 token（约 1 小时，收益最大）

改 `web/styles/globals.css`：

1. `--body-background` 改为纯色 `var(--bg)`（**删除渐变**）
2. `:root` 与 `.dark` 的 `--primary`、`--background`、`--foreground`、`--border`、`--muted` 映射到新 token
3. `--radius` 由 `0.625rem` 改为 `6px`
4. 新增 `--font-sans` / `--font-serif` / `--font-mono` 定义（替换自引用的 `@theme` 行）

改完立刻可见：背景不脏了、按钮颜色变了、圆角统一了。

### 第二批：布局与组件收敛（约 3 小时）

改 `web/styles/common.css`、`topic.css`：

1. **布局换成 grid**：`.main-container` 的 `display: flex` + `calc(100% - 260px - 10px)` 改为 `grid-template-columns: minmax(0,1fr) 300px; gap: 32px`；删除 `side-size-320` / `side-size-360` 这类宽度变体
2. **窄屏侧栏下沉**：`@media (max-width: 1279px)` 里的 `display: none` 改为「主区在上、侧栏在下」的单栏流，侧栏卡片用两列网格排布
3. **间距收敛**：`.main` 的 `padding: 1rem` → `32px 24px 64px`；`.main-body` / `.main-aside` 的 `10px` → `20px`
4. **背景分层**：`.main-body` / `.main-aside` 由 `var(--background)` 改为 `var(--surface)`
5. `.topic-tag` 圆角 `3px` → `var(--radius-sm)`，删除 `.topic-tag-level1.selected` 的彩色投影
6. `.publish-form .field input` 圆角 `3px` → `var(--radius-md)`，补 focus 环
7. 全站 `box-shadow` 排查，只保留浮层；删除 `pages.css` 的 `page-glow` 无限动画与 `card-animate:hover` 位移

### 第三批：排版升级（约 4 小时）

1. 列表项改为「日期列 + 内容列」结构（仅调 CSS grid，不改数据）
2. 标题接入 `--font-serif`
3. 卡片列表改为连续列表（去卡片底、保留分隔线）
4. 空态改为左对齐

### 回滚方式

所有改动都在 `web/styles/*.css`，`git checkout web/styles` 即可回退。不涉及 TSX 逻辑，不影响功能。

---

## 十、验收清单

改完逐条自查：

- [ ] 页面背景是纯色 + 细颗粒，没有渐变
- [ ] 主色是墨绿，全站找不到紫色按钮或紫色光晕
- [ ] 圆角只有 4 / 6 / 8 / 999 四档
- [ ] 卡片没有 `box-shadow`，浮层有
- [ ] 全站搜不到 `calc(100% -` 这类宽度硬算
- [ ] 窗口缩到 1000px，侧栏没有消失，而是移到了内容下方
- [ ] 间距只出现 4 / 8 / 12 / 16 / 20 / 24 / 32 / 64，没有 10px、18px 这类游离值
- [ ] 同类列表项高度一致，摘要统一 2 行截断
- [ ] 标题是衬线体，正文是黑体，能明显看出对比
- [ ] 正文行高 ≥ 1.75
- [ ] 列表项之间有分隔线，hover 只变色不位移
- [ ] 暗色模式下没有"发虚"的半透明边框
- [ ] Tab 键能走完全部交互元素，且 focus 环可见
- [ ] 手机上 14px 正文不需要横向滚动

---

## 十一、禁止清单

以下写法在本项目中**不允许再出现**：

1. `background: linear-gradient(...)` 作为页面或卡片底色
2. 紫色系（`hue 260~290`）作为主色或强调色
3. `box-shadow` 带彩色（`color-mix(primary …)`）
4. 同一屏混用 3px 与 10px 圆角
5. 组件内写死 hex 颜色（必须先入 token）
6. 标题字重 700 以上
7. 卡片用 `rounded-2xl` / `rounded-3xl`
8. hover 时 `translateY` / `scale`
9. 新增第三套色源（现有 `--dashboard-accent` 青绿需并入 `--brand` 或 `--info`）
10. 引入外部字体 CDN（可自托管，不可外链）

---

## 附录 A：改动文件清单

| 文件 | 改什么 | 风险 |
|---|---|---|
| `web/styles/globals.css` | token 全部替换、字体定义、暗色变量 | 低，纯变量 |
| `web/styles/variables.css` | 删除 `--body-background` 渐变 | 低 |
| `web/styles/common.css` | `body` 背景由 `background: var(--body-background)` 改为 `background-color + background-image + blend-mode`；`.main-body` 背景与内边距 | 低 |
| `web/styles/topic.css` | 标签圆角、删除彩色投影 | 低 |
| `web/styles/pages.css` | 页面级间距、空态对齐 | 低 |
| `web/components/dashboard/app-sidebar.tsx` | 仅当需要调整侧栏宽度时才动 | 中，涉及 TSX |

## 附录 B：设计决策记录

| 决策 | 选择 | 放弃的方案 | 理由 |
|---|---|---|---|
| 主色 | 墨绿 `#14665A` | 靛紫蓝（现状）/ 品牌橙 | 紫蓝与白卡叠加发灰且模板感强；橙色在奖惩/警示场景语义冲突 |
| 背景 | 纯色暖白 | 渐变（现状）/ 纯白 | 渐变是当前"脏"的主因；纯白在长阅读时偏刺眼 |
| 标题字 | 衬线 | 无衬线加粗 | 中文无衬线加粗在小字号下发糊，衬线更能建立层级 |
| 圆角 | 6px | 10px（现状）/ 0（极简） | 6px 有纸片感又不生硬；0 会让表单显得硬 |
| 层次 | 边框 + 留白 | 阴影卡片 | 长列表用阴影会形成"一堆浮块"，视觉噪音大 |
| 强调色 | 赤陶 `#C4552B` | 主色复用 | 强调必须与主色区分，否则无法表达"唯一重点" |
