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

  // Media Session API için şarkı bilgilerini güncelleyen fonksiyon
  function updateMediaSession(sound) {
    if (!('mediaSession' in navigator) || !sound) {
      return; // API desteklenmiyorsa veya ses bilgisi yoksa çık
    }

    // SoundCloud'dan gelen albüm kapağını daha yüksek çözünürlüklü hale getirelim
    const artworkSrc = sound.artwork_url ? sound.artwork_url.replace('-large.jpg', '-t500x500.jpg') : '';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: sound.title,
      artist: sound.user.username || 'toufu.space',
      album: 'toufu.space playlist',
      artwork: [{ src: artworkSrc, sizes: '500x500', type: 'image/jpeg' }]
    });
  }

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

        // Windows medya kontrollerini güncelle
        updateMediaSession(sound);
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
      // --- Media Session API Entegrasyonu ---
      // Tarayıcı destekliyorsa, işletim sistemi medya kontrolleri için eylemleri ayarla
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => widget.play());
        navigator.mediaSession.setActionHandler('pause', () => widget.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => widget.prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => widget.next());
      }

      // ÖNEMLİ: Olay dinleyicilerini (bind), olayı tetikleyecek komuttan (play) ÖNCE ayarlamalıyız.
      // Bu sayede ilk şarkının PLAY olayını kaçırmamış oluruz.
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

      // Ayarları yapıp oynatıcıyı başlatalım
      widget.setVolume(lastVolume * 100);
      populatePlaylist();
      widget.play();
    });
  }, { once: true });

  // --- Olay Dinleyicileri ---
  playPauseBtn.addEventListener('click', () => widget.toggle());
  prevBtn.addEventListener('click', () => widget.prev());
  nextBtn.addEventListener('click', () => widget.next());
  playlistBtn.addEventListener('click', () => playlistBox.classList.toggle('visible'));
  playlistUL.addEventListener('click', e => {
    if (e.target.matches('li')) {
      widget.skip(parseInt(e.target.dataset.index));
    }
  });

  volumeSlider.addEventListener('input', e => {
    const newVolume = parseFloat(e.target.value);
    widget.setVolume(newVolume * 100);
    muteBtn.textContent = newVolume > 0 ? '🔊' : '🔇';
    // Sesi tekrar açmak için son ses seviyesini (0'dan büyükse) kaydet
    if (newVolume > 0) {
      lastVolume = newVolume;
    }
  });

  muteBtn.addEventListener('click', () => {
    widget.getVolume(v => { // v, 0-100 aralığındadır
      if (v > 0) { // Sesi kapatıyorsak
        widget.setVolume(0);
        volumeSlider.value = 0;
        muteBtn.textContent = '🔇';
      } else { // Sesi açıyorsak
        widget.setVolume(lastVolume * 100);
        volumeSlider.value = lastVolume;
        muteBtn.textContent = '🔊';
      }
    });
  });

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

  // Bu olay dinleyici, sesin Media Session API gibi harici bir yolla
  // değişmesi durumunda UI'ın senkronize kalmasını sağlar.
  widget.bind(SC.Widget.Events.VOLUME, (data) => {
    const newVolume = data.newVolume / 100;
    volumeSlider.value = newVolume; // Slider'ı senkronize et
    muteBtn.textContent = newVolume > 0 ? '🔊' : '🔇'; // İkonu senkronize et
  });
});