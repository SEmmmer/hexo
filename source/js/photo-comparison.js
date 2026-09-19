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
    // New pages reserve the layout at build time. Also upgrade cached old HTML
    // that still requests this script without an asset version.
    if (!link.parentElement.classList.contains('photo-frame')) {
      const frame = document.createElement('div');
      frame.className = 'photo-frame';
      frame.style.setProperty('--photo-ratio', `${photo.getAttribute('width')} / ${photo.getAttribute('height')}`);
      link.before(frame);
      frame.append(link);
    }
    let editedExposure = exposure.querySelector('.photo-exposure-copy');
    let rawExposure = exposure.querySelector('.photo-exposure-copy.is-inactive');
    if (!editedExposure || !rawExposure) {
      editedExposure = document.createElement('span');
      editedExposure.className = 'photo-exposure-copy';
      editedExposure.innerHTML = exposure.innerHTML;
      rawExposure = document.createElement('span');
      rawExposure.className = 'photo-exposure-copy is-inactive';
      rawExposure.textContent = exposure.textContent.replace(/\s*\((?:cropped to[^)]*|uncropped)\)/, '');
      rawExposure.setAttribute('aria-hidden', 'true');
      exposure.replaceChildren(editedExposure, rawExposure);
    }
    const edited = {
      attributes: Object.fromEntries(attributes.map(name => [name, photo.getAttribute(name)])),
      href: link.getAttribute('href'), caption: link.getAttribute('data-caption'),
      exposureTitle: exposure.getAttribute('title'), state: state.textContent,
    };
    const data = figure.dataset;
    let ready = false;
    let showingOriginal = false;
    let loading = false;
    const setState = text => { state.textContent = text; state.title = text; };
    setState(edited.state);
    button.hidden = false;

    button.addEventListener('click', async () => {
      if (loading) return;
      const nextIsOriginal = !showingOriginal;
      loading = true;
      // A native disabled button can lose keyboard focus during an async load.
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('aria-busy', 'true');
      try {
        if (nextIsOriginal && !ready) {
          setState('正在加载原始画面…');
          button.textContent = '加载中…';
          // Do not request any comparison image until the reader asks for it.
          // Match the visible image's sizes/srcset so mobile loads the small WebP.
          const pending = new Image();
          await new Promise((resolve, reject) => {
            pending.onload = resolve;
            pending.onerror = reject;
            pending.sizes = data.comparisonSizes;
            pending.srcset = data.comparisonSrcset;
            pending.src = data.comparisonSrc;
          });
          if (!pending.naturalWidth) throw new Error('Image is empty');
          if (pending.decode) await pending.decode();
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
          setState(data.comparisonLabel);
          exposure.title = '镜头实际焦距与拍摄参数；裁切后视角标注仅在成片视图显示。';
        } else {
          for (const [name, value] of Object.entries(edited.attributes)) restore(photo, name, value);
          restore(link, 'href', edited.href);
          restore(link, 'data-caption', edited.caption);
          setState(edited.state);
          restore(exposure, 'title', edited.exposureTitle);
        }
        // Both copies always participate in grid sizing, including at page end.
        editedExposure.classList.toggle('is-inactive', nextIsOriginal);
        editedExposure.setAttribute('aria-hidden', String(nextIsOriginal));
        rawExposure.classList.toggle('is-inactive', !nextIsOriginal);
        rawExposure.setAttribute('aria-hidden', String(!nextIsOriginal));
        // Fancybox 3 caches data attributes in jQuery; update that cache too.
        if (window.jQuery) window.jQuery(link).data('caption', photo.alt);
        showingOriginal = nextIsOriginal;
        button.setAttribute('aria-pressed', String(showingOriginal));
        button.textContent = showingOriginal ? '返回成片' : data.comparisonButton;
      } catch {
        setState('原始画面加载失败，当前仍为成片。请重试。');
        button.textContent = '重试加载';
      } finally {
        loading = false;
        button.removeAttribute('aria-disabled');
        button.removeAttribute('aria-busy');
      }
    });
  });
})();
