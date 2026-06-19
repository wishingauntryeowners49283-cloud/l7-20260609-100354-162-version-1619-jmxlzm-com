(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var toggle = one('[data-menu-toggle]');
    var nav = one('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var carousel = one('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = all('[data-hero-slide]', carousel);
    var dots = all('[data-hero-dot]', carousel);
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function setupFilters() {
    var form = one('[data-filter-form]');
    if (!form) {
      return;
    }
    var textInput = one('[data-filter-text]', form);
    var yearInput = one('[data-filter-year]', form);
    var regionInput = one('[data-filter-region]', form);
    var typeInput = one('[data-filter-type]', form);
    var cards = all('[data-card]');
    var empty = one('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (textInput && initial) {
      textInput.value = initial;
    }
    function value(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }
    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }
    function apply() {
      var q = value(textInput);
      var year = value(yearInput);
      var region = value(regionInput);
      var type = value(typeInput);
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        var joined = textOf(card);
        if (q && joined.indexOf(q) === -1) {
          ok = false;
        }
        if (year && String(card.getAttribute('data-year')).toLowerCase() !== year) {
          ok = false;
        }
        if (region && String(card.getAttribute('data-region')).toLowerCase() !== region) {
          ok = false;
        }
        if (type && String(card.getAttribute('data-type')).toLowerCase() !== type) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }
    [textInput, yearInput, regionInput, typeInput].forEach(function (input) {
      if (!input) {
        return;
      }
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function setupPlayer() {
    var video = one('video[data-hls]');
    var trigger = one('[data-player-trigger]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-hls');
    var attached = false;
    var hls = null;
    function attach() {
      return new Promise(function (resolve) {
        if (attached) {
          resolve();
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
          setTimeout(resolve, 1800);
          return;
        }
        video.src = url;
        resolve();
      });
    }
    function play() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      attach().then(function () {
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            if (trigger) {
              trigger.classList.remove('is-hidden');
            }
          });
        }
      });
    }
    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
