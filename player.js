document.addEventListener('DOMContentLoaded', () => {
  // --- Elementleri Seçelim ---
  const enterOverlay = document.getElementById('enter-overlay');
  const iframeElement = document.getElementById('soundcloud-widget');
  const mediaControls = document.getElementById('media-controls');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const muteBtn = document.getElementById('mute-btn');
  const songTitle = document.getElementById('song-title');
  const volumeSlider = document.getElementById('volume-slider');
  const playlistBtn = document.getElementById('playlist-btn');
  const playlistBox = document.getElementById('playlist-box');
  const playlistUL = document.getElementById('playlist-ul');
  const progressBar = document.getElementById('progress-bar');
  const progressBarBg = document.getElementById('progress-bar-bg');
  const timeDisplay = document.getElementById('time-display');
  
  let widget = SC.Widget(iframeElement);
  let lastVolume = 0.2;

  // --- Fonksiyonlar ---
  function updateSongInfo() {
    widget.getCurrentSound((sound) => {
      if (sound) {
        songTitle.textContent = sound.title;
        highlightCurrentTrack(sound.id);
      }
    });
  }

  function populatePlaylist() {
    widget.getSounds((sounds) => {
      playlistUL.innerHTML = '';
      sounds.forEach((sound, index) => {
        const li = document.createElement('li');
        li.textContent = sound.title;
        li.dataset.index = index;
        li.dataset.id = sound.id;
        playlistUL.appendChild(li);
      });
    });
  }

  function highlightCurrentTrack(soundId) {
    document.querySelectorAll('#playlist-ul li').forEach(item => {
      item.classList.toggle('playing', item.dataset.id == soundId);
    });
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  enterOverlay.addEventListener('click', () => {
    enterOverlay.style.opacity = '0';
    enterOverlay.addEventListener('transitionend', () => enterOverlay.style.display = 'none');
    document.body.classList.add('site-active');
    mediaControls.classList.add('visible');

    widget.bind(SC.Widget.Events.READY, () => {
      widget.setVolume(lastVolume * 100);
      populatePlaylist();
      widget.play();

      widget.bind(SC.Widget.Events.PLAY, () => { playPauseBtn.textContent = '❚❚'; updateSongInfo(); });
      widget.bind(SC.Widget.Events.PAUSE, () => { playPauseBtn.textContent = '▶'; });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (progressData) => {
        const { currentPosition, duration } = progressData;
        if (duration) {
          progressBar.style.width = `${(currentPosition / duration) * 100}%`;
          timeDisplay.textContent = `${formatTime(currentPosition)} / ${formatTime(duration)}`;
        }
      });

    });
  }, { once: true });

  // --- Olay Dinleyicileri ---
  playPauseBtn.addEventListener('click', () => widget.toggle());
  prevBtn.addEventListener('click', () => widget.prev());
  nextBtn.addEventListener('click', () => widget.next());
  playlistBtn.addEventListener('click', () => playlistBox.classList.toggle('visible'));
  playlistUL.addEventListener('click', e => { if (e.target.matches('li')) widget.skip(parseInt(e.target.dataset.index)); });
  volumeSlider.addEventListener('input', e => { lastVolume = e.target.value; widget.setVolume(lastVolume * 100); });
  muteBtn.addEventListener('click', () => { widget.getVolume(v => { if (v > 0) widget.setVolume(0); else widget.setVolume(lastVolume * 100); }); });
  progressBarBg.addEventListener('click', (e) => {
    widget.getDuration((duration) => {
      if (duration) {
        const seekPosition = (e.offsetX / progressBarBg.clientWidth) * duration;
        widget.seekTo(seekPosition);
      }
    });
  });
  widget.bind(SC.Widget.Events.VOLUME, (data) => { muteBtn.textContent = data.newVolume > 0 ? '🔊' : '🔇'; });
});