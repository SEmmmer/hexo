const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const cheerio = require('cheerio');
const { localRoute, optimizeImage, rewriteImages } = require('../tools/image-optimizer.cjs');

async function workspace(t) {
  const testRoot = path.resolve(__dirname, '..', '.cache', 'image-tests');
  await fs.mkdir(testRoot, { recursive: true });
  const directory = await fs.mkdtemp(path.join(testRoot, 'run-'));
  t.after(async () => {
    const resolved = await fs.realpath(directory);
    const relative = path.relative(await fs.realpath(testRoot), resolved);
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    await fs.rm(resolved, { recursive: true, force: true, maxRetries: 3 });
  });
  return directory;
}

test('orientation, aspect ratio, original preservation, and no enlargement', async t => {
  const directory = await workspace(t);
  const source = path.join(directory, 'portrait.jpg');
  await sharp({ create: { width: 40, height: 20, channels: 3, background: '#a43b11' } })
    .withMetadata({ orientation: 6 }).jpeg().toFile(source);
  const original = await fs.readFile(source);
  const result = await optimizeImage(source, path.join(directory, 'cache'), { widths: [16, 32, 64], effort: 0 });
  assert.equal(result.width, 20);
  assert.equal(result.height, 40);
  assert.deepEqual(result.variants.map(v => v.width), [16, 20]);
  for (const variant of result.variants) {
    const image = await sharp(await fs.readFile(variant.file)).metadata();
    assert.equal(image.format, 'webp');
    assert.equal(image.width, variant.width);
    assert.equal(image.height, variant.width * 2);
    assert.ok(!image.orientation);
  }
  assert.deepEqual(await fs.readFile(source), original);
});

test('PNG chart pixels remain lossless at original size; cache updates with content and settings', async t => {
  const directory = await workspace(t);
  const source = path.join(directory, 'chart.png');
  const cache = path.join(directory, 'cache');
  const pixels = Buffer.from(Array.from({ length: 31 * 17 * 3 }, (_, i) => i % 251));
  await sharp(pixels, { raw: { width: 31, height: 17, channels: 3 } }).png().toFile(source);
  const options = { widths: [16, 64], effort: 0 };
  const first = await optimizeImage(source, cache, options);
  const full = first.variants.at(-1);
  assert.deepEqual(await sharp(await fs.readFile(full.file)).raw().toBuffer(), pixels);
  const before = (await fs.stat(full.file)).mtimeMs;
  const second = await optimizeImage(source, cache, options);
  assert.equal(second.variants.at(-1).path, full.path);
  assert.equal((await fs.stat(full.file)).mtimeMs, before);
  const differentSettings = await optimizeImage(source, cache, { ...options, widths: [12, 64] });
  assert.notEqual(differentSettings.variants.at(-1).path, full.path);
  pixels[0] = 255;
  await sharp(pixels, { raw: { width: 31, height: 17, channels: 3 } }).png().toFile(source);
  const updated = await optimizeImage(source, cache, options);
  assert.notEqual(updated.variants.at(-1).path, full.path);
});

test('image routes work locally and under /hexo/ without reading remote URLs or escaping paths', () => {
  assert.equal(localRoute('/hexo/downloads/鸟.jpg', 'https://example.com/hexo', '/hexo/'), 'downloads/鸟.jpg');
  assert.equal(localRoute('/downloads/photo.jpg', 'http://localhost:4000', '/'), 'downloads/photo.jpg');
  assert.equal(localRoute('https://elsewhere.test/photo.jpg', 'https://example.com/hexo', '/hexo/'), null);
  assert.equal(localRoute('data:image/png;base64,abc', 'https://example.com', '/'), null);
  assert.equal(localRoute('/%2e%2e%2fprivate.jpg', 'https://example.com', '/'), null);
  assert.equal(localRoute('/downloads/%FF.jpg', 'https://example.com', '/'), null);
});

const info = {
  width: 2000, height: 1333,
  variants: [480, 800, 1280, 1920].map(width => ({ width, path: `images/optimized/photo-${width}.webp` })),
};
const manifest = new Map([['downloads/photo.jpg', info]]);
const options = {
  siteUrl: 'https://example.com/hexo', root: '/hexo/',
  urlFor: route => `/hexo/${route}`,
};
const page = content => `<!doctype html><html><head><title>Example</title></head><body>${content}</body></html>`;

test('article hero is eager, other images lazy; original opens only through its link', () => {
  const html = page('<article><div class="article-entry"><p><img src="/hexo/downloads/photo.jpg" alt="Bird &amp; lake"></p><p><img src="/hexo/downloads/photo.jpg" alt="Second"></p></div></article>');
  const output = rewriteImages(html, manifest, options);
  const $ = cheerio.load(output);
  const images = $('.article-entry img');
  assert.equal(images.first().attr('loading'), 'eager');
  assert.equal(images.first().attr('fetchpriority'), 'high');
  assert.equal(images.last().attr('loading'), 'lazy');
  assert.equal(images.last().attr('fetchpriority'), 'auto');
  assert.equal(images.first().attr('src'), '/hexo/images/optimized/photo-1280.webp');
  assert.match(images.first().attr('srcset'), /photo-480.webp 480w/);
  assert.equal(images.first().attr('width'), '2000');
  assert.equal(images.first().attr('height'), '1333');
  assert.equal(images.first().attr('alt'), 'Bird & lake');
  assert.equal(images.first().parent().attr('href'), '/hexo/downloads/photo.jpg');
  assert.equal($('link[rel="preload"]').length, 0);
  const again = cheerio.load(rewriteImages(output, manifest, options));
  assert.equal(again('.caption').length, 2);
  assert.equal(again('a a').length, 0);
});

test('below-fold homepage photos stay lazy; custom links and responsive markup remain intact', () => {
  const html = page('<article><div class="article-entry">Text-only lead article</div></article><article><div class="article-entry"><a href="/manual/"><img src="/hexo/downloads/photo.jpg" alt="Bird"></a><picture><img src="/hexo/downloads/photo.jpg"></picture><img src="/hexo/downloads/photo.jpg" srcset="custom.webp 800w"></div></article>');
  const $ = cheerio.load(rewriteImages(html, manifest, options));
  const image = $('a img');
  assert.equal(image.attr('loading'), 'lazy');
  assert.equal(image.attr('fetchpriority'), 'auto');
  assert.equal(image.parent().attr('href'), '/manual/');
  assert.equal($('picture img').attr('src'), '/hexo/downloads/photo.jpg');
  assert.equal($('img[srcset="custom.webp 800w"]').length, 1);
  const local = cheerio.load(rewriteImages(page('<article><div class="article-entry"><img src="/downloads/photo.jpg"></div></article>'), manifest, {
    siteUrl: 'http://localhost:4000', root: '/', urlFor: route => `/${route}`,
  }));
  assert.equal(local('img').attr('src'), '/images/optimized/photo-1280.webp');
  assert.equal(local('a').attr('href'), '/downloads/photo.jpg');
});
