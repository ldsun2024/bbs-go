# bbs-go V2 · 瑞士网格设计系统

> 版本：v3.0 ｜ 更新：2026-10-20
> 定位：**从零设计**的新视觉语言，不继承原站样式
> 范围：**与原前端路由 1:1 对应，50 页，不多也不少**

---

## 一、范围声明

本目录只输出「原前端真实存在的页面」。

基线来自 `web/app/routes/`：

```
54 个 .tsx  =  50 个页面（含 $ 404 兜底）
              + 1 个 dashboard.tsx 布局（仅 <Outlet/>）
              + 3 个非页面（install / redirect / user.signin_.callback.$）
```

**不包含**：独立移动端页面（原前端靠响应式同页适配）、空态合集、骨架屏合集（这两类是组件内部状态，不是路由）。

---

## 二、50 页对照表

### 前台 · 内容（16 页）· `pages/content/`

| 原路由 | 文件 |
|---|---|
| `_index` | `home.html` |
| `topics` | `topics.html` |
| `topic.$id` | `topic-detail.html` |
| `topic.create` | `compose.html` |
| `topic.edit.$id` | `topic-edit.html` |
| `topics_.category.$id` | `category.html` |
| `topics_.tag.$id` | `tag.html` |
| `articles` | `articles.html` |
| `article.$id` | `article-detail.html` |
| `article.create` | `article-create.html` |
| `article.edit.$id` | `article-edit.html` |
| `articles_.tag.$id` | `article-tag.html` |
| `search` | `search.html` |
| `about` | `about.html` |
| `links` | `links.html` |
| `tasks` | `tasks.html` |

### 前台 · 用户（15 页）· `pages/user/`

| 原路由 | 文件 |
|---|---|
| `user.signin` | `signin.html` |
| `user.signup` | `signup.html` |
| `user.password.forgot` | `password-forgot.html` |
| `user.password.reset` | `password-reset.html` |
| `user.email.verify` | `email-verify.html` |
| `user.$userId` | `profile.html` |
| `user.profile` | `profile-edit.html` |
| `user.profile_.account` | `settings.html` |
| `user.favorites` | `favorites.html` |
| `user.scores` | `scores.html` |
| `user.messages` | `messages.html` |
| `user_.$userId.articles` | `profile-articles.html` |
| `user_.$userId.badges` | `profile-badges.html` |
| `user_.$userId.fans` | `profile-fans.html` |
| `user_.$userId.followed` | `profile-followed.html` |

### 后台（18 页）· `pages/admin/`

| 原路由 | 文件 |
|---|---|
| `dashboard._index` | `dashboard.html` |
| `dashboard.content` | `content.html` |
| `dashboard.topics` | `topics.html` |
| `dashboard.articles` | `articles.html` |
| `dashboard.categories` | `categories.html` |
| `dashboard.users` | `users.html` |
| `dashboard.roles` | `roles.html` |
| `dashboard.levels` | `levels.html` |
| `dashboard.badges` | `badges.html` |
| `dashboard.user-badges` | `user-badges.html` |
| `dashboard.user-exp-logs` | `user-exp-logs.html` |
| `dashboard.user-reports` | `user-reports.html` |
| `dashboard.tasks` | `tasks.html` |
| `dashboard.user-task-logs` | `user-task-logs.html` |
| `dashboard.links` | `links.html` |
| `dashboard.forbidden-words` | `forbidden-words.html` |
| `dashboard.settings` | `settings.html` |
| `dashboard.email-logs` | `email-logs.html` |

### 错误兜底（1 页）· `pages/states/`

| 原路由 | 文件 |
|---|---|
| `$` | `error.html`（404 / 500 / 403 三种状态） |

---

## 三、怎么看

**双击任意 html 即可**，无需服务器、无需联网。

页面只引用两个文件：

```
assets/tokens.css    变量唯一来源（颜色 / 字号 / 间距 / 圆角 / 线宽 / 动效）
assets/ui.css        全部组件样式（.a-*）
```

页面本身**没有 `<style>`、没有内联 `style`**。改配色或间距只改 `tokens.css`，50 页同时生效。

建议顺序：

1. `pages/content/home.html` — 信息架构
2. `pages/content/topic-detail.html` — 正文排版
3. `pages/user/profile.html` — 16:5 头图与统计条
4. `pages/admin/dashboard.html` — 后台密度与纯 CSS 图表
5. `pages/states/error.html` — 404 / 500 / 403

---

## 四、设计规范

| 文件 | 内容 |
|---|---|
| `spec/01-tokens.md` | 颜色 / 字号 / 间距 / 圆角 / 线宽 / 阴影 / 动效全表 |
| `spec/02-typography.md` | 字体族、字号阶、字重、行高、字距、中文排版 |
| `spec/03-layout.md` | 网格、容器宽度、断点、页面骨架 |
| `spec/04-components.md` | 按钮 / 输入 / 标签 / 表格 / 分页 / 空态 / 浮层 |
| `spec/05-motion-effects.md` | 动效清单、时长曲线、降级规则 |

规范与 `tokens.css` 冲突时，**以 `tokens.css` 为准**。

---

## 五、A 方向的核心约束

1. **零圆角、零投影**：`--a-radius: 0`；阴影仅 `.a-shadow-pop`（硬偏移），只给浮层。
2. **一条强调色**：橙红 `#FF3B00` 只用于主按钮、当前项指示、序号 hover、未读标记。
3. **线宽三档**：1px 分隔 / 2px 结构线 / 3px 标记线。
4. **字号九档**：56 / 40 / 28 / 22 / 18 / 16 / 14 / 12 / 11。禁止 13、15、17、19 等中间值。唯一例外 `--a-fs-error: 120px`（仅 404 编号）。
5. **间距九档**：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。
6. **中文优先**：正文行高 1.7，段间距大于行间距，字重不超过 700。
7. **动效两件事**：入场淡入 180ms、hover 变色 120ms。不做位移、缩放、循环。

---

## 六、目录

```
docs/V2/
├── README.md                  本文件
├── showcase/                  三套方向样板（阶段一产物，自包含）
│   ├── a-swiss-grid.html          已选：A 方向
│   ├── b-ink-night.html
│   └── c-poster-magazine.html
├── spec/                      五份规范文档
├── assets/
│   ├── tokens.css             变量唯一来源
│   └── ui.css                 组件样式
└── pages/
    ├── content/   16 页
    ├── user/      15 页
    ├── admin/     18 页
    └── states/     1 页
```

`showcase/` 三份是阶段一的决策产物，各自完全自包含（CSS 内联、无外部引用），保留作为历史对照，不再维护。

---

## 七、已知限制

| 项 | 说明 |
|---|---|
| **图表无脚本** | 后台柱状图与排行条是纯 CSS：柱子用 `.a-chart-bar i` 的 `.h1`–`.h10` 十档高度，排行用 `.a-rank-track i` 的 `.w1`–`.w10` 十档宽度。接入真实数据后需改为按值计算。 |
| **后台无抽屉** | < 900 时 `.a-admin-nav` 直接隐藏，实现时要补汉堡菜单。 |
| **无独立移动页** | 原前端是响应式同页。`ui.css` 里保留了 `.a-m-*` 与 `.a-bottom-nav` 组件样式，但当前 50 页中未使用，实现移动端时可复用。 |
| **原型无业务逻辑** | 按钮不响应，表单不提交。选中、未读、禁用、错误等状态以静态示例呈现。 |
| **状态页只有 1 个** | `error.html` 对应 `$` 兜底路由。空态与骨架是组件状态，不单独成页，样式在 `ui.css`（`.a-empty`、`.a-skeleton`、`.a-skel-*`）。 |

---

## 八、从设计到代码的落地顺序

| 步 | 做什么 | 依赖 |
|---|---|---|
| 1 | `tokens.css` 的变量并入 `web/styles/globals.css` 的 `@theme` | — |
| 2 | 按 `ui.css` 重写基础组件（按钮、输入、标签、表格、分页） | 1 |
| 3 | 前台内容 16 页 | 2 |
| 4 | 前台用户 15 页 | 2 |
| 5 | 后台 18 页（先 `dashboard.html` 定壳，其余复用表格） | 2 |
| 6 | `error.html` 接入路由兜底 | 3–5 |

每步可独立验收。
