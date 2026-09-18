const { url_for } = require('hexo-util');

hexo.extend.injector.register('head_end', () => {
  const href = url_for.call(hexo, '/css/article.css');
  return `<link rel="stylesheet" href="${href}">`;
});
