const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const { rewriteImages } = require('../tools/image-optimizer.cjs');
const { addPhotoComparisons } = require('../tools/photo-comparisons.cjs');

const photo = {
  id: 'B01', image: 'downloads/edited.jpg', comparison: 'downloads/raw/embedded.jpg',
  alt: 'NEF 完整画幅', label: '原片 · NEF 内嵌 JPEG', button: '查看原片', state: '成片',
};
const article = { label: '7 月', route: '2026/08/01/july/', photos: [photo], note: '来源说明' };
const imageInfo = (name, width, height) => ({ width, height, variants: [480, 800, 1280, 1920].map(size => ({ width: size, path: `images/optimized/${name}-${size}.webp` })) });
const manifest = new Map([
  [photo.image, imageInfo('edited', 1333, 2000)],
  [photo.comparison, imageInfo('raw', 8256, 5504)],
]);
const options = { siteUrl: 'https://example.test/hexo/', root: '/hexo/', urlFor: route => `/hexo/${route}` };
const page = contents => `<!doctype html><html><head><title>Test</title></head><body>${contents}</body></html>`;
const block = (slug, image = photo.image) => `<article id="post-${slug}"><div class="article-entry"><p><img src="/${image}" alt="最新 Markdown 描述"></p><p style="text-align:center">500 mm (cropped to 2494 mm) · ISO 5000</p><p><em>原稿图注</em></p></div></article>`;
const render = (html, articles, opts = options) => addPhotoComparisons(rewriteImages(html, manifest, opts), articles, manifest, opts);

test('v3 keeps Markdown text, optimized edited photo, and on-demand full-frame comparison', () => {
  const output = render(page(block('july')), { july: article });
  const $ = cheerio.load(output);
  const figure = $('.photo-comparison');
  assert.equal(figure.length, 1);
  assert.equal(figure.find('img').attr('alt'), '最新 Markdown 描述');
  assert.equal(figure.find('img').attr('width'), '1333');
  assert.equal(figure.find('img').attr('height'), '2000');
  assert.equal(figure.find('a').first().attr('href'), '/hexo/downloads/edited.jpg');
  assert.equal(figure.attr('data-comparison-width'), '8256');
  assert.equal(figure.attr('data-comparison-height'), '5504');
  assert.match(figure.attr('data-comparison-srcset'), /raw-480.webp 480w/);
  assert.equal(figure.attr('data-comparison-original'), '/hexo/downloads/raw/embedded.jpg');
  assert.equal($('img').length, 1, 'No hidden original image should start downloading');
  assert.equal($('link[rel="preload"]').length, 0);
  assert.equal($('.photo-exposure').text(), '500 mm (cropped to 2494 mm) · ISO 5000');
  assert.equal($('.photo-caption em').text(), '原稿图注');
  assert.equal($('.photo-toggle').attr('hidden'), 'hidden');
  assert.equal($('.photo-toggle').attr('aria-controls'), figure.find('img').attr('id'));
  assert.equal($('.photo-month-nav a').attr('href'), '/hexo/2026/08/01/july/');
  assert.equal($('.photo-raw-note').text(), '来源说明');
  assert.equal($('script[src="/hexo/js/photo-comparison.js"]').length, 1);
  assert.equal(addPhotoComparisons(output, { july: article }, manifest, options), output, 'Repeated rendering is idempotent');
});

test('home excerpts keep lazy loading and unique controls, with no full-article footer', () => {
  const articles = Object.fromEntries(['june', 'july'].map(slug => [slug, { ...article, photos: [photo, { ...photo, id: 'B02', image: 'downloads/absent.jpg' }] }]));
  const $ = cheerio.load(render(page('<article><div class="article-entry">Text first</div></article>' + block('june') + block('july')), articles));
  assert.equal($('.photo-comparison').length, 2);
  assert.equal(new Set($('[id]').map((_, el) => $(el).attr('id')).get()).size, $('[id]').length);
  assert.ok($('img').toArray().every(el => $(el).attr('loading') === 'lazy'));
  assert.equal($('.photo-month-nav,.photo-raw-note').length, 0);
  assert.equal($('script[src="/hexo/js/photo-comparison.js"]').length, 1);
});

test('missing originals stay explicit and disabled; localhost paths have no /hexo prefix', () => {
  const missing = { ...article, photos: [{ ...photo, comparison: null, button: '原片暂缺', state: '尚未找到对应 NEF' }] };
  const local = { siteUrl: 'http://localhost:4000/', root: '/', urlFor: route => `/${route}` };
  const $ = cheerio.load(render(page(block('july')), { july: missing }, local));
  assert.equal($('.photo-toggle').text(), '原片暂缺');
  assert.equal($('.photo-toggle').attr('disabled'), 'disabled');
  assert.equal($('.photo-toggle').attr('hidden'), undefined);
  assert.equal($('.photo-state').text(), '尚未找到对应 NEF');
  assert.equal($('.photo-comparison').attr('data-comparison-src'), undefined);
  assert.equal($('script[src="/js/photo-comparison.js"]').length, 1);
  assert.equal($('img').attr('src'), '/images/optimized/edited-1280.webp');
});

test('fail the build when comparison assets or the Markdown association are missing', () => {
  assert.throws(() => addPhotoComparisons(rewriteImages(page(block('july')), manifest, options), { july: article }, new Map(), options), /Missing optimized comparison/);
  const broken = page(block('july').replace('<p><em>原稿图注</em></p>', ''));
  assert.throws(() => render(broken, { july: article }), /Cannot match Markdown/);
});
