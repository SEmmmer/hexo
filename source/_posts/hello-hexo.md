---
title: 你好，Hexo
date: 2026-09-18 00:00:00
tags:
  - Hexo
categories:
  - 博客
---

博客从这里开始。用 Markdown 写作，把想法留在自己的空间里。

<!-- more -->

## 写一篇新文章

在博客目录中运行：

```powershell
npm run new -- "我的第一篇文章"
```

打开 `source/_posts/` 中生成的 Markdown 文件，就可以开始写作。文章顶部可以设置标题、日期、标签和分类。

## 本地预览

```powershell
npm run dev
```

在浏览器打开 <http://localhost:4000>。保存文章后，刷新页面就能看到更新。

## 同步到 GitHub

写完后运行：

```powershell
npm run sync -- "更新博客内容"
```

该命令会先生成博客，成功后提交并推送源码。文章、主题配置和依赖锁文件一起保存，便于以后迁移或恢复。
