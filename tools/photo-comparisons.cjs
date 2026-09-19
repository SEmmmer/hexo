const cheerio = require('cheerio');
const { localRoute, DEFAULTS } = require('./image-optimizer.cjs');

// Enhance the current Markdown output with the v3 comparison metadata.
// Keeping the two separate prevents an older HTML preview from replacing prose.
function addPhotoComparisons(html, articles, manifest, options) {
  if (typeof html !== 'string' || !/<html[\s>]/i.test(html) || !html.includes('article-entry')) return html;
  const $ = cheerio.load(html);
  let changed = false;
  for (const [slug, article] of Object.entries(articles)) {
    const entry = $(`#post-${slug} .article-entry`);
    if (!entry.length || entry.find('.photo-comparison').length) continue;
    let count = 0;
    for (const photo of article.photos) {
      const image = entry.find('img').filter((_, element) => {
        const src = $(element).attr('data-original-src') || $(element).attr('src');
        return localRoute(src, options.siteUrl, options.root) === photo.image;
      }).first();
      if (!image.length) continue; // Home page excerpts only contain the first photo.
      const paragraph = image.closest('p');
      const exposure = paragraph.next('p');
      const caption = exposure.next('p');
      if (!paragraph.length || !exposure.length || !caption.length || !caption.find('em').length) {
        throw new Error(`Cannot match Markdown photo/parameters/caption: ${slug}/${photo.id}`);
      }
      const id = `${slug}-${photo.id}`;
      const figure = $('<figure></figure>').addClass('photo-comparison').attr('id', id);
      image.attr('id', `${id}-image`);
      const link = image.parent('a');
      if (!link.length) throw new Error(`Missing optimized photo link: ${slug}/${photo.id}`);
      link.attr('data-fancybox', slug);
      const tools = $('<div></div>').addClass('photo-tools');
      tools.append($('<p></p>').addClass('photo-state').attr({ id: `${id}-state`, 'aria-live': 'polite' }).text(photo.state));
      const button = $('<button></button>').addClass('photo-toggle').attr({
        type: 'button', 'aria-controls': `${id}-image`, 'aria-describedby': `${id}-state`, 'aria-pressed': 'false',
      }).text(photo.button);
      if (photo.comparison) {
        const info = manifest.get(photo.comparison);
        if (!info) throw new Error(`Missing optimized comparison: ${photo.comparison}`);
        const fallback = info.variants.find(variant => variant.width >= 1280) || info.variants.at(-1);
        figure.attr({
          'data-comparison-src': options.urlFor(fallback.path),
          'data-comparison-srcset': info.variants.map(variant => `${options.urlFor(variant.path)} ${variant.width}w`).join(', '),
          'data-comparison-sizes': options.sizes || DEFAULTS.sizes,
          'data-comparison-width': String(info.width), 'data-comparison-height': String(info.height),
          'data-comparison-original': options.urlFor(photo.comparison),
          'data-comparison-alt': photo.alt, 'data-comparison-label': photo.label,
          'data-comparison-button': photo.button,
        });
        button.attr('hidden', '');
      } else {
        button.attr('disabled', '');
      }
      tools.append(button);
      const figcaption = $('<figcaption></figcaption>').append(tools);
      if (photo.comparison) {
        const fallback = $('<noscript></noscript>');
        fallback.append($('<p></p>').append($('<a></a>').attr('href', options.urlFor(photo.comparison)).text(photo.button)));
        figcaption.append(fallback);
      }
      // Move the actual Markdown nodes, preserving the author's wording/styles.
      paragraph.before(figure);
      if (photo.comparison) {
        const frame = $('<div></div>').addClass('photo-frame').attr('style', `--photo-ratio: ${image.attr('width')} / ${image.attr('height')}`);
        figure.append(frame.append(link));
        const editedExposure = $('<span></span>').addClass('photo-exposure-copy').html(exposure.html());
        const rawExposure = $('<span></span>').addClass('photo-exposure-copy is-inactive').attr('aria-hidden', 'true')
          .text(exposure.text().replace(/\s*\((?:cropped to[^)]*|uncropped)\)/, ''));
        exposure.empty().append(editedExposure, rawExposure);
      } else {
        figure.append(link);
      }
      figcaption.append(exposure.addClass('photo-exposure'), caption.addClass('photo-caption'));
      figure.append(figcaption);
      paragraph.remove();
      count++;
      changed = true;
    }
    if (count === article.photos.length) {
      const nav = $('<nav></nav>').addClass('photo-month-nav').attr('aria-label', '观鸟小结月份');
      for (const [otherSlug, other] of Object.entries(articles)) {
        const link = $('<a></a>').attr('href', options.urlFor(other.route)).text(other.label);
        if (otherSlug === slug) link.attr('aria-current', 'page');
        nav.append(link);
      }
      entry.prepend(nav);
      entry.append($('<p></p>').addClass('photo-raw-note').text(article.note));
    }
  }
  if (!changed) return html;
  const version = options.comparisonVersion ? `?v=${options.comparisonVersion}` : '';
  $('head').append($('<link>').attr({ rel: 'stylesheet', href: options.urlFor('css/photo-comparison.css') + version }));
  $('body').append($('<script></script>').attr({ src: options.urlFor('js/photo-comparison.js') + version, defer: '' }));
  return $.html();
}

module.exports = { addPhotoComparisons };
