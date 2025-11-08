// Load calculators from JSON and create cards
fetch('calculators.json')
  .then(res => res.json())
  .then(calculators => {
    const list = document.getElementById('calculatorList');
    calculators.forEach(calc => {
      const card = document.createElement('div');
      card.className = 'calculator-card';
      card.innerHTML = `<h3>${calc.title}</h3><p>${calc.desc}</p>`;
      card.onclick = () => loadCalculator(calc.file);
      list.appendChild(card);
    });
  });

// Load calculator HTML dynamically and execute embedded scripts
function loadCalculator(file) {
  fetch('calculators/' + file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById('calculatorContainer');
      container.innerHTML = html;

      // Execute embedded <script> tags manually
      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);  // append to body to execute
        oldScript.remove(); // optional: remove the original script tag
      });
    });
}
