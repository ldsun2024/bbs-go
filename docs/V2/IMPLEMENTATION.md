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
