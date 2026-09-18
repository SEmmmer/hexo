const { escapeHTML, url_for } = require('hexo-util');

// 用法：{% responsive_image 桌面图片 手机图片 宽 高 "图片说明" %}
hexo.extend.tag.register('responsive_image', (args) => {
  const [desktopPath, mobilePath, width, height, ...description] = args;
  if (!desktopPath || !mobilePath || !/^\d+$/.test(width) || !/^\d+$/.test(height)) {
    throw new Error('responsive_image 需要桌面图片、手机图片、宽度和高度。');
  }
  const desktop = escapeHTML(url_for.call(hexo, desktopPath));
  const mobile = escapeHTML(url_for.call(hexo, mobilePath));
  const alt = escapeHTML(description.join(' '));
  // Landscape 跳过 fancybox 容器里的 img，避免插入链接破坏 picture 的结构。
  return `<picture class="article-picture fancybox" data-src="${desktop}" data-type="image">`
    + `<source media="(max-width:600px)" srcset="${mobile}">`
    + `<img src="${desktop}" alt="${alt}" width="${width}" height="${height}">`
    + '</picture>';
});
