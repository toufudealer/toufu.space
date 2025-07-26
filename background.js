window.addEventListener('DOMContentLoaded', () => {
  const backgrounds = [
    './resources/backgrounds/fumo.jpg',
    './resources/backgrounds/sago.jpg',
    './resources/backgrounds/aigis.jpg',
    './resources/backgrounds/yes.jpg',
    './resources/backgrounds/ambatukam.jpg',
    './resources/backgrounds/cem.jpg'
  ];

  const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const bgDiv = document.querySelector('.background-container');
  if (bgDiv) {
    bgDiv.style.backgroundImage = `url('${randomBg}')`;
  }
});