import { H as Hls } from './hls.js';

function attachVideo(video) {
  if (!video || video.dataset.ready === '1') {
    return;
  }

  var url = video.getAttribute('data-url');
  if (!url) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    video._hls = hls;
  } else {
    video.src = url;
  }

  video.controls = true;
  video.dataset.ready = '1';
}

function startPlayer(box) {
  var video = box.querySelector('video');
  attachVideo(video);
  box.classList.add('is-playing');
  if (video) {
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 250);
      });
    }
  }
}

document.querySelectorAll('[data-player]').forEach(function (box) {
  var video = box.querySelector('video');
  var trigger = box.querySelector('[data-play-trigger]');

  if (trigger) {
    trigger.addEventListener('click', function () {
      startPlayer(box);
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer(box);
      }
    });
  }
});
