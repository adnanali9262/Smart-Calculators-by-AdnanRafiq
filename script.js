function openCalculator(type) {
  const content = document.getElementById('content');
  if (type === 'cable') {
    content.innerHTML = `
      <div class="calculator">
        <h2>⚡ DC Cable Size Calculator</h2>

        <label>System Voltage (V)</label>
        <input type="number" id="voltage" placeholder="e.g. 24">

        <label>Current (A)</label>
        <input type="number" id="current" placeholder="e.g. 20">

        <label>Cable Length One-Way (m)</label>
        <input type="number" id="length" placeholder="e.g. 30">

        <label>Max Voltage Drop (%)</label>
        <input type="number" id="vdrop" placeholder="e.g. 3">

        <button class="calculate-btn" onclick="calculateCable()">Calculate</button>

        <div class="result" id="cableResult"></div>
      </div>`;
  }

  if (type === 'energy') {
    content.innerHTML = `
      <div class="calculator">
        <h2>🔋 Energy Consumption Calculator</h2>

        <label>Input Mode</label>
        <select id="mode" onchange="toggleInputMode()">
          <option value="watts">Power in Watts</option>
          <option value="amps">Current, Voltage & PF</option>
        </select>

        <div id="wattsInput">
          <label>Power (Watts)</label>
          <input type="number" id="powerWatts" placeholder="e.g. 220">
        </div>

        <div id="ampInput" style="display:none;">
          <label>Current (Amps)</label>
          <input type="number" id="currentAmp" placeholder="e.g. 1">

          <label>Voltage (Volts)</label>
          <input type="number" id="voltageAmp" placeholder="e.g. 220">

          <label>Power Factor</label>
          <input type="number" id="pf" value="0.9" min="0.1" max="1" step="0.01">
        </div>

        <label>Hours per Day</label>
        <input type="number" id="hoursPerDay" value="24">

        <label>Days</label>
        <input type="number" id="days" value="30">

        <button class="calculate-btn" onclick="calculateEnergy()">Calculate</button>
        <div class="result" id="energyResult"></div>
      </div>`;
  }
}

function calculateCable() {
  const V = parseFloat(document.getElementById('voltage').value);
  const I = parseFloat(document.getElementById('current').value);
  const L = parseFloat(document.getElementById('length').value);
  const vdropPct = parseFloat(document.getElementById('vdrop').value);

  if (isNaN(V) || isNaN(I) || isNaN(L) || isNaN(vdropPct)) {
    document.getElementById('cableResult').innerHTML = '<span style="color:red;">Fill all fields correctly.</span>';
    return;
  }

  const rho = 0.017; // copper resistivity
  const Vdrop = V * (vdropPct / 100);
  const A = (2 * rho * I * L) / Vdrop;
  const A_rounded = Math.ceil(A * 10) / 10;

  document.getElementById('cableResult').innerHTML = `
  <strong>✅ Required Cable Size:</strong> ${A_rounded} mm² (Copper)
  \n\nFormula: A = (2 × ρ × I × L) / Vdrop
  \nρ = 0.017 Ω·mm²/m
  \nA = (2 × 0.017 × ${I} × ${L}) / ${Vdrop.toFixed(2)} = ${A.toFixed(2)} mm²
  \nRecommended Size: ${A_rounded} mm²`;
}

function toggleInputMode() {
  const mode = document.getElementById('mode').value;
  document.getElementById('wattsInput').style.display = mode === 'watts' ? 'block' : 'none';
  document.getElementById('ampInput').style.display = mode === 'amps' ? 'block' : 'none';
}

function calculateEnergy() {
  const mode = document.getElementById('mode').value;
  const hours = parseFloat(document.getElementById('hoursPerDay').value);
  const days = parseFloat(document.getElementById('days').value);
  let powerW = 0;
  let steps = "";

  if (mode === 'watts') {
    powerW = parseFloat(document.getElementById('powerWatts').value);
    if (isNaN(powerW)) {
      alert("Enter valid power.");
      return;
    }
    steps += `1. Power = ${powerW} W`;
  } else {
    const current = parseFloat(document.getElementById('currentAmp').value);
    const voltage = parseFloat(document.getElementById('voltageAmp').value);
    const pf = parseFloat(document.getElementById('pf').value);

    if (isNaN(current) || isNaN(voltage) || isNaN(pf)) {
      alert("Enter valid current, voltage and PF.");
      return;
    }

    powerW = current * voltage * pf;
    steps += `1. Power = ${current} × ${voltage} × ${pf} = ${powerW.toFixed(2)} W`;
  }

  const powerKW = powerW / 1000;
  const totalEnergy = powerKW * hours * days;

  steps += `\n2. Energy = ${powerKW.toFixed(3)} × ${hours} × ${days} = ${totalEnergy.toFixed(3)} kWh`;

  document.getElementById('energyResult').innerHTML = steps +
    `\n\n<div class='highlight-box'>✅ Total Energy: ${totalEnergy.toFixed(3)} kWh</div>`;
}
