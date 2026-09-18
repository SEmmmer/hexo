// Hexo 默认深度合并配置；本站的导航与侧栏列表需要整体替换默认值。
hexo.extend.filter.register('before_generate', () => {
  const { menu, widgets } = hexo.config.theme_config ?? {};
  if (menu) hexo.theme.config.menu = { ...menu };
  if (widgets) hexo.theme.config.widgets = [...widgets];
});
