const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');

const root = path.resolve(__dirname, '..');
const reports = path.resolve(root, '..', '观鸟小结', 'reports');
const dataPath = path.join(root, 'source', '_data', 'photo_comparisons.json');
const articles = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : {};
const months = [...new Set(process.argv.slice(2))];
if (!months.length) throw new Error('请指定月份，例如：npm run import:birdwatching -- 2026-06 2026-07');
const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = new Map();
const writes = new Map();
const read = file => {
  const bytes = fs.readFileSync(file);
  sources.set(file, hash(bytes));
  return bytes;
};

for (const month of months) {
  assert.match(month, /^\d{4}-(?:0[1-9]|1[0-2])$/);
  const number = Number(month.slice(5));
  const slug = `birdwatching-${monthNames[number - 1]}-${month.slice(0, 4)}`;
  const postPath = path.join(root, 'source', '_posts', `${slug}.md`);
  assert.ok(fs.existsSync(postPath), `请先创建文章并设定发布日期：${postPath}`);
  const current = read(postPath).toString('utf8').replace(/\r\n/g, '\n');
  const frontmatter = current.match(/^---\n[\s\S]*?\n---\n/)[0];
  const date = frontmatter.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)[1];
  const directory = path.join(reports, month);
  const articleManifestPath = path.join(directory, 'manifest.json');
  const active = fs.existsSync(articleManifestPath) ? JSON.parse(read(articleManifestPath)).active_documents || {} : {};
  const documentName = (kind, candidates) => {
    const name = active[kind] || candidates.find(candidate => fs.existsSync(path.join(directory, candidate)));
    assert.ok(typeof name === 'string' && !path.isAbsolute(name) && !name.includes('\\') && !name.split('/').includes('..'), `${month}: 缺少或无效的 ${kind} 原稿路径`);
    assert.ok(fs.existsSync(path.join(directory, name)), `${month}: 当前 ${kind} 原稿不存在：${name}`);
    return name;
  };
  const markdownName = documentName('markdown', ['blog-v3.md', 'blog-v2.md', 'blog.md']);
  const htmlName = documentName('html', ['blog-v3.html', 'blog.html']);
  const markdown = read(path.join(directory, markdownName)).toString('utf8').replace(/\r\n/g, '\n');
  const html = read(path.join(directory, htmlName)).toString('utf8');
  const manifest = JSON.parse(read(path.join(directory, 'raw-preview-manifest.json')));
  const $ = cheerio.load(html);
  const images = [...markdown.matchAll(/!\[[^\]]*\]\(([^\s)]+)\)/g)];
  const figures = $('figure').toArray();
  assert.ok(figures.length && figures.every(element => $(element).find('.photo-toggle').length), `${month}: 阅读版缺少原片对照功能`);
  assert.equal(images.length, figures.length, `${month}: Markdown 与 v3 照片数量不一致`);
  const route = relative => `downloads/${slug}/${relative}`;
  const copy = relative => {
    assert.ok(relative && !path.isAbsolute(relative) && !relative.includes('\\') && !relative.split('/').includes('..'));
    assert.match(relative, /\.(?:jpe?g|png)$/i, '只导入已引用的浏览图片');
    const bytes = read(path.join(directory, relative));
    writes.set(path.join(root, 'source', route(relative)), bytes);
    return bytes;
  };
  const photos = figures.map((element, index) => {
    const figure = $(element);
    const image = images[index][1];
    assert.equal(image, figure.find('img').attr('src'), `${month}: 成片路径与 v3 不一致`);
    copy(image);
    const comparison = figure.attr('data-original-src') || null;
    const record = manifest.items.find(item => item.id === figure.attr('id'));
    assert.ok(record, `${month}: 缺少原片来源记录`);
    assert.equal(comparison, record.relative_path || record.preview_relative_path || null);
    if (comparison) assert.equal(hash(copy(comparison)), record.sha256, `${month}: 原片校验失败`);
    return {
      id: figure.attr('id'), image: route(image), comparison: comparison ? route(comparison) : null,
      status: record.status, sha256: comparison ? record.sha256 : null,
      alt: figure.attr('data-original-alt') || null, label: figure.attr('data-original-label') || null,
      button: figure.find('.photo-toggle').text(), state: figure.find('.photo-state').text(),
    };
  });
  let body = markdown.replace(/^# [^\n]+\n+/, '').trim();
  body = body.replace(/(!\[[^\]]*\]\()([^\s)]+)(\))/g, (_, start, image, end) => `${start}/${route(image)}${end}`);
  const articleRoute = `${date.replaceAll('-', '/')}/${slug}/`;
  // The standalone reading-version link now points to this published article.
  body = body.replace(/^\[([^\]\n]+)\]\(([^\s)]+)\)$/gm, (match, label, target) =>
    target === htmlName ? `<p>{% post_link ${slug} ${JSON.stringify(label)} %}</p>` : match);
  const nextImage = [...body.matchAll(/!\[[^\]]*\]\([^\s)]+\)/g)][1];
  if (nextImage && !body.includes('<!-- more -->')) body = `${body.slice(0, nextImage.index).trimEnd()}\n\n<!-- more -->\n\n${body.slice(nextImage.index)}`;
  writes.set(postPath, `${frontmatter}\n${body}\n`);
  articles[slug] = {
    version: 'v3', markdown: markdownName, html: htmlName, month, label: `${number} 月`,
    route: articleRoute, photos,
    note: `${$('.raw-note').text()} 网页展示图经过等比例缩小和压缩，点击图片可查看完整 JPEG。`,
  };
  console.log(`${month}: ${markdownName} + ${htmlName}，${photos.length} 张成片，${photos.filter(photo => photo.comparison).length} 张对照图，发布日期 ${date}`);
}

// Check every source again before applying this import, including current post metadata.
for (const [file, digest] of sources) assert.equal(hash(fs.readFileSync(file)), digest, `导入时原稿发生变化：${file}`);
writes.set(dataPath, `${JSON.stringify(articles, null, 2)}\n`);
for (const [file, content] of writes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file) || !fs.readFileSync(file).equals(Buffer.from(content))) fs.writeFileSync(file, content);
}
fs.mkdirSync(path.join(root, '.cache'), { recursive: true });
fs.writeFileSync(path.join(root, '.cache', 'birdwatching-import.json'), JSON.stringify(
  [...sources].map(([file, digest]) => [file, writes.has(file) ? hash(Buffer.from(writes.get(file))) : digest]), null, 2));
