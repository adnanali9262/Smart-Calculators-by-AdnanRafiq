/* Smart Calculators — App Style Navigation (NO browser history stacking) */

document.addEventListener('DOMContentLoaded', () => {

  const menu = document.getElementById('calculatorList');
  const menuItems = document.getElementById('menuItems');
  const menuToggleBtn = document.getElementById('menuToggleBtn');

  const aboutBtn = document.getElementById("aboutBtn");
  const aboutSection = document.getElementById("aboutContactSection");
  const backHomeBtn = document.getElementById("backHomeBtn");

  const container = document.getElementById('calculatorContainer');

  /* ---------------- APP SCREENS ---------------- */

  let currentScreen = 'menu'; // menu | main | about

  function showMenu() {
    currentScreen = 'menu';

    menu.classList.remove('menu-closed');
    aboutSection.classList.add('hidden');
    container.classList.remove('hidden');
  }

  function showMain() {
    currentScreen = 'main';

    menu.classList.add('menu-closed');
    aboutSection.classList.add('hidden');
    container.classList.remove('hidden');
  }

  function showAbout() {
    currentScreen = 'about';

    menu.classList.add('menu-closed');
    container.classList.add('hidden');
    aboutSection.classList.remove('hidden');
  }

  /* ---------------- INITIAL SCREEN ---------------- */

  showMenu(); // first time app opens → menu

  /* ---------------- BUTTON HANDLERS ---------------- */

  menuToggleBtn.addEventListener('click', () => {
    showMenu();
  });

  aboutBtn.addEventListener("click", () => {
    showAbout();
  });

  backHomeBtn.addEventListener("click", () => {
    showMenu();
  });

  /* ---------------- MOBILE BACK BUTTON ---------------- */

  // Trap browser back and convert to app navigation
  history.pushState(null, '', location.href);

  window.addEventListener('popstate', () => {

    if (currentScreen !== 'menu') {
      showMenu();
      history.pushState(null, '', location.href); // block exit
    } else {
      history.pushState(null, '', location.href); // stay on menu
    }

  });

  /* ---------------- LOAD CALCULATORS ---------------- */

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
      el.onclick = () => loadCalculator(item.file);
      menuItems.appendChild(el);
    });
  }

  async function loadCalculator(file) {
    try {
      container.innerHTML = `<div class="small">Loading…</div>`;

      const r = await fetch('calculators/' + file, { cache: 'no-store' });
      if (!r.ok) throw new Error('load failed');

      const html = await r.text();
      container.innerHTML = html;

      // execute embedded scripts
      const scripts = Array.from(container.querySelectorAll('script'));
      for (const s of scripts) {
        const ns = document.createElement('script');
        if (s.src) ns.src = s.src;
        else ns.textContent = s.textContent;
        document.body.appendChild(ns);
        s.remove();
      }

      showMain();

    } catch (err) {
      container.innerHTML = `
        <div class="result">
          <strong>Error loading calculator.</strong>
          <div class="small">${err.message}</div>
        </div>`;
      console.error(err);
    }
  }

  loadRegistry();

});
