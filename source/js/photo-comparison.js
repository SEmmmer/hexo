(() => {
  const attributes = ['src', 'srcset', 'sizes', 'width', 'height', 'alt', 'data-original-src'];
  const restore = (element, name, value) => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  };
  document.querySelectorAll('.photo-comparison[data-comparison-src]').forEach(figure => {
    const photo = figure.querySelector('img');
    const link = photo.parentElement;
    const button = figure.querySelector('.photo-toggle');
    const state = figure.querySelector('.photo-state');
    const exposure = figure.querySelector('.photo-exposure');
    const edited = {
      attributes: Object.fromEntries(attributes.map(name => [name, photo.getAttribute(name)])),
      href: link.getAttribute('href'), caption: link.getAttribute('data-caption'),
      exposure: exposure.innerHTML, exposureTitle: exposure.getAttribute('title'), state: state.textContent,
    };
    const data = figure.dataset;
    let ready = false;
    let showingOriginal = false;
    button.hidden = false;

    button.addEventListener('click', async () => {
      if (button.disabled) return;
      const nextIsOriginal = !showingOriginal;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      try {
        if (nextIsOriginal && !ready) {
          state.textContent = '正在加载原始画面…';
          button.textContent = '加载中…';
          // Do not request any comparison image until the reader asks for it.
          // Match the visible image's sizes/srcset so mobile loads the small WebP.
          await new Promise((resolve, reject) => {
            const pending = new Image();
            pending.onload = resolve;
            pending.onerror = reject;
            pending.sizes = data.comparisonSizes;
            pending.srcset = data.comparisonSrcset;
            pending.src = data.comparisonSrc;
          });
          ready = true;
        }
        if (nextIsOriginal) {
          photo.setAttribute('width', data.comparisonWidth);
          photo.setAttribute('height', data.comparisonHeight);
          photo.setAttribute('sizes', data.comparisonSizes);
          photo.setAttribute('srcset', data.comparisonSrcset);
          photo.setAttribute('src', data.comparisonSrc);
          photo.setAttribute('alt', data.comparisonAlt);
          photo.setAttribute('data-original-src', data.comparisonOriginal);
          link.setAttribute('href', data.comparisonOriginal);
          link.setAttribute('data-caption', data.comparisonAlt);
          state.textContent = data.comparisonLabel;
          exposure.textContent = exposure.textContent.replace(/\s*\((?:cropped to[^)]*|uncropped)\)/, '');
          exposure.title = '镜头实际焦距与拍摄参数；裁切后视角标注仅在成片视图显示。';
        } else {
          for (const [name, value] of Object.entries(edited.attributes)) restore(photo, name, value);
          restore(link, 'href', edited.href);
          restore(link, 'data-caption', edited.caption);
          state.textContent = edited.state;
          exposure.innerHTML = edited.exposure;
          restore(exposure, 'title', edited.exposureTitle);
        }
        // Fancybox 3 caches data attributes in jQuery; update that cache too.
        if (window.jQuery) window.jQuery(link).data('caption', photo.alt);
        showingOriginal = nextIsOriginal;
        button.setAttribute('aria-pressed', String(showingOriginal));
        button.textContent = showingOriginal ? '返回成片' : data.comparisonButton;
        requestAnimationFrame(() => {
          const bounds = button.getBoundingClientRect();
          if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
            photo.scrollIntoView({ block: 'start', behavior: 'instant' });
          }
        });
      } catch {
        state.textContent = '原始画面加载失败，当前仍为成片。请重试。';
        button.textContent = '重试加载';
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    });
  });
})();
