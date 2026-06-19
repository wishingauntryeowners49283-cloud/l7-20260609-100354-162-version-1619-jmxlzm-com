(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-text]"));
      input.addEventListener("input", function () {
        var query = norm(input.value);
        cards.forEach(function (card) {
          var text = norm(card.getAttribute("data-filter-text"));
          card.classList.toggle("hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function cardHtml(item) {
    return "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">" +
      "<div class=\"poster\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(item.type) + "</span><span class=\"play-circle\">▶</span></div>" +
      "<div class=\"movie-card-body\"><h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div></div></a>";
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-root]");
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var input = document.querySelector("[data-search-query]");
    var results = root.querySelector("[data-search-results]");
    var status = root.querySelector("[data-search-status]");
    var q = getQuery();
    if (input) {
      input.value = q;
    }

    function render(query) {
      var key = norm(query);
      var list = key ? window.SEARCH_MOVIES.filter(function (item) {
        return norm(item.text).indexOf(key) !== -1;
      }).slice(0, 120) : window.SEARCH_MOVIES.slice(0, 24);
      if (status) {
        status.textContent = key ? "搜索结果" : "热门推荐";
      }
      if (results) {
        results.innerHTML = list.map(cardHtml).join("");
      }
    }

    render(q);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  window.createMoviePlayer = function (source) {
    ready(function () {
      var video = document.querySelector("[data-movie-video]");
      var overlay = document.querySelector("[data-player-overlay]");
      if (!video || !source) {
        return;
      }
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initNav();
    initYear();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
