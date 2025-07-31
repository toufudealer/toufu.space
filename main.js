document.addEventListener('DOMContentLoaded', () => {
  // --- Ortak Head Elemanlarını Ekle ---
  const head = document.head;

  // Tüm sayfalara favicon ekle
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/png';
  faviconLink.href = './resources/svg/osaka.png';
  head.appendChild(faviconLink);

  // --- Sayfa Özel Etkileşimler ---

  // Sadece index.html'de bulunan butonlar için olay dinleyicileri
  const yesBtn = document.getElementById('yes-btn');
  if (yesBtn) {
    yesBtn.addEventListener('click', () => { window.location.href = 'yes.html'; });
  }

  const yesWhatBtn = document.getElementById('yes-what-btn');
  if (yesWhatBtn) {
    yesWhatBtn.addEventListener('click', () => { window.location.href = 'yeswhat.html'; });
  }
});