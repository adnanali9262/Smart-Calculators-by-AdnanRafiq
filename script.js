// Load calculators from JSON
fetch('calculators.json')
  .then(res => res.json())
  .then(calculators => {
    const list = document.getElementById('calculatorList');
    calculators.forEach(calc => {
      const btn = document.createElement('button');
      btn.textContent = calc.title;
      btn.onclick = () => loadCalculator(calc.file);
      list.appendChild(btn);
    });
  });

// Load a calculator dynamically
function loadCalculator(file) {
  fetch('calculators/' + file)
    .then(res => res.text())
    .then(html => {
      document.getElementById('calculatorContainer').innerHTML = html;
    });
}

// PWA install button
const installBtn = document.getElementById('installBtn');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline';
});
installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => deferredPrompt = null);
  }
});
