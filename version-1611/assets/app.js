(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCardFilters(scope, forcedValue) {
    var input = scope.querySelector('[data-card-search]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var query = normalize(forcedValue || (input ? input.value : ''));
    var activeChip = scope.querySelector('.filter-chip.is-active');
    var chipValue = activeChip ? normalize(activeChip.getAttribute('data-filter')) : '全部';

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' '));
      var queryMatch = !query || haystack.indexOf(query) !== -1;
      var chipMatch = !chipValue || chipValue === '全部' || haystack.indexOf(chipValue) !== -1;
      card.style.display = queryMatch && chipMatch ? '' : 'none';
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('.filter-chip'));

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        input.value = q;
      }

      input.addEventListener('input', function () {
        applyCardFilters(scope);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        applyCardFilters(scope);
      });
    });

    applyCardFilters(scope);
  });
})();
