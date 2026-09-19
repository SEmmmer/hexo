const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const cheerio = require('cheerio');
const { url_for } = require('hexo-util');
const { localRoute, optimizeImage, rewriteImages } = require('../tools/image-optimizer.cjs');
const { addPhotoComparisons } = require('../tools/photo-comparisons.cjs');

let manifest = new Map();
let comparisons = {};
let comparisonVersion = '';

hexo.extend.filter.register('before_generate', async () => {
  const settings = hexo.config.image_optimization || {};
  const next = new Map();
  const assets = new Map();
  for (const model of ['Asset', 'PostAsset']) {
    for (const asset of hexo.model(model).toArray()) {
      if (asset.path && /\.(?:jpe?g|png)$/i.test(asset.path)) assets.set(asset.path, asset.source);
    }
  }
  const references = new Set();
  for (const collection of ['posts', 'pages']) {
    for (const item of hexo.locals.get(collection).toArray()) {
      const $ = cheerio.load(item.content || '', null, false);
      $('img').each((_, image) => {
        const route = localRoute($(image).attr('src'), hexo.config.url, hexo.config.root);
        if (assets.has(route)) references.add(route);
      });
    }
  }
  comparisons = hexo.locals.get('data').photo_comparisons || {};
  comparisonVersion = createHash('sha256')
    .update(fs.readFileSync(path.join(hexo.source_dir, 'js/photo-comparison.js')))
    .update(fs.readFileSync(path.join(hexo.source_dir, 'css/photo-comparison.css')))
    .digest('hex').slice(0, 12);
  for (const article of Object.values(comparisons)) {
    for (const photo of article.photos) {
      if (!photo.comparison) continue;
      if (!assets.has(photo.comparison)) throw new Error(`Missing comparison image: ${photo.comparison}`);
      references.add(photo.comparison);
    }
  }
  const cacheDir = path.join(hexo.base_dir, '.cache', 'optimized-images');
  // Bounded concurrency keeps local previews and CI memory use predictable.
  const queue = [...references];
  const worker = async () => {
    while (queue.length) {
      const route = queue.shift();
      const image = await optimizeImage(assets.get(route), cacheDir, settings);
      if (image) next.set(route, image);
    }
  };
  await Promise.all([worker(), worker()]);
  manifest = next;
  await fs.promises.mkdir(cacheDir, { recursive: true });
  await fs.promises.writeFile(path.join(cacheDir, 'report.json'), JSON.stringify([...manifest], null, 2));
  hexo.log.info('Optimized %d article images (WebP, responsive sizes, lazy loading)', manifest.size);
});

hexo.extend.generator.register('optimized-images', () => {
  const routes = new Map();
  for (const image of manifest.values()) {
    for (const variant of image.variants) {
      routes.set(variant.path, {
        path: variant.path,
        data: () => fs.createReadStream(variant.file),
      });
    }
  }
  return [...routes.values()];
});

hexo.extend.filter.register('after_render:html', html => {
  const options = {
    siteUrl: hexo.config.url,
    root: hexo.config.root,
    sizes: hexo.config.image_optimization?.sizes,
    comparisonVersion,
    urlFor: route => url_for.call(hexo, route),
  };
  return addPhotoComparisons(rewriteImages(html, manifest, options), comparisons, manifest, options);
});
