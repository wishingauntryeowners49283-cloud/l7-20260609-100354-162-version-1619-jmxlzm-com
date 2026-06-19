(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.textContent = isOpen ? '×' : '☰';
      });
    }

    setupHero();
    setupSearch();
    setupPlayers();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');

    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var filterGroup = panel.querySelector('[data-filter-group]');
      var container = panel.parentElement;
      var list = container ? container.querySelector('.searchable-list') || container.querySelector('.movie-grid') || container.querySelector('.rank-list') : null;

      if (!input || !list) {
        return;
      }

      var currentFilter = '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var filter = currentFilter.toLowerCase();

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-year') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okFilter = !filter || haystack.indexOf(filter) !== -1;
          card.classList.toggle('hidden-by-filter', !(okKeyword && okFilter));
        });
      }

      input.addEventListener('input', apply);

      if (filterGroup) {
        Array.prototype.slice.call(filterGroup.querySelectorAll('button')).forEach(function (button) {
          button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter') || '';
            Array.prototype.slice.call(filterGroup.querySelectorAll('button')).forEach(function (item) {
              item.classList.toggle('active', item === button);
            });
            apply();
          });
        });
      }
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var start = shell.querySelector('.player-start');

      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      var initialized = false;
      var hls = null;

      function initialize() {
        if (initialized || !stream) {
          return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
              video.src = stream;
            }
          });
        } else {
          video.src = stream;
        }
      }

      function play() {
        initialize();
        shell.classList.add('playing');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('playing');
          });
        }
      }

      initialize();

      if (start) {
        start.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('playing');
        }
      });
    });
  }
})();
