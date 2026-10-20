# B1 · 移动端专项

> 所属：细节打磨 ｜ 工作量 M（约半天）｜ 依赖：A5（类型色条）
> 原型：`prototype.html`

## 1. 问题

`web/styles/common.css` 的移动端处理只有两条，而且是"减法"：

```css
@media screen and (max-width: 1024px) {
  .main { padding: 1rem 0.5rem 0 !important; }
}
@media screen and (max-width: 768px) {
  .main { padding: 0.5rem 0.5rem 0 !important; }
  .topics-nav, .topics-wrapper .topics-nav { display: none; }   /* 分类条直接消失 */
}
```

具体问题：

| # | 问题 | 影响 |
|---|---|---|
| 1 | 768px 以下**隐藏分类条** | 用户无法切换节点，等于只能看"全部" |
| 2 | 左右 padding 缩到 0.5rem | 内容贴边，视觉局促 |
| 3 | 无底部导航 | 每次换页都要点右上角抽屉，路径长 |
| 4 | chip 高 26px | 触控目标小于 44px，容易点错 |
| 5 | 无安全区处理 | iPhone 底部横条会压住内容 |
| 6 | 列表项三列 grid 在窄屏挤压 | 日期列 + 统计列占掉 172px，标题只剩一半宽 |

## 2. 目标

- 分类条**不消失**，改为横向滚动
- 底部常驻三项操作，拇指可达
- 所有可点元素触控区 ≥ 44×44
- 适配 `env(safe-area-inset-bottom)`

## 3. 方案

### 3.1 分类条：横向滚动

```css
.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;          /* Firefox */
  -webkit-overflow-scrolling: touch;
  padding: 12px 16px;
}
.chips::-webkit-scrollbar { display: none; }
.chip { flex: 0 0 auto; height: 32px; padding: 0 14px; }  /* 32 + 上下 12 padding = 56 触控区 */
```

右侧加 24px 渐隐遮罩，暗示"还能滑"。

### 3.2 列表项：三列改两行

宽度 < 860 时：

```
[类型徽标] 标题                      10-19
摘要两行
作者 · 分类 · 96 评论 · 3,842 浏览
```

日期并入元信息行末尾，统计并入元信息，取消右侧独立列。

### 3.3 底部导航

| 位置 | 内容 | 说明 |
|---|---|---|
| 左 | 首页 | 线性图标 + 11px 文字 |
| 中 | 发布 | 44×44 圆形墨绿按钮，向上凸出 12px |
| 右 | 我的 | 未读时右上角 8px 红点 |

```css
.bottom-nav {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 56px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 1px solid var(--line);
  z-index: 40;
}
body { padding-bottom: calc(56px + env(safe-area-inset-bottom)); }
```

### 3.4 触控目标

| 元素 | 视觉高度 | 实际触控区 |
|---|---|---|
| chip | 32 | 56（上下 padding 12） |
| 列表项 | 96 | 整行可点 |
| 底部导航项 | 56 | 56 × 88 |
| 顶栏图标 | 32 | 44（padding 6） |

## 4. 验收

- [ ] 375px 宽度下分类条可横向滑动，不消失
- [ ] 列表项不出现横向滚动条
- [ ] 底部导航不遮挡最后一条内容
- [ ] iPhone 安全区下方不留白、不压字
- [ ] 所有按钮单击命中率正常（不出现在两根手指之间点不中）
