# 博客维护约定

用户要求在本机维护 Hexo 博客，并在每次完成内容更新后同步到 GitHub。

- 本仓库：`SEmmmer/hexo`，公开仓库，默认分支 `main`。
- 网站：`https://semmmer.github.io/hexo/`。
- 发布文章以 Markdown 原稿为准，HTML 和 preview 渲染结果仅用于检查排版。用户给出 HTML 路径时，先查找同目录对应的 `.md`；二者不一致时采用 Markdown 当前内容，不把 HTML 中已删减的段落、表格或附件链接补回正文。
- 导入时保留 Markdown 的原意、数字和结构，只做 Hexo 元信息、图片路径、摘要分隔及必要的排版适配。提交前重新核对原稿，避免发布原稿编辑前的旧副本。
- 观鸟小结以后按用户指定的 **NEF 原片对照版 v3** 发布。来源是相邻项目 `../观鸟小结/reports/YYYY-MM/`：优先读取 `manifest.json` 的 `active_documents.markdown/html` 指定的当前稿；未指定时，Markdown 依次查找 `blog-v3.md`、`blog-v2.md`、`blog.md`，交互阅读版依次查找 `blog-v3.html`、`blog.html`。同时从当前 HTML 和 `raw-preview-manifest.json` 导入原片对照关系与来源标注，不用旧 HTML 的文字覆盖最新 Markdown。同步已发布月份使用 `npm run import:birdwatching -- 2026-06 2026-07 2026-08`（按需替换月份），它保留本博客元信息和发布日期。6 月发布日期为 2026-07-01，7 月为 2026-08-01，8 月为 2026-09-01。
- v3 对照数据保存在 `source/_data/photo_comparisons.json`。保留“查看原片／返回成片”、月份导航、完整构图和拍摄参数切换；早期 JPEG 和原片暂缺必须如实标注。只复制正文引用的成片、已提取的 NEF 内嵌 JPEG 或明确标注的早期 JPEG，不复制 NEF 文件、NAS 路径或内部工作记录。对照展示图也由构建生成 WebP，点击切换才加载；完整 JPEG 保持原文件，通过点击图片查看。不得因后续同步 Markdown 丢失这些功能。
- 原片切换必须保持按钮位置、页面滚动和键盘焦点稳定。以成片比例预留展示框、完整容纳横竖幅；固定按钮宽度，成片与原片参数共同占位。加载期间使用状态锁及 `aria-disabled/aria-busy`，不临时设置原生 `disabled`，不执行自动滚动；失败保留成片并允许重试。修改交互后，除单元检查外，构建并运行 `node tools/qa-photo-comparison.cjs`，在浏览器中检查真实文章、横竖幅、页尾及失败重试，并补查 Enter／空格和完整 JPEG 灯箱。共享 CSS/JS 随构建生成内容版本号，确保发布页面引用新资源。
- 文章图片保留原始文件，构建时自动生成多种尺寸的 WebP 展示图；JPEG 照片使用质量 86，PNG 图表使用无损编码。不要覆盖原图或手工改写 Markdown 为压缩图路径。首屏主图优先加载，其余图片延迟加载，点击大图读取原图。新增或调整图片处理时运行 `npm run test:images` 并检查构建结果和实际画质。
- 在完成用户要求的文章或配置修改后，运行 `npm run sync -- "简要中文更新说明"`，提交并推送这次工作；用户明确要求暂不提交或发布时遵循用户指示。
- 推送前检查差异，不把不相关的用户改动混入提交。存在无法判断的未提交改动时，使用明确的文件路径单独提交本次工作，不运行会暂存全仓库改动的同步脚本。
- 构建失败或推送失败时先修复并重试，报告实际结果；不要把本地构建成功说成网站已上线。
- 发布由 `.github/workflows/pages.yml` 完成；网站根路径是 `/hexo/`，本地预览通过 `_config.local.yml` 覆盖为 `/`。
- 不提交 `public/`、`node_modules/`、缓存、凭据及 `source/_drafts/`。不使用强制推送，不重写远端历史。
- 维护主题配置，不直接修改 `node_modules/` 中的主题源码。
