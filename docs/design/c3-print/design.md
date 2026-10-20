# C3 · 打印样式

> 所属：锦上添花 ｜ 工作量 S（约 1 小时）｜ 依赖：A1（正文排版）
> 原型：`prototype.html`

## 1. 问题

项目没有任何 `@media print` 规则。用户打印文章时得到的是：

- 顶部导航（含搜索框、头像、按钮）
- 左侧分类条、右侧侧栏（作者卡、相关文章）
- 评论区
- 页面背景色块（部分浏览器不打印背景，会变成大片空白）
- 链接只剩蓝字，打印后不知道指向哪里

对"知识库 / 文章沉淀"这一定位来说，这是个明显缺口 —— 学生把文章打印出来做笔记是真实场景。

## 2. 目标

- 只打印正文
- 正文占满纸张，字号适合纸质阅读
- 链接显示完整 URL
- 避免标题被分页切断

## 3. 方案

### 3.1 规则

```css
@media print {
  /* 1. 隐藏非内容元素 */
  .site-header, .footer, .aside, .chips,
  .comment, .article-foot, .bottom-nav,
  .back-to-top, .toast { display: none !important; }

  /* 2. 去背景与阴影，避免油墨浪费 */
  body, .card, .article {
    background: #fff !important;
    box-shadow: none !important;
    border: 0 !important;
  }

  /* 3. 正文全宽 + 纸质字号 */
  .layout { display: block !important; }
  .article { max-width: none; padding: 0; }
  .prose {
    max-width: none;
    font-size: 11.5pt;     /* 约等于 15.3px，纸质阅读合适 */
    line-height: 1.75;
    color: #000;
  }

  /* 4. 标题不被分页切断 */
  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
  figure, pre, blockquote, table { break-inside: avoid; }

  /* 5. 链接显示 URL */
  .prose a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #666;
  }

  /* 6. 页边距与页眉页脚 */
  @page { margin: 18mm 16mm; }
}
```

### 3.2 字号换算

| 屏幕 | 打印 | 说明 |
|---|---|---|
| 15px | 11.5pt | 纸质阅读比屏幕更适合小字号 |
| 20px（h2） | 15pt | 保持层级差 |
| 13.5px（元信息） | 10pt | 弱化但不消失 |

用 `pt` 而非 `px`，打印机的物理尺寸才准确。

### 3.3 可选增强

- 正文末尾加打印信息：「本文打印于 2026-10-20 · 来源 bbs.example.com」
- 二维码：内容 URL 生成二维码放页脚（需引入库，可选）

## 4. 验收

- [ ] 打印预览里没有导航、侧栏、评论区
- [ ] 正文单栏贯穿页面，无左右留白异常
- [ ] 二级标题不会出现在页底
- [ ] 外部链接后面带 URL
- [ ] 打印结果没有大面积深色块（省墨）
