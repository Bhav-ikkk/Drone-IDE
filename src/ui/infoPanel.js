import { getPartDescription } from '../drone/partDescriptions.js';

let panelEl, titleEl, bodyEl, closeBtn;
let selectedPartId = null;
let onCloseCallback = null;

export function initInfoPanel(onClose) {
  panelEl = document.getElementById('info-panel');
  titleEl = document.getElementById('info-title');
  bodyEl = document.getElementById('info-body');
  closeBtn = document.getElementById('info-close-btn');
  onCloseCallback = onClose || null;

  closeBtn.addEventListener('click', hideInfoPanel);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideInfoPanel();
  });
}

export function showPartInfo(partId) {
  const desc = getPartDescription(partId);
  if (!desc) return;

  selectedPartId = partId;

  titleEl.innerHTML = `<span class="info-icon">${desc.icon}</span> ${desc.name}`;

  let html = '';

  // Category badge
  html += `<div class="info-badge">${desc.category}</div>`;

  // Overview
  html += `<div class="info-section">
    <h3>📖 Overview</h3>
    <p>${formatText(desc.overview)}</p>
  </div>`;

  // Specifications
  if (desc.specifications) {
    html += `<div class="info-section">
      <h3>📐 Specifications</h3>
      <table class="info-specs">
        ${desc.specifications.map(s => `<tr><td class="spec-label">${s.label}</td><td class="spec-value">${s.value}</td></tr>`).join('')}
      </table>
    </div>`;
  }

  // Why Chosen
  html += `<div class="info-section">
    <h3>✅ Why This Component</h3>
    <p>${formatText(desc.whyChosen)}</p>
  </div>`;

  // Use Case
  html += `<div class="info-section">
    <h3>🎯 Use Case</h3>
    <p>${formatText(desc.useCase)}</p>
  </div>`;

  // Alternatives
  if (desc.alternatives) {
    html += `<div class="info-section">
      <h3>🔄 Alternatives</h3>
      <div class="info-alternatives">
        ${desc.alternatives.map(a => `<div class="alt-item"><strong>${escapeHtml(a.name)}</strong><span>${escapeHtml(a.desc)}</span></div>`).join('')}
      </div>
    </div>`;
  }

  // Failure Modes
  if (desc.failureModes) {
    html += `<div class="info-section">
      <h3>⚠️ When It Can Break</h3>
      <ul class="info-list warning-list">${desc.failureModes.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
    </div>`;
  }

  // Limitations
  if (desc.limitations) {
    html += `<div class="info-section">
      <h3>🚫 Limitations</h3>
      <ul class="info-list">${desc.limitations.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
    </div>`;
  }

  // Positives
  if (desc.positives) {
    html += `<div class="info-section">
      <h3>💪 Strengths &amp; Positives</h3>
      <ul class="info-list positive-list">${desc.positives.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
    </div>`;
  }

  // Assembly Tips
  if (desc.assemblyTips) {
    html += `<div class="info-section assembly-section">
      <h3>🔧 Assembly Tips</h3>
      <p>${formatText(desc.assemblyTips)}</p>
    </div>`;
  }

  bodyEl.innerHTML = html;
  panelEl.classList.add('open');
}

export function hideInfoPanel() {
  panelEl.classList.remove('open');
  selectedPartId = null;
  if (onCloseCallback) onCloseCallback();
}

export function getSelectedPartId() {
  return selectedPartId;
}

export function isInfoPanelOpen() {
  return panelEl && panelEl.classList.contains('open');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}
