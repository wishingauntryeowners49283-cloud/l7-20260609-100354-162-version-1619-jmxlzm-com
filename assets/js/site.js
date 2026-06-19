(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var mobile = document.querySelector('.mobile-nav');
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = mobile.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(index);
                start();
            });
        });
        start();
    }

    function textOf(card, name) {
        return (card.getAttribute(name) || '').toLowerCase();
    }

    function setupFilters() {
        var input = document.getElementById('movieSearch');
        var year = document.getElementById('yearFilter');
        var region = document.getElementById('regionFilter');
        var type = document.getElementById('typeFilter');
        var scope = document.querySelector('[data-filter-scope]');
        var resultCount = document.getElementById('resultCount');
        var empty = document.querySelector('[data-empty-state]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function matches(card) {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var haystack = [
                textOf(card, 'data-title'),
                textOf(card, 'data-year'),
                textOf(card, 'data-region'),
                textOf(card, 'data-type'),
                textOf(card, 'data-genre'),
                textOf(card, 'data-tags')
            ].join(' ');
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                return false;
            }
            if (regionValue && card.getAttribute('data-region') !== regionValue) {
                return false;
            }
            if (typeValue && card.getAttribute('data-type') !== typeValue) {
                return false;
            }
            return true;
        }

        function apply() {
            var count = 0;
            cards.forEach(function (card) {
                var visible = matches(card);
                card.hidden = !visible;
                if (visible) {
                    count += 1;
                }
            });
            if (resultCount) {
                resultCount.textContent = String(count);
            }
            if (empty) {
                empty.classList.toggle('is-visible', count === 0);
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupHomeSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-home-search]'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = './search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    window.attachMoviePlayer = function (src) {
        var shell = document.querySelector('.player-shell');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        if (!video || !overlay) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                video.play().catch(function () {});
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            overlay.classList.add('is-hidden');
            video.play().catch(function () {
                video.controls = true;
            });
        }

        overlay.addEventListener('click', load);
        video.addEventListener('click', function () {
            if (!loaded) {
                load();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupHomeSearch();
    });
}());
