/* ========= Smart Calculators App Navigation + Loader ========= */

document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("calculatorList");
  const menuItemsBox = document.getElementById("menuItems");
  const menuBtn = document.getElementById("menuToggleBtn");

  const aboutBtn = document.getElementById("aboutBtn");

  const content = document.getElementById("calculatorContainer");
  const aboutSection = document.getElementById("aboutContactSection");

  /* ---------------- Screen State Manager ---------------- */

  function showMenu() {
    menu.classList.remove("menu-closed");
    content.classList.add("hidden");
    aboutSection.classList.add("hidden");
  }

  function showCalculator() {
    menu.classList.add("menu-closed");
    content.classList.remove("hidden");
    aboutSection.classList.add("hidden");
  }

  function showAbout() {
    menu.classList.add("menu-closed");
    content.classList.add("hidden");
    aboutSection.classList.remove("hidden");
  }

  /* ---------------- History Handling ---------------- */

  function pushState(state) {
    history.pushState({ screen: state }, "");
  }

  window.addEventListener("popstate", (e) => {
    const s = e.state?.screen || "menu";

    if (s === "menu") showMenu();
    if (s === "about") showAbout();
  });

  /* ---------------- Menu Button ---------------- */

  menuBtn.addEventListener("click", () => {
    showMenu();
    pushState("menu");
  });

  /* ---------------- About Button ---------------- */

  aboutBtn.addEventListener("click", () => {
    showAbout();
    pushState("about");
  });

  /* ---------------- Load Calculator Registry ---------------- */

  async function loadRegistry() {
    try {
      const r = await fetch("calculators.json", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const list = await r.json();
      renderMenu(list);
    } catch {
      renderMenu([
        { title: "DC Cable Size Calculator", desc: "Voltage-drop based sizing", file: "dc-cable.html", icon: "⚡" },
        { title: "Energy Consumption Calculator", desc: "Daily/monthly/yearly energy", file: "energy-units.html", icon: "🔋" }
      ]);
    }
  }

  function renderMenu(list) {
    menuItemsBox.innerHTML = "";

    list.forEach(item => {
      const el = document.createElement("div");
      el.className = "menu-item";
      el.innerHTML = `
        <div class="icon">${item.icon || ""}</div>
        <div class="meta">
          <div class="title">${item.title}</div>
          <div class="desc small">${item.desc}</div>
        </div>
      `;

      el.addEventListener("click", () => loadCalculator(item.file));
      menuItemsBox.appendChild(el);
    });
  }

  /* ---------------- Load Calculator (NO HISTORY) ---------------- */

  async function loadCalculator(file) {
    try {
      showCalculator();   // show content but do NOT push history

      content.innerHTML = `<div class="small">Loading…</div>`;

      const r = await fetch("calculators/" + file, { cache: "no-store" });
      if (!r.ok) throw new Error("Load failed");

      const html = await r.text();
      content.innerHTML = html;

      // run embedded scripts
      const scripts = content.querySelectorAll("script");
      scripts.forEach(s => {
        const ns = document.createElement("script");
        if (s.src) ns.src = s.src;
        else ns.textContent = s.textContent;
        document.body.appendChild(ns);
        s.remove();
      });

      content.scrollTop = 0;

    } catch (err) {
      content.innerHTML = `
        <div class="result">
          <strong>Error loading calculator</strong>
          <div class="small">${err.message}</div>
        </div>`;
    }
  }

  /* ---------------- Initial App State ---------------- */

  history.replaceState({ screen: "menu" }, "");
  showMenu();
  loadRegistry();

});
