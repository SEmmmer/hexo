const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const sharp = require('sharp');
const cheerio = require('cheerio');

const DEFAULTS = {
  widths: [480, 800, 1280, 1920],
  quality: 86,
  effort: 5,
  sizes: '(min-width: 1240px) 855px, (min-width: 768px) calc(73.33vw - 70px), calc(100vw - 80px)',
};

// Return a route within this site; never fetch external image URLs.
function localRoute(src, siteUrl, root) {
  if (!src || /^(?:data|blob):/i.test(src)) return null;
  const site = new URL(siteUrl);
  let url;
  try {
    url = new URL(src, site.href.endsWith('/') ? site.href : `${site.href}/`);
  } catch {
    return null;
  }
  if (url.origin !== site.origin || !/^https?:$/.test(url.protocol)) return null;
  let route;
  try {
    route = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  const prefix = `/${root.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
  if (prefix !== '/' && route.startsWith(prefix)) route = route.slice(prefix.length);
  route = route.replace(/^\/+/, '');
  if (route.split('/').some(part => part === '..') || route.includes('\\')) return null;
  return route;
}

async function optimizeImage(source, cacheDir, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const original = await fs.readFile(source);
  const metadata = await sharp(original).metadata();
  if (!['jpeg', 'png'].includes(metadata.format) || metadata.pages > 1) return null;
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const maximum = Math.min(Math.max(...settings.widths), width);
  const widths = [...new Set([...settings.widths.filter(value => value < maximum * 0.95), maximum])];
  const encoding = metadata.format === 'png'
    ? { lossless: true, effort: settings.effort }
    : { quality: settings.quality, effort: settings.effort, smartSubsample: true };
  const digest = createHash('sha256').update(original)
    .update(JSON.stringify({ version: 1, widths, encoding, sharp: sharp.versions }))
    .digest('hex').slice(0, 20);
  await fs.mkdir(cacheDir, { recursive: true });
  const variants = [];
  for (const targetWidth of widths) {
    const filename = `${digest}-${targetWidth}.webp`;
    const file = path.join(cacheDir, filename);
    let bytes;
    try {
      bytes = (await fs.stat(file)).size;
      if (!bytes) throw new Error('Empty image cache');
    } catch {
      const output = await sharp(original).autoOrient()
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp(encoding).toBuffer();
      const temporary = `${file}.${randomUUID()}.tmp`;
      await fs.writeFile(temporary, output);
      await fs.rename(temporary, file);
      bytes = output.length;
    }
    variants.push({ width: targetWidth, path: `images/optimized/${filename}`, file, bytes });
  }
  return { width, height, originalBytes: original.length, variants };
}

function rewriteImages(html, manifest, options) {
  // Only process complete pages, after Hexo has added its theme and site root.
  if (typeof html !== 'string' || !/<html[\s>]/i.test(html) || !html.includes('article-entry')) return html;
  const $ = cheerio.load(html);
  const firstImage = $('article').first().find('.article-entry img').get(0);
  let changed = false;
  $('.article-entry img').each((_, element) => {
    const img = $(element);
    if (img.closest('picture').length || (img.attr('srcset') && !img.attr('data-original-src'))) return;
    const originalSrc = img.attr('data-original-src') || img.attr('src');
    const route = localRoute(originalSrc, options.siteUrl, options.root);
    const info = manifest.get(route);
    if (!info) return;
    const fallback = info.variants.find(variant => variant.width >= 1280) || info.variants.at(-1);
    const originalUrl = options.urlFor(route);
    img.attr({
      src: options.urlFor(fallback.path),
      srcset: info.variants.map(variant => `${options.urlFor(variant.path)} ${variant.width}w`).join(', '),
      sizes: options.sizes || DEFAULTS.sizes,
      width: String(info.width),
      height: String(info.height),
      loading: element === firstImage ? 'eager' : 'lazy',
      fetchpriority: element === firstImage ? 'high' : 'auto',
      decoding: 'async',
      'data-original-src': originalUrl,
    });
    // Landscape normally links img.src. Link the original instead, and keep
    // its existing caption/lightbox behavior without fetching originals early.
    if (!img.parent().is('a')) {
      const alt = img.attr('alt') || '';
      img.wrap($('<a></a>').addClass('fancybox').attr({
        href: originalUrl,
        'data-fancybox': 'gallery',
        'data-caption': alt,
      }));
      if (alt) img.parent().after($('<span></span>').addClass('caption').text(alt));
    }
    changed = true;
  });
  return changed ? $.html() : html;
}

module.exports = { DEFAULTS, localRoute, optimizeImage, rewriteImages };
