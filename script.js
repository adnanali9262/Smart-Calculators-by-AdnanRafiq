/* Core loader + UI control for PWA app with proper navigation */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- DOM REFERENCES ---------------- */

  const menuPanel = document.getElementById('calculatorList'); // nav
  const menuItems = document.getElementById('menuItems');

  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const backHomeBtn = document.getElementById('backHomeBtn');

  const calculatorContainer = document.getElementById('calculatorContainer');
  const aboutSection = document.getElementById('aboutContactSection');

  const installBtn = document.getElementById('installBtn');

  /* ---------------- VIEW CONTROL ---------------- */

  function showMenu(push = true) {
    menuPanel.classList.remove('menu-closed');
    calculatorContainer.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (push) history.pushState({ view: 'menu' }, '');
  }

  function showCalculator(push = true) {
    menuPanel.classList.add('menu-closed');
    calculatorContainer.classList.remove('hidden');
    aboutSection.classList.add('hidden');
    if (push) history.pushState({ view: 'calculator' }, '');
  }

  function showAbout(push = true) {
    menuPanel.classList.add('menu-closed');
    calculatorContainer.classList.add('hidden');
    aboutSection.classList.remove('hidden');
    if (push) history.pushState({ view: 'about' }, '');
  }

  /* ---------------- BUTTON ACTIONS ---------------- */

  menuToggleBtn.addEventListener('click', () => {
    showMenu();
  });

  aboutBtn.addEventListener('click', () => {
    showAbout();
  });

  backHomeBtn.addEventListener('click', () => {
    showCalculator();
  });

  /* ---------------- ANDROID BACK BUTTON ---------------- */

  window.addEventListener('popstate', (e) => {
    if (!e.state) return;

    if (e.state.view === 'menu') showMenu(false);
    else if (e.state.view === 'about') showAbout(false);
    else showCalculator(false);
  });

  // initial state
  history.replaceState({ view: 'calculator' }, '');

  /* ---------------- PWA INSTALL ---------------- */

  let deferredPrompt = null;

  const isAppInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isAppInstalled()) installBtn.style.display = 'none';

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

      el.addEventListener('click', () => openCalculator(item.file));
      menuItems.appendChild(el);
    });
  }

  /* ---------------- LOAD CALCULATOR ---------------- */

  async function openCalculator(file) {
    try {
      showCalculator(); // closes menu + about

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
/* ---------------- FEEDBACK ---------------- */

const feedbackForm = document.getElementById('feedbackForm');
const githubBtn = document.getElementById('githubFeedbackBtn');

if (feedbackForm) {

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fbName').value.trim();
    const msg = document.getElementById('fbMsg').value.trim();

    if (!msg) return;

    const subject = encodeURIComponent('Smart Calculators App Feedback');
    const body = encodeURIComponent(
      `Name: ${name || 'Anonymous'}\n\nFeedback:\n${msg}`
    );

    // opens email app
    window.location.href =
      `mailto:adnan.rafiq173@gmail.com?subject=${subject}&body=${body}`;
  });

  githubBtn.addEventListener('click', () => {
    const name = document.getElementById('fbName').value.trim();
    const msg = document.getElementById('fbMsg').value.trim();

    const title = encodeURIComponent('App Feedback');
    const body = encodeURIComponent(
      `**Name:** ${name || 'Anonymous'}\n\n**Feedback:**\n${msg || 'Write your feedback here...'}`
    );

    githubBtn.href =
      `https://github.com/adnanali9262/Smart-Calculators-by-AdnanRafiq/issues/new?title=${title}&body=${body}`;
  });
}

});
