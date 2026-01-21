/* Core loader + UI control for PWA app */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- DOM REFERENCES ---------------- */

  const menuPanel = document.getElementById('calculatorList'); // whole nav
  const menuItems = document.getElementById('menuItems');      // items container

  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const backHomeBtn = document.getElementById('backHomeBtn');

  const calculatorContainer = document.getElementById('calculatorContainer');
  const aboutSection = document.getElementById('aboutContactSection');

  const installBtn = document.getElementById('installBtn');

  /* ---------------- MENU BEHAVIOR ---------------- */

  // Menu button: ONLY toggle menu
  menuToggleBtn.addEventListener('click', () => {
    menuPanel.classList.toggle('menu-closed');
  });

  /* ---------------- ABOUT PAGE ---------------- */

  aboutBtn.addEventListener('click', () => {
    menuPanel.classList.add('menu-closed');        // close menu
    calculatorContainer.classList.add('hidden');  // hide calculators
    aboutSection.classList.remove('hidden');      // show about
  });

  backHomeBtn.addEventListener('click', () => {
    aboutSection.classList.add('hidden');
    calculatorContainer.classList.remove('hidden');
  });

  /* ---------------- PWA INSTALL ---------------- */

  let deferredPrompt = null;

  const isAppInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isAppInstalled()) {
    installBtn.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isAppInstalled()) installBtn.style.display = 'inline-flex';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });

  /* ---------------- LOAD REGISTRY ---------------- */

  async function loadRegistry() {
    try {
      const r = await fetch('calculators.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('no registry');
      const list = await r.json();
      renderMenu(list);
    } catch (e) {
      const fallback = [
        { title: "DC Cable Size Calculator", desc: "Voltage-drop based sizing", file: "dc-cable.html", icon: "⚡" },
        { title: "Energy Consumption Calculator", desc: "Daily/monthly/yearly energy", file: "energy-units.html", icon: "🔋" }
      ];
      renderMenu(fallback);
    }
  }

  function renderMenu(list) {
    menuItems.innerHTML = '';

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.tabIndex = 0;

      el.innerHTML = `
        <div class="icon">${item.icon || ''}</div>
        <div class="meta">
          <div class="title">${item.title}</div>
          <div class="desc small">${item.desc}</div>
        </div>
      `;

      el.addEventListener('click', () => {
        openCalculator(item.file);
      });

      menuItems.appendChild(el);
    });
  }

  /* ---------------- LOAD CALCULATOR ---------------- */

  async function openCalculator(file) {
    try {
      aboutSection.classList.add('hidden');
      calculatorContainer.classList.remove('hidden');

      calculatorContainer.innerHTML = `<div class="small">Loading…</div>`;

      const r = await fetch('calculators/' + file, { cache: 'no-store' });
      if (!r.ok) throw new Error('load failed');

      const html = await r.text();
      calculatorContainer.innerHTML = html;

      // execute embedded scripts
      const scripts = Array.from(calculatorContainer.querySelectorAll('script'));
      for (const s of scripts) {
        const ns = document.createElement('script');
        if (s.src) ns.src = s.src;
        else ns.textContent = s.textContent;
        document.body.appendChild(ns);
        s.remove();
      }

      menuPanel.classList.add('menu-closed'); // close menu after selection
      calculatorContainer.scrollTop = 0;

    } catch (err) {
      calculatorContainer.innerHTML = `
        <div class="result">
          <strong>Error loading calculator.</strong>
          <div class="small">${err.message}</div>
        </div>
      `;
      console.error(err);
    }
  }

  /* ---------------- START ---------------- */

  loadRegistry();

});
