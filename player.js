document.addEventListener('DOMContentLoaded', () => {
  // --- Elementleri Seçelim ---
  const enterOverlay = document.getElementById('enter-overlay');
  const iframeElement = document.getElementById('soundcloud-widget');
  const playerUiContainer = document.getElementById('player-ui-container');
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
  let currentDuration = 0;

  // --- Fonksiyonlar ---
  function updateSongInfo() {
    widget.getCurrentSound((sound) => {
      if (sound) {
        songTitle.textContent = sound.title;
        highlightCurrentTrack(sound.id);
        // Yeni şarkı başladığında ilerleme çubuğunu ve zamanı anında sıfırla.
        progressBar.style.width = '0%';
        // Süreyi alıp hem arayüzü güncelle hem de ileride kullanmak üzere sakla
        widget.getDuration((duration) => {
          currentDuration = duration || 0;
          timeDisplay.textContent = `0:00 / ${formatTime(currentDuration)}`;
        });
      }
    });
  }

  function populatePlaylist() {
    widget.getSounds((sounds) => {
      playlistUL.innerHTML = '';
      playlistBox.classList.remove('populated'); // Önce temizle
      sounds.forEach((sound, index) => {
        const li = document.createElement('li');
        li.textContent = sound.title;
        li.dataset.index = index;
        li.dataset.id = sound.id;
        playlistUL.appendChild(li);
      });
      // "F5 atınca bozulma" sorununu kalıcı olarak çözmek için:
      // Tarayıcının listeyi çizmesi için bir sonraki "frame"i bekliyoruz.
      // Ardından, metinleri kısaltan CSS'i tetikleyecek sınıfı ekliyoruz.
      // Bu, tarayıcının düzeni her zaman doğru hesaplamasını sağlar.
      requestAnimationFrame(() => {
        playlistBox.classList.add('populated');
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
    playerUiContainer.classList.add('visible');

    widget.bind(SC.Widget.Events.READY, () => {
      widget.setVolume(lastVolume * 100);
      populatePlaylist();
      widget.play();

      widget.bind(SC.Widget.Events.PLAY, () => { playPauseBtn.textContent = '❚❚'; updateSongInfo(); });
      widget.bind(SC.Widget.Events.PAUSE, () => { playPauseBtn.textContent = '▶'; });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (progressData) => {
        const { currentPosition } = progressData;
        // Sadece sakladığımız toplam süre geçerli bir değerse arayüzü güncelle.
        if (currentDuration) {
          const percentage = (currentPosition / currentDuration) * 100;
          progressBar.style.width = `${percentage}%`;
          timeDisplay.textContent = `${formatTime(currentPosition)} / ${formatTime(currentDuration)}`;
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
        const barWidth = progressBarBg.clientWidth;
        const clickX = e.offsetX;
        const seekPercentage = clickX / barWidth;
        const seekPosition = duration * seekPercentage;
        // Anında görsel geri bildirim için arayüzü hemen güncelle
        progressBar.style.width = `${seekPercentage * 100}%`;
        timeDisplay.textContent = `${formatTime(seekPosition)} / ${formatTime(duration)}`;
        // SoundCloud oynatıcısını yeni konuma atla
        widget.seekTo(seekPosition);
      }
    });
  });
  widget.bind(SC.Widget.Events.VOLUME, (data) => { muteBtn.textContent = data.newVolume > 0 ? '🔊' : '🔇'; });
});