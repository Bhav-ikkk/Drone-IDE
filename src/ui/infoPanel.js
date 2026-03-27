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

  titleEl.innerHTML = `<span class="info-icon">${desc.icon}</span> ${escapeHtml(desc.name)}`;

  let html = '';

  // Category badge
  html += `<div class="info-badge">${escapeHtml(desc.category)}</div>`;

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
        ${desc.specifications.map(s => `<tr><td class="spec-label">${escapeHtml(s.label)}</td><td class="spec-value">${escapeHtml(s.value)}</td></tr>`).join('')}
      </table>
    </div>`;
  }

  // Power States — min / mid / max
  if (desc.powerStates) {
    html += `<div class="info-section">
      <h3>⚡ Power &amp; Functionality States</h3>
      <div class="power-states-grid">
        ${renderPowerState('min', desc.powerStates.min, 'state-min')}
        ${renderPowerState('mid', desc.powerStates.mid, 'state-mid')}
        ${renderPowerState('max', desc.powerStates.max, 'state-max')}
      </div>
    </div>`;
  }

  // GLB Model Placeholder
  if (desc.glbModel) {
    html += `<div class="info-section">
      <h3>🧊 3D Model (GLB) Specification</h3>
      <div class="glb-model-card">
        <div class="glb-model-header">
          <span class="glb-icon">📦</span>
          <div class="glb-file-info">
            <div class="glb-filename">${escapeHtml(desc.glbModel.suggestedFilename)}</div>
            <div class="glb-polycount">${escapeHtml(desc.glbModel.polyCount)}</div>
          </div>
          <div class="glb-badge">GLB READY</div>
        </div>
        <p class="glb-description">${formatText(desc.glbModel.description)}</p>
        ${desc.glbModel.materials ? `
        <div class="glb-subsection">
          <div class="glb-subsection-title">🎨 Materials</div>
          <ul class="glb-list">${desc.glbModel.materials.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
        </div>` : ''}
        ${desc.glbModel.keyFeatures ? `
        <div class="glb-subsection">
          <div class="glb-subsection-title">✨ Key Visual Features</div>
          <ul class="glb-list">${desc.glbModel.keyFeatures.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>` : ''}
        <div class="glb-subsection">
          <div class="glb-subsection-title">💻 Loader Note</div>
          <p class="glb-note">${formatText(desc.glbModel.loaderNote)}</p>
        </div>
      </div>
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
  // Scroll to top after DOM is fully painted
  requestAnimationFrame(() => { bodyEl.scrollTop = 0; });
  panelEl.classList.add('open');
}

function renderPowerState(level, state, cssClass) {
  if (!state) return '';
  const levelLabels = { min: 'MIN', mid: 'MID', max: 'MAX' };
  const levelIcons = { min: '🔵', mid: '🟡', max: '🔴' };
  const metrics = state.metrics || [];

  return `<div class="power-state-card ${cssClass}">
    <div class="power-state-header">
      <span class="power-state-icon">${levelIcons[level]}</span>
      <span class="power-level-badge level-${level}">${levelLabels[level]}</span>
      <span class="power-state-label">${escapeHtml(state.label)}</span>
    </div>
    <p class="power-state-desc">${escapeHtml(state.description)}</p>
    ${metrics.length > 0 ? `
    <table class="power-metrics-table">
      ${metrics.map(m => `<tr>
        <td class="pm-label">${escapeHtml(m.label)}</td>
        <td class="pm-value">${escapeHtml(m.value)}</td>
      </tr>`).join('')}
    </table>` : ''}
  </div>`;
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
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}
