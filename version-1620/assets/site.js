(function () {
  var searchList = window.SearchMovies || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(itemIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function buildSearchItem(movie) {
    return [
      '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
      '<span>',
      '<span class="search-result-title">' + escapeHtml(movie.title) + '</span>',
      '<span class="search-result-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function setupHeaderSearch() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    boxes.forEach(function (box) {
      var input = box.querySelector('input');
      var button = box.querySelector('button');
      var popover = box.querySelector('[data-search-popover]');
      if (!input || !popover) {
        return;
      }

      function search() {
        var value = normalize(input.value);
        if (value.length < 1) {
          popover.classList.remove('is-open');
          popover.innerHTML = '';
          return;
        }
        var results = searchList.filter(function (movie) {
          return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.type + ' ' + movie.category).indexOf(value) !== -1;
        }).slice(0, 10);
        if (!results.length) {
          popover.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        } else {
          popover.innerHTML = results.map(buildSearchItem).join('');
        }
        popover.classList.add('is-open');
      }

      function go() {
        var value = input.value.trim();
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      }

      input.addEventListener('input', search);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          go();
        }
      });
      if (button) {
        button.addEventListener('click', go);
      }
      document.addEventListener('click', function (event) {
        if (!box.contains(event.target)) {
          popover.classList.remove('is-open');
        }
      });
    });
  }

  function setupQuickSearch() {
    var form = document.querySelector('[data-quick-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  }

  function setupLocalFilters() {
    var container = document.querySelector('[data-filter-area]');
    if (!container) {
      return;
    }
    var input = container.querySelector('[data-filter-input]');
    var yearSelect = container.querySelector('[data-filter-year]');
    var genreSelect = container.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-type'));
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passYear = !year || card.getAttribute('data-year') === year;
        var passGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(normalize(genre)) !== -1;
        card.style.display = passKeyword && passYear && passGenre ? '' : 'none';
      });
    }

    [input, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function movieCardHtml(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
      '<span class="movie-type">' + escapeHtml(movie.type) + '</span>',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
      '</a>',
      '<div class="movie-info">',
      '<h2 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>·</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<p class="movie-desc">' + escapeHtml(movie.genre) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    if (!mount) {
      return;
    }
    var input = document.querySelector('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render() {
      var value = normalize(input ? input.value : initial);
      if (!value) {
        mount.innerHTML = searchList.slice(0, 48).map(movieCardHtml).join('');
        return;
      }
      var results = searchList.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.type + ' ' + movie.category).indexOf(value) !== -1;
      }).slice(0, 120);
      if (!results.length) {
        mount.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
      } else {
        mount.innerHTML = results.map(movieCardHtml).join('');
      }
    }

    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var poster = shell.querySelector('.player-poster');
      var button = shell.querySelector('.play-button');
      var configNode = shell.querySelector('.player-config');
      if (!video || !configNode) {
        return;
      }
      var playlistUrl = '';
      try {
        playlistUrl = JSON.parse(configNode.textContent).url || '';
      } catch (error) {
        playlistUrl = '';
      }
      var hlsInstance = null;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function start() {
        if (!playlistUrl) {
          return;
        }
        if (shell.classList.contains('is-ready')) {
          playVideo();
          return;
        }
        shell.classList.add('is-ready');
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playlistUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(playlistUrl);
          hlsInstance.attachMedia(video);
          var parsedEvent = window.Hls.Events && window.Hls.Events.MANIFEST_PARSED;
          if (parsedEvent) {
            hlsInstance.on(parsedEvent, playVideo);
          } else {
            video.addEventListener('loadedmetadata', playVideo, { once: true });
          }
          return;
        }
        video.src = playlistUrl;
        video.load();
        playVideo();
      }

      if (poster) {
        poster.addEventListener('click', start);
      }
      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!shell.classList.contains('is-ready')) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupQuickSearch();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
