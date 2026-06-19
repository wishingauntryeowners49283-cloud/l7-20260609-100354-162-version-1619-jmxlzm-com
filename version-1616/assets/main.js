(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    }, { once: true });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var searchGrid = document.querySelector('[data-search-results]');
  if (searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('[data-search-input]');
    var status = document.querySelector('[data-search-status]');
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('[data-search-card]'));

    if (input) {
      input.value = query;
    }

    function applyFilter(value) {
      var keyword = value.trim().toLowerCase();
      var matched = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search-text') || '';
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          matched += 1;
        }
      });
      if (status) {
        status.textContent = keyword ? '搜索结果：' + matched + ' 部相关影片' : '片库内容';
      }
    }

    applyFilter(query);

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }
  }
})();
