// Hexo 默认深度合并主题配置。导航使用本站配置，避免出现两套首页/归档。
hexo.extend.filter.register('before_generate', () => {
  const menu = hexo.config.theme_config?.menu;
  if (menu) hexo.theme.config.menu = { ...menu };
});
