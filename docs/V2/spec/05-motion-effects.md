# 05 · Motion & Effects

> 方向：**A · 瑞士网格**
> 版本：v1.0 ｜ 2026-10-20
> 前置：`01-tokens.md`

---

## 一、原则

A 的动效只有三个作用，不做别的：

1. **确认状态变化**（hover、focus、active）
2. **提示内容到达**（列表入场淡入）
3. **表达层级**（浮层出现）

**不做的事**：不做装饰性动画、不做滚动视差、不做无限循环、不做弹跳缩放。

理由：瑞士网格的气质是「静止的印刷品」。动效一多，就变成网页特效演示。

---

## 二、时长与曲线

| Token | 值 | 用途 |
|---|---|---|
| `--a-dur-fast` | `120ms` | hover 变色、focus 环、按钮状态 |
| `--a-dur-base` | `180ms` | 入场淡入、展开收起、浮层淡入 |
| `--a-dur-slow` | `260ms` | 抽屉、大弹窗 |
| `--a-ease` | `cubic-bezier(.2,.7,.3,1)` | **全站唯一曲线** |

### 为什么用这条曲线

`cubic-bezier(.2,.7,.3,1)` 是「快起慢收」：开头 20% 就走完 70% 的距离，末尾缓慢贴合。

- 比 `ease` 更有力，适合 120-260ms 的短动效
- 比 `ease-out` 稳，不会在结尾「顿一下」
- 不用 `spring` / `bounce`：A 不做弹性

### 时长上限

**任何动画不超过 300ms。** 超过就会被感知为「卡顿」而非「流畅」。

---

## 三、状态矩阵

### 3.1 通用状态

| 状态 | 触发 | 变化 | 时长 |
|---|---|---|---|
| default | — | — | — |
| hover | 鼠标进入 | 颜色变化 | 120ms |
| hover（列表项） | 鼠标进入 | 底变 `#FAFAFA` | 120ms |
| active | 按下 | `translateY(1px)` | 0ms（瞬时） |
| focus-visible | 键盘 Tab | `outline: 2px solid var(--a-accent); outline-offset: 2px` | 0ms |
| disabled | `disabled` 属性 | 颜色降到 `--a-ink-4`，`cursor: not-allowed`，**无 hover** | 0ms |
| loading | 提交中 | 文字换「处理中…」，`pointer-events: none`，不改变尺寸 | 0ms |

### 3.2 各元素的具体变化

| 元素 | hover | active | 备注 |
|---|---|---|---|
| 主按钮（黑底） | 底→透明，字→黑 | 下移 1px | 边保持黑 |
| 强调按钮（橙红） | 底→透明，字→橙红 | 下移 1px | — |
| 描边按钮 | 边→黑 | 下移 1px | — |
| 文字按钮 | 下划线 1px→2px | 无 | — |
| 危险按钮 | 删除线保持，字重 600→700 | 无 | **不换色** |
| 链接（正文内） | 加下划线 | 无 | 正文链接默认无下划线 |
| 导航项 | 字 `--a-ink-2`→`--a-ink` | 无 | 当前项已 600 + 橙红底边 |
| 列表项 | 底 `#FAFAFA`；序号→橙红 | 无 | 两处同时变 |
| 列表标题 | 字→橙红 | 无 | — |
| 标签 chip | 边→`--a-ink-4` | 无 | 选中态不变 |
| 输入框 | 无 | 无 | 只在 focus 变边色 |
| 表格行 | 底 `#FAFAFA` | 无 | — |
| 分页按钮 | 边→黑 | 无 | 当前页不变 |

> **规则**：hover 只改颜色，不改尺寸、不改位置、不加阴影。唯一例外是 active 的 1px 位移。

---

## 四、动效清单（只有 5 个）

### 4.1 列表入场淡入

```css
@keyframes a-fade { from { opacity: 0 } to { opacity: 1 } }

.a-item { animation: a-fade var(--a-dur-base) var(--a-ease) backwards; }
.a-item:nth-child(1) { animation-delay: 0s; }
.a-item:nth-child(2) { animation-delay: .03s; }
.a-item:nth-child(3) { animation-delay: .06s; }
.a-item:nth-child(4) { animation-delay: .09s; }
.a-item:nth-child(5) { animation-delay: .12s; }
.a-item:nth-child(6) { animation-delay: .15s; }
```

- 只做 opacity，**不做 translateY**
- 阶梯间隔 30ms，最多 6 项（第 7 项起无延迟）
- 总时长不超过 180 + 150 = 330ms

### 4.2 浮层出现

```css
@keyframes a-pop {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.a-modal, .a-dropdown { animation: a-pop var(--a-dur-base) var(--a-ease); }
```

- 位移只有 4px，方向从上方进入
- 关闭时无动画（瞬时消失），避免等待

### 4.3 Toast 出现

```css
@keyframes a-toast {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- 从下方 8px 进入
- 停留 4000ms 后淡出（`opacity 1→0`，180ms）

### 4.4 骨架呼吸

```css
@keyframes a-breathe {
  0%, 100% { opacity: .65 }
  50%      { opacity: 1 }
}
.a-skeleton { background: #F2F2F2; animation: a-breathe 1.4s ease-in-out infinite; }
```

- 周期 1.4s
- **唯一的无限循环动画**，因为加载态需要持续提示
- 数据到达后立即移除，不做淡出

### 4.5 抽屉滑入

```css
@keyframes a-slide {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.a-drawer { animation: a-slide var(--a-dur-slow) var(--a-ease); }
```

- 从右侧 100% 滑入
- 只有抽屉用位移，其余都不用

---

## 五、焦点环

```css
:focus-visible {
  outline: 2px solid var(--a-accent);
  outline-offset: 2px;
}
```

| 项 | 值 |
|---|---|
| 粗 | 2px |
| 色 | `--a-accent`（橙红） |
| 偏移 | 2px |
| 圆角 | 0（跟随元素直角） |

**必须保留**。A 的橙红在 focus 上是最合理的用法：键盘用户需要知道自己在哪。

**不用 `outline: none` 去掉焦点环**，除非同时给出等效的可见替代（如 2px 黑边）。

---

## 六、降级

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

同时保证：

- 骨架屏在降级模式下变成**静态灰块**（`opacity: 1`，不呼吸）
- 所有「靠动画传达的信息」必须有静态替代（如 loading 文字）

---

## 七、性能约束

| 规则 | 原因 |
|---|---|
| 只动 `opacity` / `color` / `background-color` / `transform` | 这四类走合成层，不触发重排 |
| 不动 `width` / `height` / `top` / `left` / `margin` | 会触发 layout，长列表会掉帧 |
| `will-change` 只在动画期间加，结束后移除 | 常驻会吃显存 |
| 入场动画最多 6 项带延迟 | 20 项阶梯延迟会让最后一项等 600ms |

---

## 八、禁止清单

| ❌ 禁止 | 原因 |
|---|---|
| 弹跳 / 回弹（`cubic-bezier` 带负值） | 与印刷气质冲突 |
| 缩放（`scale`） | 会让文字模糊 |
| 旋转 | 除加载图标外一律不用 |
| 视差滚动 | 增加 JS 依赖，且A是静态版式 |
| 无限循环（除骨架） | 分散注意力 |
| 大于 300ms 的动画 | 感知为卡顿 |
| hover 改变尺寸或位置 | 会让列表跳动 |
| `transition: all` | 会意外触发不需要的属性 |
| 用 JS 控制入场动画 | 纯 CSS 足够，且不阻塞首屏 |

---

## 九、自检清单

- [ ] 所有 transition 是否指定了具体属性（不是 `all`）
- [ ] 是否有超过 300ms 的动画
- [ ] 是否除骨架外还有无限循环
- [ ] hover 是否只改颜色
- [ ] active 位移是否只有 1px
- [ ] 焦点环是否保留且为 2px 橙红
- [ ] 是否加了 `prefers-reduced-motion` 降级
- [ ] 入场动画是否只动 opacity
