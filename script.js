/* Core loader + UI control for PWA app */

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('calculatorList');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const installBtn = document.getElementById('installBtn');
  const container = document.getElementById('calculatorContainer');

  // Toggle menu open/close
  menuToggleBtn.addEventListener('click', () => {
    menu.classList.toggle('menu-closed');
  });

  // --------------------------
  // PWA Install Button Handling
  // --------------------------
  let deferredPrompt = null;

  // Detect if app is already installed (Android & iOS)
  const isAppInstalled = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches || // Android
      window.navigator.standalone === true                        // iOS
    );
  };

  // Only show Install button if app is NOT installed
  if (!isAppInstalled()) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Prevent automatic prompt
      deferredPrompt = e;
      installBtn.style.display = 'inline-block'; // Show button
    });
  } else {
    installBtn.style.display = 'none';
  }

  // Handle Install button click
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('Install not available.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  // Hide button after app is installed
  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    console.log('PWA installed successfully');
  });

  // --------------------------
  // Load calculators.json registry
  // --------------------------
  async function loadRegistry() {
    try {
      const r = await fetch('calculators.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('no registry');
      const list = await r.json();
      renderMenu(list);
      // **NO AUTO LOAD HERE**
    } catch (e) {
      const fallback = [
        { title: "DC Cable Size Calculator", desc: "Voltage-drop based sizing", file: "dc-cable.html", icon: "⚡" },
        { title: "Energy Consumption Calculator", desc: "Daily/monthly/yearly energy", file: "energy-units.html", icon: "🔋" }
      ];
      renderMenu(fallback);
      // **NO AUTO LOAD HERE**
    }
  }

  function renderMenu(list) {
    menu.innerHTML = '';
    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.tabIndex = 0;
      el.innerHTML = `
        <div class="icon">${item.icon||''}</div>
        <div class="meta">
          <div class="title">${item.title}</div>
          <div class="desc small">${item.desc}</div>
        </div>
      `;
      el.onclick = () => loadCalculator(item.file);
      menu.appendChild(el);
    });
  }

  async function loadCalculator(file) {
    try {
      container.innerHTML = `<div class="small">Loading…</div>`;
      const r = await fetch('calculators/' + file, { cache: 'no-store' });
      if (!r.ok) throw new Error('load failed');
      const html = await r.text();
      container.innerHTML = html;

      // Execute embedded scripts
      const scripts = Array.from(container.querySelectorAll('script'));
      for (const s of scripts) {
        const ns = document.createElement('script');
        if (s.src) ns.src = s.src;
        else ns.textContent = s.textContent;
        document.body.appendChild(ns);
        s.remove();
      }

      // Close menu
      menu.classList.add('menu-closed');
      container.scrollTop = 0;
    } catch (err) {
      container.innerHTML = `<div class="result"><strong>Error loading calculator.</strong><div class="small">${err.message}</div></div>`;
      console.error(err);
    }
  }

  // Start registry (no auto calculator load)
  loadRegistry();
});

// --------------------------
// About / Contact section toggle
// --------------------------
const aboutBtn = document.getElementById("aboutBtn");
const aboutSection = document.getElementById("aboutContactSection");
const backHomeBtn = document.getElementById("backHomeBtn");

const calculatorContainer = document.getElementById("calculatorContainer");

aboutBtn.addEventListener("click", () => {
  calculatorContainer.classList.add("hidden");
  aboutSection.classList.remove("hidden");
});

backHomeBtn.addEventListener("click", () => {
  aboutSection.classList.add("hidden");
  calculatorContainer.classList.remove("hidden");
});
