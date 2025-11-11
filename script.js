/* Core loader + UI control for PWA app
   - dynamically loads calculator HTML from /calculators/
   - executes embedded scripts
   - collapses menu and handles install prompt
*/

const menu = document.getElementById('calculatorList');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const installBtn = document.getElementById('installBtn');
const container = document.getElementById('calculatorContainer');

// Toggle menu open/close
menuToggleBtn.addEventListener('click', () => {
  menu.classList.toggle('menu-closed');
});

// Install prompt handling
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) {
    alert('Install not available. Use browser menu to Install or open via HTTPS on supported browsers.');
    return;
  }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
  console.log('User choice', choice);
});

// Load calculators registry (calculators.json)
async function loadRegistry() {
  try {
    const r = await fetch('/calculators.json', {cache: 'no-store'});
    if (!r.ok) throw new Error('Registry load failed');
    const list = await r.json();
    renderMenu(list);
    if (list.length) loadCalculator(list[0].file);
  } catch (e) {
    // fallback: minimal built-in list if calculators.json missing
    console.warn(e);
    const fallback = [
      { title: "DC Cable Size Calculator", desc: "Voltage-drop based conductor sizing", file: "dc-cable.html", icon: "⚡" },
      { title: "Energy Consumption Calculator", desc: "Daily/monthly/yearly energy & cost", file: "energy-units.html", icon: "🔋" }
    ];
    renderMenu(fallback);
  }
}

// Render left menu
function renderMenu(list) {
  menu.innerHTML = '';
  list.forEach(item => {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.innerHTML = `<div class="icon">${item.icon||'🧮'}</div>
                    <div class="meta"><div class="title">${item.title}</div><div class="desc small">${item.desc}</div></div>`;
    el.onclick = () => loadCalculator(item.file);
    menu.appendChild(el);
  });
}

// Load calculator file and run scripts
async function loadCalculator(file) {
  try {
    container.innerHTML = `<div class="small">Loading…</div>`;
    const r = await fetch('/calculators/' + file, {cache: 'no-store'});
    if (!r.ok) throw new Error('Load failed');
    const html = await r.text();
    container.innerHTML = html;

    // Run embedded scripts: copy content to new <script> nodes appended to body
    const scripts = Array.from(container.querySelectorAll('script'));
    for (const s of scripts) {
      const ns = document.createElement('script');
      if (s.src) {
        ns.src = s.src;
        // preserve async behavior
        ns.async = false;
      } else {
        ns.textContent = s.textContent;
      }
      document.body.appendChild(ns);
      s.remove();
    }

    // close menu and give focus to content
    menu.classList.add('menu-closed');
    container.scrollTop = 0;
  } catch (err) {
    container.innerHTML = `<div class="result"><strong>Error loading calculator.</strong><div class="small">${err.message}</div></div>`;
    console.error(err);
  }
}

// start
loadRegistry();
