/* Core loader + UI control for PWA app
   - dynamically loads calculator HTML from /calculators/
   - executes embedded scripts
   - collapses menu and handles install prompt
*/

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('calculatorList');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const installBtn = document.getElementById('installBtn');
  const container = document.getElementById('calculatorContainer');

  // Toggle menu open/close
  menuToggleBtn.addEventListener('click', () => {
    // toggle display state robustly
    if (menu.classList.contains('menu-closed')) {
      menu.classList.remove('menu-closed');
    } else {
      menu.classList.add('menu-closed');
    }
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
      alert('Install not available. Use browser menu to Install or open via Chrome on Android.');
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
    console.log('User choice', choice);
  });

  // Try to load calculators.json; fallback to built-in list
  async function loadRegistry() {
    try {
      const r = await fetch('/calculators.json', {cache: 'no-store'});
      if(!r.ok) throw new Error('no registry');
      const list = await r.json();
      renderMenu(list);
      if (list.length) loadCalculator(list[0].file);
    } catch (e) {
      const fallback = [
        { title: "DC Cable Size Calculator", desc: "Voltage-drop based conductor sizing (copper)", file: "dc-cable.html", icon: "⚡" },
        { title: "Energy Consumption Calculator", desc: "Daily/monthly/yearly energy & cost", file: "energy-units.html", icon: "🔋" }
      ];
      renderMenu(fallback);
      loadCalculator(fallback[0].file);
    }
  }

  function renderMenu(list) {
    menu.innerHTML = '';
    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.tabIndex = 0;
      el.innerHTML = `<div class="icon">${item.icon||'🧮'}</div>
                      <div class="meta"><div class="title">${item.title}</div><div class="desc small">${item.desc}</div></div>`;
      el.onclick = () => loadCalculator(item.file);
      el.onkeypress = (ev) => { if(ev.key==='Enter') loadCalculator(item.file); };
      menu.appendChild(el);
    });
  }

  async function loadCalculator(file) {
    try {
      container.innerHTML = `<div class="small">Loading…</div>`;
      const r = await fetch('/calculators/' + file, {cache: 'no-store'});
      if(!r.ok) throw new Error('load failed');
      const html = await r.text();
      container.innerHTML = html;

      // Execute embedded scripts
      const scripts = Array.from(container.querySelectorAll('script'));
      for (const s of scripts) {
        const ns = document.createElement('script');
        if (s.src) {
          ns.src = s.src;
          ns.async = false;
        } else {
          ns.textContent = s.textContent;
        }
        document.body.appendChild(ns);
        s.remove();
      }

      // close menu and reset scroll
      menu.classList.add('menu-closed');
      container.scrollTop = 0;
    } catch (err) {
      container.innerHTML = `<div class="result"><strong>Error loading calculator.</strong><div class="small">${err.message}</div></div>`;
      console.error(err);
    }
  }

  // Start
  loadRegistry();
});
