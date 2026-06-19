function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movieVideo');
  var playLayer = document.getElementById('playLayer');
  var hlsInstance = null;
  var prepared = false;

  if (!video || !sourceUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function play() {
    prepare();

    if (playLayer) {
      playLayer.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (playLayer) {
          playLayer.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playLayer) {
    playLayer.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (playLayer) {
      playLayer.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (playLayer) {
      playLayer.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
