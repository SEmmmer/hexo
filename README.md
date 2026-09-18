# Emmmer 的 Hexo 博客

- 博客：<https://semmmer.github.io/hexo/>
- 仓库：<https://github.com/SEmmmer/hexo>
- 发布进度：<https://github.com/SEmmmer/hexo/actions>

使用 Hexo 8 和 Landscape 主题，支持中文、文章归档、标签、分类与 RSS。源码保存在 `main` 分支；每次推送后，GitHub Actions 会自动生成网站并发布到 GitHub Pages。云端构建与本机统一使用上海时区，保持文章日期和链接一致。

## 本机使用

在此目录打开 PowerShell。首次使用或在新电脑上克隆后安装依赖：

```powershell
npm ci
```

需要 Node.js 20.19 或更新版本，推荐 Node.js 24 LTS，以及 Git。推送时使用本机已登录的 GitHub 凭据。

### 写文章

```powershell
npm run new -- "我的第一篇文章"
```

编辑 `source/_posts/` 下生成的 Markdown 文件。文件顶部的 `title`、`date`、`tags` 和 `categories` 分别对应标题、发布时间、标签和分类。日期使用上海时区；未来日期的文章在到期并重新构建后显示。

已经启用文章资源目录。新建文章时，会同时创建同名文件夹。把图片放进该文件夹，在文章中插入以下标签；本地预览和线上地址都能正常解析：

```text
{% asset_img example.png 图片说明 %}
```

### 本地预览

```powershell
npm run dev
```

访问 <http://localhost:4000>。保存文件后刷新页面；按 `Ctrl+C` 停止服务。预览只监听本机地址。

### 更新并发布

写完后运行一条命令：

```powershell
npm run sync -- "新增：我的第一篇文章"
```

也可以直接运行 `npm run sync`，自动生成带上海时间的提交说明。命令会依次：

1. 检查分支和冲突，清理缓存并生成整个博客；失败时停止。
2. 提交当前仓库全部未被忽略的改动，包括新增、修改和删除的文章。
3. 推送 `main` 到 GitHub，触发 Pages 自动发布。

推送成功表示源码已到达 GitHub；网站上线以 Actions 中的部署结果为准。即使没有新的文件改动，此命令也会重试推送已有本地提交。它不会自动强制推送或处理合并冲突。

如果 GitHub 上有其他电脑产生的新提交，在工作区改动已提交或妥善保存后运行 `git pull --rebase origin main`；处理完冲突再执行同步。

### 草稿

```powershell
npm run new -- draft "尚未完成的想法"
npx hexo publish "尚未完成的想法"
npm run sync -- "发布新文章"
```

`source/_drafts/` 默认只留在本机，不进入 GitHub，也不会出现在网站上。正式发布会把文章移到 `_posts`。草稿需要自行备份。公开仓库中的文章源码和历史提交对所有人可见。

## 常用文件

| 文件或目录 | 用途 |
| --- | --- |
| `source/_posts/` | 文章 Markdown |
| `source/about/index.md` | 关于页面 |
| `source/_posts/文章名/` | 文章图片等资源 |
| `_config.yml` | 博客标题、作者、线上网址、时区等 |
| `_config.local.yml` | 本地预览网址与根路径 |
| `_config.landscape.yml` | 导航、侧栏、主题设置 |
| `scaffolds/` | 新文章、页面、草稿模板 |
| `scripts/theme-config.js` | 使用本站导航和侧栏配置，避免默认菜单重复 |
| `tools/sync.mjs` | 检查、提交、推送的一键命令 |
| `.github/workflows/pages.yml` | GitHub Pages 自动发布 |

`node_modules/`、生成的 `public/`、缓存和本地环境变量文件均已忽略。提交 `package-lock.json` 以保持本机和云端依赖一致。不要直接修改 `node_modules/` 中的主题文件；主题配置写在 `_config.landscape.yml` 中。

## 参考

- [Hexo 写作](https://hexo.io/zh-cn/docs/writing)
- [Hexo 配置](https://hexo.io/zh-cn/docs/configuration)
- [Hexo 与 GitHub Pages](https://hexo.io/zh-cn/docs/github-pages)
