# V2 前端落地实施方案

> 目标：把 `docs/V2` 的视觉 1:1 还原到 `web/`
> 约束：**功能模块零增删** —— 路由、loader、API、状态、i18n 键一律不动，只改视觉层
> 基线：`docs/V2/README.md` 的 50 页对照表

---

## 零、差异裁决规则

改造中一定会遇到「V2 原型有、原站没有」或「原站有、V2 原型没画」的情况。统一按这三条处理：

| 情况 | 处理 |
|---|---|
| **原站有、V2 原型没画** | **保留功能**，按 V2 的视觉语言重绘。不许因为原型没画就删掉入口 |
| **V2 原型有、原站没有** | **不加**。原型只是视觉参考，不是功能清单 |
| **两者都有但结构不同** | 以原站的信息结构为准，套 V2 的间距/字号/线宽/色彩 |

具体到已知的几处：

- `install`（安装向导）、`redirect`（跳转中转）不在 50 页内，**保留原样**，只让它吃到新 token，不单独重绘
- V2 `article-create.html` 有「封面图上传」，原站如果没有这个字段，**不加**
- V2 后台 `links.html` 有「批量导入」，原站如果只有单条添加，**不加**
- V2 `tasks.html` 的签到格子，若原站任务模块没有签到，**不算缺口**，按原站任务类型渲染
- 原站有、原型没画的（如评论区的点赞/举报按钮、编辑器的图片上传），全部保留

### 阶段 0 实测补充（2026-10-20）

跑基线截图时发现三处与原型不一致，按上表处理：

| 发现 | 处理 |
|---|---|
| **`/` 与 `/topics` 渲染同一个组件**（截图逐字节相同，HTTP 响应体差 121 字节，只是 canonical 不同） | V2 的 `home.html`（带 56px 大标题 hero）与 `topics.html`（纯列表）**不拆成两种布局**。落地时两个路由共用一套列表，hero 区按原站现状决定去留 |
| **首页是三栏**：左分类栏 + 列表 + 右侧栏；V2 原型是顶部筛选条 + 两栏 | **保留三栏**，左分类栏套 V2 视觉（项高 36、当前项左侧 2px 橙红），不改成顶部筛选条 |
| 移动端侧栏**已经下沉**到列表下方（未登录用户 / 每日签到） | 与 V2 的 `< 860` 下沉逻辑一致，只需把断点从 1079 调到 860，不改行为 |
| 基线截图是**未登录 + 空数据**状态（只有一条官方欢迎帖） | 前后对比只能比骨架、配色、字号、线宽，不能比内容密度。有数据态需登录后手动补截 |

---

## 一、基线事实

| 项 | 现状 |
|---|---|
| 框架 | React Router 7.15 + React 19.2 |
| 样式 | Tailwind CSS **v4.2.1**（CSS-first，`@theme` 在 `globals.css`） |
| 组件库 | shadcn 全套 **55 个** `components/ui/*.tsx` |
| 样式文件 | **11 个**，合计 2,967 行，全部 `@import` 进 `globals.css` |
| 业务组件 | topic 27 / dashboard 20 / user 17 / common 14 / auth 7 / article 6 / layout 5 / search 4 / editor 3 / app 2 / comment 2 / install 2 / tasks 2 |
| 路由页面 | 50 个（含 `$` 404） |

改造**不引入新依赖**。`clsx`、`tailwind-merge`、`cva`、`lucide-react` 都已具备。

---

## 二、改造分层

```
L0  token        globals.css 的 :root / .dark          → 1 个文件
L1  基础组件      components/ui/*.tsx                   → 8 个文件
L2  布局骨架      components/layout/*.tsx               → 5 个文件
L3  领域组件      components/{topic,user,dashboard,...}  → 约 30 个重点文件
L4  页面          app/routes/*.tsx                      → 50 个文件
```

**顺序必须自上而下**。L0 改完全站立刻变样；L1 决定 80% 的观感；L4 只处理剩下的结构差异。

---

## 三、L0 · Token（1 个文件）

### 3.1 值替换表

`web/styles/globals.css` 的 `:root`：

| 变量 | 当前值 | 目标值（V2 A 方向） | 影响 |
|---|---|---|---|
| `--background` | `oklch(0.995 0.003 85)` | `#FFFFFF` | 全站底色 |
| `--foreground` | `oklch(0.22 0.012 60)` | `#111111` | 正文 |
| `--card` | `oklch(0.995 0.003 85)` | `#FFFFFF` | 卡片 |
| `--muted` | — | `#FAFAFA` | hover 底 |
| `--muted-foreground` | — | `#6B6B6B` | 次要文字 |
| `--border` | — | `#E3E3E3` | 所有分隔线 |
| `--primary` | `oklch(0.44 0.062 175)` 墨绿 | `#FF3B00` 橙红 | 按钮、链接、当前项 |
| `--primary-foreground` | — | `#FFFFFF` | — |
| `--radius` | `6px` | `0` | 全站直角 |
| `--bg` | `oklch(0.977 0.006 85)` | **删除** | 白页不需要纸面/卡面区分 |

`.dark` 同步：底 `#14120F`、字 `#E8E2D5`、卡 `#1C1916`、线 `#2E2A24`、主色 `#FF3B00`。

### 3.2 补 Tailwind 缺失的字号档

`@theme inline` 里新增（V2 九档，生成 `text-h1` 等工具类）：

```css
--text-display: 56px;
--text-h1: 40px;
--text-h2: 28px;
--text-h3: 22px;
--text-h4: 18px;
--text-ui: 14px;
--text-sm: 12px;
--text-micro: 11px;
```

行高与字距用 Tailwind 的配套写法：`--text-h1--line-height: 1.15;`、`--text-h1--letter-spacing: -0.02em;`。

**间距不新增**：V2 的 4/8/12/16/24/32/48/64/96 与 Tailwind 的 `1/2/3/4/6/8/12/16/24` 完全重合。

### 3.3 线宽与阴影

```css
--border-width-hair: 1px;    /* 默认，可省 */
--border-width-mark: 3px;    /* 未读条、类型条 */
--shadow-hard: 8px 8px 0 rgba(17,17,17,.08);   /* 仅浮层 */
```

### 3.4 合并违规文件

上一轮新增的三个全局 CSS 违反 `AGENTS.md` 1.8，合并后删除：

| 文件 | 去向 |
|---|---|
| `styles/charts.css` | 合并为 `@layer components` 的图表降噪规则 |
| `styles/motion.css` | 合并（keyframes + `prefers-reduced-motion`） |
| `styles/print.css` | 合并为 `@media print` 块 |

### 3.5 验收

```powershell
corepack pnpm typecheck
corepack pnpm dev     # 打开首页，全站应变白底、黑字、橙红主色、直角
```

**这一步不做完，后面的工作都没有意义。**

---

## 四、L1 · 基础组件（8 个）

| 文件 | 改动点 | V2 参照 |
|---|---|---|
| `ui/button.tsx` | variants 增加 `accent`（橙红底白字）、`ghost`（1px 边框）、`text`（无边框）、`sm`（高 30）；`default` 改墨黑底；`danger` 用删除线不用红色；圆角归零；去掉所有 `shadow-sm` | `.a-btn` |
| `ui/input.tsx` + `ui/textarea.tsx` | 高 38、`border-border`、`focus-visible:border-foreground` + 2px 内阴影；圆角归零；placeholder `text-muted-foreground/70` | `.a-input` |
| `ui/table.tsx` | 表头 `sticky top-0` + 高 38 + `border-b-2 border-foreground` + 大写小字；行高 44；`hover:bg-muted`；改为 `col-num`（右对齐 + `tabular-nums`）工具类 | `.a-table` |
| `ui/badge.tsx` | 三个变体：`tag`（1px 边框透明底）、`tag-on`（墨黑底白字）、`type`（等宽大写小字） | `.a-tag` / `.a-type` |
| `ui/card.tsx` | 去掉 `shadow`、去掉 `rounded-xl`；`border-border` + `bg-card` | `.a-profile` / 各类卡片 |
| `ui/empty.tsx` | 改为左对齐、2px 黑线起头、标题 20px 衬线、说明 12px | `.a-empty` |
| `ui/skeleton.tsx` | 动画换 `breathe`（1.4s / 0.65→1）；背景 `--muted` | `.a-skeleton` |
| `ui/pagination.tsx` | 32×32 方格、1px 边框、当前项墨黑底白字 | `.a-pager` |

**不改**的 ui 组件（直接用 token 生效）：dialog、dropdown、popover、tooltip、tabs、avatar、separator、switch、checkbox、select、progress、scroll-area。

---

## 五、L2 · 布局骨架（5 个）

| 文件 | 改动点 |
|---|---|
| `layout/site-header.tsx` | 高 64（移动 48）、底部 1px 线；logo 18px 粗体；导航当前项下方 2px 橙红线；搜索框 240 宽 |
| `layout/main-shell.tsx` | 容器 1180 → **1200**；断点 **1080 / 860**；`< 860` 时侧栏 `flex-direction: column` 下沉，**不再 `display:none`** |
| `layout/site-footer.tsx` | 顶部 2px 黑线；三列 → 小屏两列 → 单列；字号 12 |
| `layout/mobile-bottom-nav.tsx`（若存在） | 高 56 + `env(safe-area-inset-bottom)`；中间发布项 34×22 橙红方块 |
| `common/widget-card.tsx` | 去阴影、去圆角；标题 18px 衬线 + 2px 底线 |

---

## 六、L3 · 领域组件（重点约 30 个）

按「改完影响最大」排序：

### 6.1 内容（topic 27 个文件里挑 12 个）

| 文件 | 改动点 |
|---|---|
| `topic/topic-list-item.tsx` | 改为三栏：序号 60 / 内容 1fr / 元信息 240；序号等宽 24px，hover 变橙红；保留已加的 `data-topic-type` 色条（3px） |
| `topic/topics-nav-content.tsx` | 分类项高 36；当前项左侧 2px 橙红；已加的分类兜底图标保留 |
| `topic/topic-detail-*` | 标题 40px 衬线、去掉下划线；元信息 12px；正文走 `content.css` |
| `topic/topic-comment*` | 头像 32；正文 14/1.7；子回复左侧 1px 竖线 |
| `topic/topic-publish*` | 标题输入 25px 衬线；工具栏独立一行 + 1px 底线；圆角归零 |
| `article/*`（6 个） | 同 topic 的排版规则 |

### 6.2 用户（user 17 个里挑 8 个）

| 文件 | 改动点 |
|---|---|
| `user/profile-shell.tsx` | 头图 `aspect-ratio: 16/5`；头像 88px + `margin-top: -44px` + 4px 白描边；统计条四等分 + 竖分隔线 |
| `user/user-lists.tsx` | 已改的时间分组保留；卡片 `bg-card`、内边距 `px-4 py-3.5`；消息项未读态左侧 3px 橙红 |
| `user/user-badges.tsx` | 目前是占位（永远显示「暂无徽章」），**接 `/api/badge/badges` 后再改视觉**，本次只改空态样式 |
| `user/profile-form.tsx` | 表单行 200 + 1fr；输入框 38 高 |

### 6.3 后台（dashboard 20 个里挑 6 个）

| 文件 | 改动点 |
|---|---|
| `dashboard/data/dashboard-data-table.tsx` | 已改的吸顶表头保留；行高 44、数字列右对齐；空态换 `EmptyState` |
| `dashboard/dashboard-overview.tsx` | KPI 四列 + 2px 顶线；图表降噪（网格虚线、轴透明） |
| `dashboard/pagination-controls.tsx` | 同 `ui/pagination` |
| `dashboard/*-form.tsx` | 表单行两列，标签 14 粗体 |

### 6.4 公共（common 14 个里挑 4 个）

`empty-state.tsx`（已改，需对齐 V2 的 2px 黑线）、`widget-card.tsx`、`error-page.tsx`（对齐 `states/error.html` 的 120px 编号）、`page-container.tsx`（若存在，改 1200 容器）。

---

## 七、L4 · 页面（50 个）

按依赖顺序分 5 组。每组做完即可独立验收。

### 组 1 · 认证（4 页）— 依赖 L1 button/input

`user.signin` `user.signup` `user.password.forgot` `user.password.reset`
改动：`.a-auth` 双栏（左 1fr 灰底 / 右 420）、输入 38 高、主按钮 44 高全宽、第三方式按钮 36 高描边。

### 组 2 · 内容（16 页）— 依赖 L1 + L3.1

`_index` `topics` `topic.$id` `topic.create` `topic.edit.$id` `topics_.category.$id` `topics_.tag.$id`
`articles` `article.$id` `article.create` `article.edit.$id` `articles_.tag.$id`
`search` `about` `links` `tasks`

改动：列表三栏、详情标题 40 衬线、正文 15/1.9、发布页表单骨架、`about`/`links` 的堆叠节奏。

### 组 3 · 用户（11 页）— 依赖 L1 + L3.2

`user.$userId` `user.profile` `user.profile_.account` `user.favorites` `user.scores`
`user.messages` `user.email.verify`
`user_.$userId.articles` `user_.$userId.badges` `user_.$userId.fans` `user_.$userId.followed`

改动：主页头图 + 统计条、Tab 栏、设置页两列表单、消息分组、四类子列表的统一列表壳。

### 组 4 · 后台（18 页）— 依赖 L1 + L3.3

全部 `dashboard.*`。
改动：侧栏 216 + 顶栏 56 + 内容区 24 内边距；表格统一（吸顶表头、38/44 行高、数字右对齐）；筛选条 48；操作条 2px 顶线。

### 组 5 · 兜底（1 页）

`$`（404）→ 对齐 `states/error.html`：4 列 120px 编号 + 8 列说明。

---

## 八、TODO 清单

### 阶段 0 · 准备

- [ ] **0.1** `git add -A && git commit -m "chore: V2 落地前快照"`（当前 28 个文件未提交）
- [ ] **0.2** 记录基线截图：首页 / 详情 / 登录 / 后台看板，1440 与 375 各一张，存 `docs/V2/baseline/`

### 阶段 1 · Token（L0）

- [ ] **1.1** 改 `globals.css` `:root` 的 9 个颜色值（含 `--primary` 改橙红、`--radius` 改 0）
- [ ] **1.2** 改 `.dark` 对应值
- [ ] **1.3** 删除 `--bg`，把 `--body-background` 指向 `--background`
- [ ] **1.4** `@theme inline` 补 8 档字号 + 行高 + 字距
- [ ] **1.5** 补 `--border-width-mark`、`--shadow-hard`
- [ ] **1.6** 删除 `charts.css` / `motion.css` / `print.css`，内容并入 `globals.css`
- [ ] **1.7** `pnpm typecheck` + 打开首页确认变色

### 阶段 2 · 基础组件（L1）

- [ ] **2.1** `ui/button.tsx` — 5 个 variant + 圆角归零
- [ ] **2.2** `ui/input.tsx` / `ui/textarea.tsx` — 38 高 + focus 2px
- [ ] **2.3** `ui/table.tsx` — 吸顶表头 + 38/44 行高 + `col-num`
- [ ] **2.4** `ui/badge.tsx` — `tag` / `tag-on` / `type` 三变体
- [ ] **2.5** `ui/card.tsx` — 去阴影去圆角
- [ ] **2.6** `ui/empty.tsx` — 左对齐 + 2px 黑线
- [ ] **2.7** `ui/skeleton.tsx` — breathe 动画
- [ ] **2.8** `ui/pagination.tsx` — 32×32 方格

### 阶段 3 · 布局（L2）

- [ ] **3.1** `layout/site-header.tsx` — 64 高 + 当前项 2px 橙红线
- [ ] **3.2** `layout/main-shell.tsx` — 容器 1200 + 断点 1080/860 + 侧栏下沉
- [ ] **3.3** `layout/site-footer.tsx` — 2px 顶线 + 三档列数
- [ ] **3.4** 移动底栏（若有）— 56 + safe-area + 发布方块
- [ ] **3.5** `common/widget-card.tsx` — 去阴影 + 衬线标题

### 阶段 4 · 领域组件（L3）

- [ ] **4.1** `topic-list-item.tsx` — 三栏结构（序号 60 / 内容 / 元信息 240）
- [ ] **4.2** `topic-comment*` — 头像 32 + 子回复竖线
- [ ] **4.3** `topic-publish*` + `editor` — 标题 25 衬线 + 工具栏独立
- [ ] **4.4** `topics-nav-content.tsx` — 项高 36 + 左侧 2px 当前态
- [ ] **4.5** `profile-shell.tsx` — 16:5 头图 + 88 头像负边距 + 统计四等分
- [ ] **4.6** `user-lists.tsx` — 卡片内边距 + 未读 3px 条
- [ ] **4.7** `dashboard-data-table.tsx` — 行高 44 + 数字右对齐（已部分完成）
- [ ] **4.8** `dashboard-overview.tsx` — KPI 四列 + 图表降噪
- [ ] **4.9** `error-page.tsx` — 120px 编号 + 双栏
- [ ] **4.10** 其余 `dashboard/*-form.tsx` — 两列表单行

### 阶段 5 · 页面（L4）

- [ ] **5.1** 认证 4 页
- [ ] **5.2** 内容 16 页
- [ ] **5.3** 用户 11 页
- [ ] **5.4** 后台 18 页
- [ ] **5.5** `$` 404 兜底 1 页

### 阶段 6 · 清理与验收

- [ ] **6.1** 删除 `styles/{variables,common,content,topic,user,auth,pages}.css`（`editor.css` 保留）
- [ ] **6.2** `pnpm typecheck` + `pnpm lint` 通过
- [ ] **6.3** 四档宽度截图：1440 / 1080 / 860 / 375，逐页对照 `docs/V2/pages/*.html`
- [ ] **6.4** 暗色模式抽查 6 页（首页、详情、个人主页、后台表格、消息、404）
- [ ] **6.5** 打印预览：文章详情页 `Ctrl+P` 只有正文
- [ ] **6.6** 更新 `docs/V2/README.md` 的「已知限制」，标记已落地

---

## 九、验收标准

### 命令

```powershell
cd web
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm dev
```

### 人工核对（每页）

| 项 | 判定 |
|---|---|
| 字号 | 页面内出现的字号只能是 56/40/28/22/18/16/14/12/11 |
| 圆角 | 只能是 0（或 ≤8px 圆点用 999） |
| 强调色 | 一屏内橙红出现 ≤ 6 处 |
| 线宽 | 只有 1px / 2px / 3px |
| 间距 | 只有 4/8/12/16/24/32/48/64/96 |
| 阴影 | 只有浮层有，且是硬偏移 |

### 前后对比

每个页面改前改后各截一张，放在同一目录，肉眼比对。设计稿就是 `docs/V2/pages/` 下对应的 html。

---

## 十、风险与回退

| 风险 | 应对 |
|---|---|
| **主色从墨绿改橙红**，视觉跳变大 | 阶段 1 先只改这一个变量，看一天；不接受就单独回退 `--primary` |
| **圆角归零**影响所有 shadcn 浮层 | dialog/dropdown 会变直角，符合 A 方向；若觉得生硬，可保留浮层 2px |
| 阶段 5 删 CSS 后中间态难看 | 删 CSS **必须每页改完立刻删对应规则**，不要一次性删完 |
| `editor.css` 820 行，改动风险高 | 单独一组做，改完单独验收富文本的 12 种元素 |
| 暗色模式被遗漏 | 阶段 1 就同时改 `.dark`，不要留到最后 |

回退粒度：

```powershell
git checkout web/styles/globals.css          # 只回退 token
git checkout web/components/ui               # 只回退基础组件
git checkout web/components/topic            # 只回退某一组领域组件
```

---

## 十一、明确不做

- 不新增路由、不删路由
- 不改任何 `loader` / `clientLoader` / `action`
- 不改 API 调用与数据结构
- 不新增第三方依赖
- 不新增全局 CSS 文件（合并已完成）
- 不把 `docs/V2` 的 `.a-*` 类名搬进 React
- 不为「原型画了但原站没有」的功能补代码

---

## 十二、执行记录

### 阶段 0 ✅ 2026-10-20

- commit `9097fcf1`（`git add -A -- ':!.codebuddy'`，排除 AI 工作目录）
- 基线截图 8 张 → `docs/V2/baseline/before-*`

### 阶段 1 ✅ 2026-10-20

改动文件：`web/styles/globals.css`（主体）、`web/styles/variables.css`（2 行）。

| 动作 | 内容 |
|---|---|
| 颜色 | `:root` 与 `.dark` 全部换为 A 方向值：白 `#FFFFFF` / 墨 `#111111` / 橙红 `#FF3B00` / 线 `#E3E3E3` / 次要字 `#6B6B6B` |
| 圆角 | `--radius: 6px → 0px` |
| 内容类型色 | 原来 4 个低饱和色 → 只有话题保留橙红，其余退灰阶（`#6B6B6B` / `#111111` / `#9B9B9B`），保证全站只有一个强调色 |
| 图表色 | 墨绿系 → 黑白灰 + 橙红 |
| 字号 | `@theme inline` 新增 8 档：`--text-display/h1/h2/h3/h4/ui/micro`，各带行高与字距。**不覆盖 `--text-sm`/`--text-xs`**，12px 继续用 `text-xs` |
| 阴影 | 新增 `--shadow-hard`（8px 硬偏移）、`--shadow-lift` |
| 纸纹 | `--paper-grain: none`（A 方向无颗粒） |
| 合并 | `charts.css`(56 行) / `motion.css`(49 行) / `print.css`(131 行) 全部并入 `globals.css`，删除三个文件与对应 `@import` |

**验证**：`tsc --noEmit` exit 0；dev server 热更新生效；截图 7 张 → `docs/V2/baseline/after-*`。

#### 阶段 1 发现的两个问题

**1. 登录页真实路径是 `/user/signin`，不是 `/signin`**

react-router 的 flat routes 里 `user.signin.tsx` 生成 `/user/signin`。我第一次按 `/signin` 截图拿到的是 404 页（已改名 `after-1440-404.png` 留作 404 基线）。

**所有 `user.*` 路由都带 `/user/` 前缀**，只有 `user_.$userId.*`（带下划线）生成 `/user/:userId/*`。

**2. `components/tasks/task-widgets.tsx` 有 6 处硬编码 indigo**

```
行 89   from-indigo-50/80
行 103  bg-indigo-600        ← 「立即签到」按钮
行 118  hover:text-indigo-600
行 171  from-indigo-500 via-indigo-500/80
行 299  bg-indigo-600        ← 「去登录」按钮
行 337  hover:text-indigo-600
```

这些按钮不受 token 控制，改完 token 仍是紫色。**归入阶段 4 清理**，改成 `bg-primary` / `hover:text-primary`。

#### 阶段 1 未做的

- 未改任何组件类名（AB 面：只换值）
- 未删除 `variables.css` 等旧文件（阶段 6 处理）
- 未提交 git（等阶段 2 后一起提交，或按需单独提交）

### 阶段 2 ✅ 2026-10-20

共动 9 个文件：`globals.css`（radius 归零）+ 8 个 `components/ui/*.tsx`。

| 文件 | 改动 |
|---|---|
| `globals.css` | `--radius-sm/md/lg/xl/2xl/3xl/4xl` 全部由 4/6/8 改为 **0px**。`rounded-full` 走 `calc(infinity*1px)` 不受影响，头像仍圆 |
| `ui/button.tsx` | 新增 `ink` 变体（墨黑底，A 方向基础按钮）；`outline` hover 改为边框变黑、去掉 `shadow-xs`；`transition-all` → `transition-colors`；删除 `active:translate-y-px`（不做位移）；尺寸改 30/38/44 |
| `ui/input.tsx` | 高 `h-9` → **`h-[38px]`**；去 `shadow-xs`；focus 由 `ring-3` 改为 1px 边框变黑 + 1px ring（视觉 2px）；`px-2.5` → `px-3`；去掉 `md:text-sm` 断点跳变 |
| `ui/textarea.tsx` | 同 input；`min-h-16` → `min-h-[100px]` |
| `ui/table.tsx` | 表头 `border-b` → **`border-b-2 border-foreground`**；`th` 加 **`sticky top-0 z-10`** + 高 38 + `text-xs uppercase tracking-wider text-muted-foreground`；`td` 高 `h-11`（44）+ `px-3`；行 hover `bg-muted/60` |
| `ui/badge.tsx` | 新增三变体：`tag`（描边）、`tag-on`（墨底白字）、`type`（等宽大写 11px）。基础高 20 → 22，`transition-all` → `transition-colors` |
| `ui/card.tsx` | 去 `shadow-xs` + `ring-1 ring-foreground/10`，改 **`border border-border`** |
| `ui/empty.tsx` | 居中改**左对齐**；加 `border-t-2 border-foreground`（2px 黑线起头）；`p-12` → `py-10`；标题 `text-lg` → `text-h4` 600 |
| `ui/skeleton.tsx` | 检查后无需改：已是 `animate-breathe` + `rounded-[var(--radius-sm)]`（现为 0） |

**验证**：`tsc --noEmit` exit 0；`eslint` 对这几个文件无配置（0 error）；截图 `baseline/s2-*.png` 4 张。

#### 阶段 2 的关键发现

**`ui/empty.tsx` 和 `ui/pagination.tsx` 在项目里没有任何引用。**

```
Select-String -Pattern 'components/ui/empty'      → 0 个结果
Select-String -Pattern 'components/ui/pagination' → 0 个结果
```

项目实际用的是：

- `components/common/empty-state.tsx`（空态）
- `components/dashboard/pagination-controls.tsx`（分页）

所以这两项改动属于「改了但不会生效」，**真正的改造目标在阶段 4**。两个 `ui/` 组件保留改动（未来接入时直接合规），不计入完成度。

#### 阶段 2 未做

- 未改 `common/empty-state.tsx`、`dashboard/pagination-controls.tsx` → 阶段 4 的 4.9 与 4.11
- 未处理 `task-widgets.tsx` 的 6 处 indigo → 阶段 4
- 未提交 git

### 阶段 3 ✅ 2026-10-20

共 5 个文件：`common.css`、`topic.css`、`variables.css`、`site-header.tsx`、`widget-card.tsx`。

| 文件 | 改动 |
|---|---|
| `common.css` | 容器 `1180 → 1200`；侧栏 `260 → 280`、栏间距 `10 → 24`（left-main 与 right-main 两侧、320/360 档同步）；去掉侧栏 `transition: width`；`.footer` 加 **`border-top: 2px solid foreground`**、字号 14→12、间距 6→8、`margin 0 10px → 0`；`.footer .light` 的硬编码 `#eb5424` → `var(--primary)` |
| `site-header.tsx` | `<header>` 去掉 `bg-background/95` + `backdrop-blur` + `supports-[backdrop-filter]`，改 `border-border bg-background`（A 方向不用玻璃拟态）；内容行 `h-14 → h-16`（56→64）；`DesktopNav` 加 `usePathname` 匹配，当前项下方 **2px 橙红下划线** + 600 字重 |
| `widget-card.tsx` | `rounded-lg bg-background px-3 py-2` → `bg-card`（圆角由 token 归零）；标题 `text-sm font-medium` → **`font-heading text-h4 font-semibold`**（18px 衬线）；标题底线 `1px border-border` → **`2px border-foreground`** |
| `variables.css` | `--topics-nav-active-foreground` 由 `sidebar-primary`（橙红）改为 **`foreground`（墨黑）** |
| `topic.css` | `.dock-nav li.active` 去掉整块 `--topics-nav-color3` 底色，改 **左侧 3px 橙红条**（`::after`，`top/bottom: 8px`）。原来一屏会出现一大块淡橙，违反「橙红面积要小」 |

**验证**：`tsc --noEmit` exit 0；截图 `baseline/s3-*.png` 3 张。

#### 阶段 3 的两处判断

**1. 3.4「移动底栏」不适用**

`components/layout/` 只有 5 个文件（`home-aside` / `layout-chrome` / `main-shell` / `site-footer` / `site-header`），**没有底部导航组件**。原站移动端用的是 `Sheet` 抽屉（`site-header.tsx` 第 442 行）。

按差异裁决规则「原型有、原站没有 → 不加」，**不创建底部导航**。V2 `mobile/nav.html` 已删除，此处一致。

**2. 页头导航当前项下划线只在匹配时出现**

首页 `/` 不在导航配置里（导航是「话题 / 文章」），所以首页截图看不到下划线，这是正确行为，不是 bug。

#### 阶段 3 未做

- `common.css` 里仍有 `.main` 的三档 padding，与 V2 一致，不动
- `profile-edit-tabs-mobile/pc` 的显隐写在 common.css 的 1079 断点里，阶段 5 再看
- 紫色按钮（`task-widgets.tsx` 6 处 indigo）仍在 → 阶段 4

### 阶段 4 🚧 进行中（4 / 10）

已完成 4 项，涉及 8 个文件。

#### 4.A 清除 indigo 硬编码 ✅

`components/tasks/task-widgets.tsx` 6 处：

| 行 | 原值 | 改后 |
|---|---|---|
| 89 | `from-indigo-50/80 via-white/70 to-emerald-50/80` 渐变 | `bg-muted`（A 方向不用装饰渐变） |
| 103 | `bg-indigo-600 … text-white shadow-sm hover:bg-indigo-500` | `bg-primary … text-primary-foreground hover:bg-primary/90` |
| 118 | `hover:text-indigo-600` | `hover:text-primary` |
| 171 | `from-indigo-500 via-indigo-500/80 to-emerald-400` 渐变条 | `bg-primary` |
| 299 | `bg-indigo-600 … ring-indigo-300/60` | `bg-primary … ring-primary/40` |
| 337 | `hover:text-indigo-600` | `hover:text-primary` |

同时把 `text-slate-900 dark:text-slate-50` 换成 `text-foreground`。

#### 4.B 列表序号 ✅

`topic-list-item.tsx` 的 default 变体 `<li>`：

```
relative [counter-increment:topic] pl-14
before:absolute before:left-3 before:w-7 before:text-right
before:font-mono before:text-xs before:text-muted-foreground
before:content-[counter(topic)]
```

5 个列表容器补 `[counter-reset:topic]`：`topic-list.tsx`、`topic-dynamic-list-client-page.tsx`（2 处）、`_index.tsx`、`user-profile-client-page.tsx`。

标题字号 `text-[15px] sm:text-base` → `text-base sm:text-h4`（18px）。

**踩坑**：`::before` 被 `.topic-type-mark::before`（类型色条）占用，导致序号完全不显示，且 28px 宽的 w-7 撑成一块橙红。**修法**：把色条从 `::before` 改为 `border-left: 3px`，`::before` 腾给序号。`topic.css` 里 4 条 `[data-topic-type]::before` 同步改为 `border-left-color`。

#### 4.C 资料页 Tab ✅

`profile-shell.tsx`：当前项 `bg-primary text-primary-foreground shadow-md` → **`border-l-2 border-primary` + 墨字 600**（A 方向当前项靠左条，不铺色块）；非当前项 `text-muted-foreground hover:bg-muted`；`transition-all duration-300` → `transition-colors`。

#### 4.D 404 页 ✅

`common/error-page.tsx` 6 处：
- 状态徽章去 `rounded-full` + `bg-muted/50`
- 标题 `text-2xl sm:text-3xl` → `text-h3 sm:text-h2`
- 搜索框 `h-10 rounded-md shadow-xs` → `h-[38px]` 去阴影
- 提交按钮去 `h-10`
- 三个装饰圆点从红/黄/绿 → 灰阶三级
- 404 编号 `text-[72px]/[112px] font-black 15%` → `font-mono text-[96px]/[120px] font-bold 20%`

#### 阶段 4 待做（6 项）

| 项 | 文件 | 说明 |
|---|---|---|
| 4.2 评论区 | `topic-comment*` | 头像 32、子回复竖线 |
| 4.3 发布编辑器 | `topic-create-form.tsx` / `editor.css` | 标题 25 衬线、工具栏独立 |
| 4.5 个人主页头图 | `user-profile-client-page.tsx` | 16:5 头图 + 88px 头像负边距 + 统计四等分 |
| 4.7 后台表格 | `dashboard-data-table.tsx` | 行高 44、数字右对齐（部分已在阶段 2 由 `ui/table` 承接） |
| 4.8 后台 KPI | `dashboard-overview.tsx` | KPI 四列 + 图表降噪 |
| 4.11 后台分页 | `dashboard/pagination-controls.tsx` | 32×32 方格（`ui/pagination` 无引用） |

### 阶段 4 ✅ 完成（10 / 10）· 2026-10-20 续

第二批完成 6 项，涉及 9 个文件。

#### 4.5 个人主页 ✅

`styles/user.css` + `components/user/user-profile-card.tsx`：

```
.profile            height: clamp(184px,20vw,240px)
                 →  aspect-ratio: 16 / 5; max-height: 240px; min-height: 168px; margin-bottom: 56px
.profile-avatar     bottom: 10px → bottom: -44px（压出头图下沿）
UserAvatar size     100 → 88
```

去掉了头图左上右上的 `border-radius`。`profile-info` 保持原有结构（原站的统计条在侧栏，不在头部，按差异规则保留原结构）。

#### 4.2 评论区 ✅

`components/topic/comment-list.tsx` 6 处：
- 头像 30 → **32**
- 已采纳态 `rounded-lg border-primary/20 bg-primary/[0.06] p-3` → **`border-l-[3px] border-primary px-3 py-2`**（V2 用左条不用淡色底）
- 正文加 `text-sm leading-7`
- 外层 `rounded-lg bg-background` → `bg-card`
- 标题 `text-base font-medium` → **`font-heading text-h4 font-semibold`**
- 登录提示条 `border-primary/40 bg-primary/[0.1]` → `border-border bg-muted`；图标圈去掉 `rounded-full`
- 「已采纳」徽章 `rounded-full bg-muted text-primary` → `border-foreground bg-foreground text-background`

#### 4.3 发布编辑器 ✅

`styles/editor.css` 的 `.simple-editor`：
- `border-radius: 8px` → 0（token 归零）
- 去 `box-shadow: 0 1px 2px`
- `:focus-within` 的彩色 3px ring + 投影 → **`border-color: foreground` + `inset 0 0 0 1px foreground`**
- `.simple-editor-toolbar` 边框 `82%/78% 透明 border` → 实线 `--border`，背景 `muted 28%` → **`--muted`**（工具栏与编辑区明度分层）

#### 4.11 后台分页 ✅

`dashboard/pagination-controls.tsx`：页码 `min-w-20 text-center` → 加 **`font-mono tabular-nums`**；跳页输入框 `h-8` → `h-[30px]`。前后翻页按钮用 `variant="outline"`，已吃到阶段 2 的「hover 边框变黑」。

#### 4.7 后台表格 ✅

`dashboard/data/dashboard-data-table.tsx`：
- 外层去 `rounded-lg shadow-xs`
- 行 hover 从 `--dashboard-accent-soft/45`（淡橙）改为 **`hover:bg-muted/70`**（A 方向 hover 只变明度不变色）
- 表头 38px 吸顶、行高 44px、数字列右对齐在阶段 2/前一轮已完成，此处复核无改动

#### 4.8 后台 KPI ✅

`dashboard/dashboard-overview.tsx` 3 处：
- 主 KPI `text-2xl` → **`text-h1 font-bold tabular-nums`**（40px）
- 次 KPI `text-xl` → **`text-h2 font-bold tabular-nums`**（28px）
- 另一处 `text-2xl font-semibold` → `text-h2 font-bold tabular-nums`

#### 阶段 4 验收

- `tsc --noEmit` exit 0
- 全部 `styles/*.css` 括号平衡
- 截图 `baseline/s4-profile.png`：头图 16:5、头像 88px 压在下沿、列表序号 1、标题 18px、橙红按钮
- 后台三页需登录后验收

---

## 十三、阶段 5 · 逐页还原（50 页，按组推进）

| 组 | 页数 | 页面 |
|---|---|---|
| 认证 | 4 | `user.signin` / `user.signup` / `user.password.forgot` / `user.password.reset` |
| 内容 | 16 | `_index` `topics` `topic.$id` `topic.create` `topic.edit.$id` `topics_.category.$id` `topics_.tag.$id` `articles` `article.$id` `article.create` `article.edit.$id` `articles_.tag.$id` `search` `about` `links` `tasks` |
| 用户 | 11 | `user.$userId` `user.profile` `user.profile_.account` `user.favorites` `user.scores` `user.messages` `user.email.verify` `user_.$userId.*` × 4 |
| 后台 | 18 | 全部 `dashboard.*` |
| 兜底 | 1 | `$`（已在阶段 4 完成） |

### 5.1 认证组 ✅ 2026-10-20

`styles/auth.css` 新增 `.auth-split`（900 宽 grid）+ `.auth-split-aside`（左栏，`≥900px` 显示，右 border 分隔）：

```css
.auth-split { display: grid; grid-template-columns: minmax(0,1fr); max-width: 900px; margin: 0 auto; }
.auth-split-aside { display: none; }
@media (min-width: 900px) {
  .auth-split { grid-template-columns: minmax(0,1fr) 420px; }
  .auth-split-aside { display: block; padding: 48px 40px; border-right: 1px solid var(--border); }
}
```

4 个路由统一改为：

```
.main-body.no-bg.auth-split
  ├─ aside.auth-split-aside     kicker（SIGN IN）+ 站点名 text-h2 衬线 + 站点描述
  └─ div.signin-card            表单
```

- `signin-form.tsx` 根去掉 `mx-auto max-w-[600px]`，宽度交给 CSS
- `.signin-card` 规则加 `width: 100%; max-width: 420px; margin-inline: auto`（双栏撑满右列，单栏居中）
- `signup` / `forgot` / `reset` 三个路由去掉 `WidgetCard` 包裹，改用 `.signin-card`，`WidgetCard` import 同步移除
- 三个路由补 `useAppState()` 取站点配置

**踩坑**：`SiteConfig` 没有 `name` / `description` 字段，真实字段是 **`siteTitle`** / **`siteDescription`**（`lib/api/types.ts`）。第一次 `tsc` 报 5 个 TS2339，已修正。

**验证**：`tsc` exit 0；截图 `baseline/s5-signin.png` —— 左栏 SIGN IN + 站点名 28px 衬线，右栏 420px 卡片、1px 边框、直角、橙红登录按钮，中间 1px 分隔线。

**已知小差异**：左栏只有站点名与描述，没有 V2 原型里的三条卖点列表。原因是三条文案需要新增 i18n key，而本轮约束「不改 i18n」。站点描述为空时左栏只剩标题，可接受。

### 5.2 待做

内容 16 页 / 用户 11 页 / 后台 18 页。建议下一轮从内容组的 `_index` + `topic.$id` 开始（这两个页面决定全站的信息密度基线）。
